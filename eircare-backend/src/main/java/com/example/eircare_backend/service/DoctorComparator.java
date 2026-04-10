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

        double distanceDoctor1 = (doctor1.getPractice() != null)
            ? calculateDistance(patientLatitude, patientLongitude, doctor1.getPractice().getLatitude(), doctor1.getPractice().getLongitude())
            : Double.MAX_VALUE;
        double distanceDoctor2 = (doctor2.getPractice() != null)
            ? calculateDistance(patientLatitude, patientLongitude, doctor2.getPractice().getLatitude(), doctor2.getPractice().getLongitude())
            : Double.MAX_VALUE;

        return Double.compare(distanceDoctor1, distanceDoctor2);
    }

    public double calculateDistance (double patientLatitude, double patientLongitude, double doctorLatitude, double doctorLongitude) {

    GeodeticCalculator GeodeticCalculator = new GeodeticCalculator(DefaultGeographicCRS.WGS84);
    GeodeticCalculator.setStartingGeographicPoint(patientLongitude, patientLatitude);
    GeodeticCalculator.setDestinationGeographicPoint(doctorLongitude, doctorLatitude);
    return GeodeticCalculator.getOrthodromicDistance() / 1000;
    }
}
