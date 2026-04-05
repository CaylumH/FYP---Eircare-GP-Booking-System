package com.example.eircare_backend.service;

import java.util.Comparator;

import com.example.eircare_backend.model.Doctor;
import org.geotools.referencing.GeodeticCalculator;
import org.geotools.referencing.crs.DefaultGeographicCRS;


public class DoctorComparator implements Comparator<Doctor> {

    private double patientLatitude;
    private double patientLongitude;

    public DoctorComparator(double patientLatitude, double patientLongitude) {
        this.patientLatitude = patientLatitude;
        this.patientLongitude = patientLongitude;
    }

    @Override
    public int compare(Doctor doctor1, Doctor doctor2) {
        
        double distanceDoctor1 = calculateDistance(patientLatitude, patientLongitude, doctor1.getLatitude(), doctor1.getLongitude());
        double distanceDoctor2 = calculateDistance(patientLatitude, patientLongitude, doctor2.getLatitude(), doctor2.getLongitude());

        return Double.compare(distanceDoctor1, distanceDoctor2);
    }

    public double calculateDistance (double patientLatitude, double patientLongitude, double doctorLatitude, double doctorLongitude) {

    GeodeticCalculator GeodeticCalculator = new GeodeticCalculator(DefaultGeographicCRS.WGS84);
    GeodeticCalculator.setStartingGeographicPoint(patientLongitude, patientLatitude);
    GeodeticCalculator.setDestinationGeographicPoint(doctorLongitude, doctorLatitude);
    return GeodeticCalculator.getOrthodromicDistance() / 1000;
    }
}
