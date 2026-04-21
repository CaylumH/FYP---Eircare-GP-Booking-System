package com.example.eircare_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.example.eircare_backend.model.Appointment;
import java.util.Map;
import java.util.HashMap;

@Service
public class WebhookService { //notis to external services - FUTURE WRK!!

    @Value("${webhook.url:}")
    private String webhookUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void notifyAppointmentBooked(Appointment appointment) {

        notify("APPOINTMENT_BOOKED", appointment);
    }

    public void notifyAppointmentCancelled(Appointment appointment) {

        notify("APPOINTMENT_CANCELLED", appointment);
    }

    private void notify(String event, Appointment appointment) {

        if (webhookUrl == null || webhookUrl.isBlank()) return;

        Map<String, Object> payload = new HashMap<>();

        payload.put("event", event);

        payload.put("appointmentId", appointment.getAppointmentId());

        payload.put("patientId", appointment.getPatient() != null 
        ? appointment.getPatient().getId() 
        : null);

        payload.put("doctorId", appointment.getDoctor() != null 
        ? appointment.getDoctor().getId() 
        : null);

        payload.put("appointmentStart", appointment.getAppointmentStart());
        payload.put("appointmentEnd", appointment.getAppointmentEnd());

        try {

            restTemplate.postForEntity(webhookUrl, payload, String.class);
        } catch (Exception e) {

            System.out.println("webhook failed: " + e.getMessage());
        }
    }
}
