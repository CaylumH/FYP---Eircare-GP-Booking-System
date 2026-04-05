package com.example.eircare_backend.model;

public enum ConsultationType {
    GENERAL_CONSULTATION(15),
    NEW_HEALTH_ISSUE(30),
    FOLLOW_UP(15),
    PRESCRIPTION_RENEWAL(15),
    BLOOD_TEST(15),
    VACCINATION(15),
    WOMENS_HEALTH(30),
    MENS_HEALTH(30),
    SKIN_ISSUE(30),
    MENTAL_HEALTH(30),
    MINOR_PROCEDURE(30),
    SICK_NOTE(15);

    private final int appointmentDuration;

    ConsultationType(int appointmentDuration) {
        this.appointmentDuration = appointmentDuration;
    }

    public int getAppointmentDuration() {
        return appointmentDuration;
    }
}
