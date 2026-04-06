package com.example.eircare_backend.service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import com.example.eircare_backend.model.Appointment;
import com.example.eircare_backend.repository.AppointmentRepository;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public void checkForAppointmentsCompleted(){

        List<Appointment> appointments = appointmentRepository.findAll();
        List<Appointment> completedAppointments = new ArrayList<>();
        LocalDateTime timeAhora = LocalDateTime.now();

                for (Appointment appointment : appointments){
                    if(appointment.getAppointmentEnd() != null && appointment.getAppointmentEnd().isBefore(timeAhora) && appointment.getAppointmentStatus() != Appointment.AppointmentStatus.COMPLETED && appointment.getAppointmentStatus() != Appointment.AppointmentStatus.CANCELLED){
                        appointment.setAppointmentStatus(Appointment.AppointmentStatus.COMPLETED);
                        completedAppointments.add(appointment);
                    }
                }

                if (!completedAppointments.isEmpty()){
                appointmentRepository.saveAll(completedAppointments);
                }
    }
}
