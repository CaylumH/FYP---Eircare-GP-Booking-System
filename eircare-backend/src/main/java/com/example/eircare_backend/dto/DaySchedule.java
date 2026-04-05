package com.example.eircare_backend.dto;

import java.util.List;

public class DaySchedule {
	private String date;
	private List<TimeSlot> slots;

	public DaySchedule() {
	}

	public DaySchedule(String date, List<TimeSlot> slots) {
		this.date = date;
		this.slots = slots;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public List<TimeSlot> getSlots() {
		return slots;
	}

	public void setSlots(List<TimeSlot> slots) {
		this.slots = slots;
	}
}
