package com.example.eircare_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.eircare_backend.dto.LatLong;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URLEncoder;
import static java.nio.charset.StandardCharsets.UTF_8;

@Service
public class NominatimService {

    @Value("${google.maps.api-key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public LatLong getLatLongFromAddress(String address) {

        RestTemplate restTemplate = new RestTemplate();

        String EncodedAddress = URLEncoder.encode(address, UTF_8);

        String url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + EncodedAddress + "&key=" + apiKey + "&region=ie";

        HttpHeaders httpHeaders = new HttpHeaders();
        HttpEntity<String> httpEntity = new HttpEntity<>(httpHeaders);

        ResponseEntity<String> responseEntity = restTemplate.exchange(
            url,
            HttpMethod.GET,
            httpEntity,
            String.class
        );

        try {
            JsonNode root = objectMapper.readTree(responseEntity.getBody());

            String status = root.path("status").asText();

            if (!"OK".equals(status)) {
                throw new RuntimeException("Geocoding failed:" + status);
            }

            JsonNode location = root.path("results").get(0).path("geometry").path("location");

            double lat = location.path("lat").asDouble();
            double lng = location.path("lng").asDouble();

            return new LatLong(lat, lng);

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse geocoding response " + e.getMessage());
        }
    }}
