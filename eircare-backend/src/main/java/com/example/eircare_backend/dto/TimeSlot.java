package com.example.eircare_backend.dto;

public class TimeSlot {
	private String time;
	private boolean booked;
	private boolean isAppointmentStartSlot;
	private int numberOfSlots;

	public TimeSlot() {
	}

	public TimeSlot(String time, boolean booked, boolean isAppointmentStartSlot, int numberOfSlots) {
		this.time = time;
		this.booked = booked;
		this.isAppointmentStartSlot = isAppointmentStartSlot;
		this.numberOfSlots = numberOfSlots;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}

	public boolean isBooked() {
		return booked;
	}

	public void setBooked(boolean booked) {
		this.booked = booked;
	}

	public boolean isAppointmentStartSlot() {
		return isAppointmentStartSlot;
	}

	public void setAppointmentStartSlot(boolean appointmentStartSlot) {
		isAppointmentStartSlot = appointmentStartSlot;
	}

	public int getNumberOfSlots() {
		return numberOfSlots;
	}

	public void setNumberOfSlots(int numberOfSlots) {
		this.numberOfSlots = numberOfSlots;
	}
}
