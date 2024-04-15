package com.example.eircare_backend.controller;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.eircare_backend.dto.DaySchedule;
import com.example.eircare_backend.dto.TimeSlot;
import com.example.eircare_backend.model.Appointment;
import com.example.eircare_backend.model.DoctorAvailability;
import com.example.eircare_backend.model.DoctorBreak;
import com.example.eircare_backend.repository.AppointmentRepository;
import com.example.eircare_backend.repository.DoctorAvailablityRepository;
import com.example.eircare_backend.repository.DoctorBreakRepository;
import com.example.eircare_backend.repository.DoctorRepository;
import com.example.eircare_backend.repository.PatientRepository;
import com.example.eircare_backend.model.User;
import com.example.eircare_backend.TokenChecker;
import com.example.eircare_backend.service.AppointmentService;
import com.example.eircare_backend.service.WebhookService;

import io.jsonwebtoken.Claims;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailablityRepository doctorAvailabilityRepository;
    private final DoctorBreakRepository doctorBreakRepository;
    private final PatientRepository patientRepository;
    private final TokenChecker tokenChecker;
    private final AppointmentService appointmentService;
    private final WebhookService webhookService;

    public AppointmentController(AppointmentRepository appointmentRepository, DoctorRepository doctorRepository, DoctorAvailablityRepository doctorAvailabilityRepository, DoctorBreakRepository doctorBreakRepository, PatientRepository patientRepository, AppointmentService appointmentService, TokenChecker tokenChecker, WebhookService webhookService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
        this.doctorBreakRepository = doctorBreakRepository;
        this.patientRepository = patientRepository;
        this.appointmentService = appointmentService;
        this.tokenChecker = tokenChecker;
        this.webhookService = webhookService;
    }

    @GetMapping
    public List<Appointment> getAllAppointments(@RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.roleRequired(tokenHeader, User.Role.ADMIN);
        appointmentService.checkForAppointmentsCompleted();
        return appointmentRepository.findAll();
    }

    @GetMapping("/doctor/{id}")
    public List<Appointment> getAppointmentsByDoctorId(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.roleRequired(tokenHeader, User.Role.DOCTOR);
        tokenChecker.idRequired(tokenHeader, User.Role.DOCTOR, id);

        appointmentService.checkForAppointmentsCompleted();
        return appointmentRepository.findByDoctorId(id);
    }

    @GetMapping("/patient/{id}")
    public List<Appointment> getAppointmentsByPatientId(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.validTokenRequired(tokenHeader);
        tokenChecker.roleRequired(tokenHeader, User.Role.PATIENT);
        tokenChecker.idRequired(tokenHeader, User.Role.PATIENT, id);

        System.out.println(id);

//TODO: patients can accesss other patiens appointments rn
        appointmentService.checkForAppointmentsCompleted();
        return appointmentRepository.findByPatientId(id);
    }

    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment, @RequestHeader("Authorization") String tokenHeader) {
            Claims claims = tokenChecker.validTokenRequired(tokenHeader);
            String role = claims.get("role", String.class);

            if (!"DOCTOR".equals(role) && !"PATIENT".equals(role)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User not authorised");
            }

            // patients can only book appointments for themselves VERTY IMPORTANT lol
            if ("PATIENT".equals(role)) {

                if (appointment.getPatient() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient required");
                }
                tokenChecker.idRequired(tokenHeader, User.Role.PATIENT, appointment.getPatient().getId());
            }

            if (!appointment.isNeedsTranslator()) {
                appointment.setTranslatorLanguage(null);
            } else {
                appointment.setTranslatorLanguage(appointment.getTranslatorLanguage().trim());
            }

            int duration;

            if (appointment.getConsultationType() != null) {
                duration = appointment.getConsultationType().getAppointmentDuration();
            } else if (appointment.getAppointmentDuration() != null) {
                duration = appointment.getAppointmentDuration();
            } else {
                duration = 15; //default to 15 just incase
            }

            if (appointment.getAppointmentStart().isBefore(LocalDateTime.now())) {

                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot book a slot in the past");
            }

            List<Appointment> overlapping = appointmentRepository.findOverlappingAppointments(

                appointment.getDoctor().getId(),
                appointment.getAppointmentStart(),
                appointment.getAppointmentStart().plusMinutes(duration),
                List.of(Appointment.AppointmentStatus.CANCELLED));

            if (!overlapping.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Timeslot is already booked");
            }

            LocalDateTime appointmentStart = appointment.getAppointmentStart();
            LocalDateTime appointmentEnd = appointmentStart.plusMinutes(duration);
            appointment.setAppointmentEnd(appointmentEnd);

        if (doctorRepository.findById(appointment.getDoctor().getId()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor does not exist");
        }
        if (appointment.getPatient() != null && patientRepository.findById(appointment.getPatient().getId()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient does not exist");
        }
        Appointment saved = appointmentRepository.save(appointment);

        webhookService.notifyAppointmentBooked(saved);
        return saved;
    }

    @GetMapping("/{id}/virtual-appointment-room")
    public Map<String, String> getVirtualAppointmentRoom(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {
        Claims claims = tokenChecker.validTokenRequired(tokenHeader);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        String emailRequest  = claims.getSubject();
        boolean isAssignedDoctor = emailRequest.equals(appointment.getDoctor().getUser().getEmail());

        boolean isAssignedPatient = appointment.getPatient() != null &&
                emailRequest.equals(appointment.getPatient().getUser().getEmail());

        if (!isAssignedDoctor && !isAssignedPatient) {
            throw new RuntimeException("Role not authorized");
        }

        //Makes it so doctor has to startr the appointment
        //Future work (for report) would definitely include proper jwt validation
        if (isAssignedDoctor) {
            if (appointment.getRoomName() == null || appointment.getRoomName().isBlank()) {
                appointment.setRoomName("eircare-" + UUID.randomUUID().toString().replace("-", ""));
            }
            appointmentRepository.save(appointment);
            return Map.of("roomName", appointment.getRoomName(), "role", "DOCTOR");
        }

        if (appointment.getRoomName() == null || appointment.getRoomName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Doctor has not started the appointment yet");
        }

        return Map.of("roomName", appointment.getRoomName(), "role", "PATIENT");
    }

    @GetMapping("/doctor/{id}/timeslots")
    public List<DaySchedule> getAppointmentSlotsByWeek(@PathVariable Long id, @RequestParam String weekStart, @RequestParam String weekEnd, @RequestHeader("Authorization") String tokenHeader) {
        
        tokenChecker.validTokenRequired(tokenHeader);

        appointmentService.checkForAppointmentsCompleted();

        //Formant "2024-01-01"
        LocalDate startDate = LocalDate.parse(weekStart);
        LocalDate endDate = LocalDate.parse(weekEnd);

        //slots for entire week
        //key is date, value is list of time slots
        List<DaySchedule> weekSchedule = new ArrayList<>();

    
        List<Appointment> weekAppointments = appointmentRepository.findByDoctorIdAndDateRange(

                id, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        //loops each day of week
        for (LocalDate date = startDate; date.isBefore(endDate.plusDays(1)); date = date.plusDays(1)) {

            //slots for single day

            List<TimeSlot> daySlots = new ArrayList<>();
            final LocalDate currentDate = date;

            List<Appointment> appointmentsForDay = weekAppointments.stream()

                    .filter(a -> a.getAppointmentStart().toLocalDate().equals(currentDate))
                    .toList();


            DayOfWeek dayOfWeek = date.getDayOfWeek();

            DoctorAvailability doctorAvailability = doctorAvailabilityRepository.findByDoctorIdAndDay(id, dayOfWeek);

            //marks slot as booked if during break
            List<DoctorBreak> dailyBreaks = doctorBreakRepository.findByDoctorIdAndDay(id, dayOfWeek);

            //if availablity is null, doctor is off work
            if (doctorAvailability == null) {
                weekSchedule.add(new DaySchedule(date.toString(), daySlots));
                continue;
            }

            LocalTime openingTime = LocalTime.parse(doctorAvailability.getOpeningTime());
            LocalTime closingTime = LocalTime.parse(doctorAvailability.getClosingTime());
            
            //loops through each 15 min slot
            for (LocalTime time = openingTime; time.isBefore(closingTime); time = time.plusMinutes(15)) {

                    //Formats time as "00:00"
                        String timeString = time.toString();
                    
                        boolean booked = false;
                        boolean isAppointmentStartSlot = false;
                        int numberOfSlots = 1;

                        for (DoctorBreak doctorBreak : dailyBreaks) {
                            if (doctorBreak.getBreakStart() == null || doctorBreak.getBreakEnd() == null) {
                                continue;
                            }

                            LocalTime breakStart = LocalTime.parse(doctorBreak.getBreakStart());
                            LocalTime breakEnd = LocalTime.parse(doctorBreak.getBreakEnd());

                        // block slot if any part of the 15-min slot overlaps the break
                            if (time.plusMinutes(15).isAfter(breakStart) && time.isBefore(breakEnd)) {
                                booked = true;
                                break;
                            }
                        }

                        if (!booked) {
                            for (Appointment appointment : appointmentsForDay) {

                            //If appointment is cancelled skip it
                            if (
                                appointment.getAppointmentStatus() == Appointment.AppointmentStatus.CANCELLED) {
                                continue;
                            }

                            LocalTime start = appointment.getAppointmentStart().toLocalTime();
                            LocalTime end = appointment.getAppointmentEnd().toLocalTime();

                                //Checks if time slot is between start and end time and if so, maerks slot as booked
                            if (!start.isAfter(time) && end.isAfter(time)) {
                                booked = true;
                                isAppointmentStartSlot = start.equals(time);

                                long minutes = java.time.Duration.between(start, end).toMinutes();
                                if (minutes == 30) {
                                    numberOfSlots = 2;
                                }

                                break;
                            }
                        }
                        }

                        daySlots.add(new TimeSlot(timeString, booked, isAppointmentStartSlot, numberOfSlots));
            }

                weekSchedule.add(new DaySchedule(date.toString(), daySlots));
        }
        return weekSchedule; 
    }

        @PostMapping("/doctor/{id}/mark-unavailable")
public void markUnavailable(
        @PathVariable Long id,
        @RequestParam String date,
        @RequestParam String time,
        @RequestHeader("Authorization") String tokenHeader
) {
    tokenChecker.roleRequired(tokenHeader, User.Role.DOCTOR);
    tokenChecker.idRequired(tokenHeader, User.Role.DOCTOR, id);

    LocalDateTime appointmentStart = LocalDate.parse(date).atTime(LocalTime.parse(time));

    LocalDateTime appointmentEnd = appointmentStart.plusMinutes(15);

    com.example.eircare_backend.model.Doctor doctor = doctorRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));

    Appointment unavailable = new Appointment();

    unavailable.setDoctor(doctor);
    unavailable.setAppointmentStart(appointmentStart);
    unavailable.setAppointmentEnd(appointmentEnd);
    unavailable.setNeedsTranslator(false);

    unavailable.setAppointmentStatus(Appointment.AppointmentStatus.UNAVAILABLE);

    appointmentRepository.save(unavailable);
}

    @PostMapping("/{id}/cancel")
    public void cancelAppointment(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        tokenChecker.multiRolesRequired(token, User.Role.DOCTOR, User.Role.PATIENT);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setAppointmentStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        webhookService.notifyAppointmentCancelled(appointment);
    }

    @DeleteMapping("/{id}")
    public void deleteAppointment(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        tokenChecker.roleRequired(token, User.Role.DOCTOR);
        appointmentRepository.deleteById(id);
    }

    @PostMapping("/{id}/status")
    public Appointment updateAppointmentStatus(@PathVariable Long id, @RequestBody Map<String, String> body, @RequestHeader("Authorization") String token) {

        tokenChecker.roleRequired(token, User.Role.DOCTOR);

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        String statusValue = body.get("status");

        if (statusValue == null) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "input status");
        }
        try {
            appointment.setAppointmentStatus(Appointment.AppointmentStatus.valueOf(statusValue));
        } catch (IllegalArgumentException e) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status " + statusValue);
        }
        
        return appointmentRepository.save(appointment);
    }

}