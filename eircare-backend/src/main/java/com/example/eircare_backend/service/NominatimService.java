package com.example.eircare_backend.service;

import org.springframework.http.HttpHeaders;

import java.net.URLEncoder;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.eircare_backend.dto.LatLong;
import com.example.eircare_backend.dto.NominatimResponse;
import static java.nio.charset.StandardCharsets.UTF_8;

@Service
public class NominatimService {
    
    public LatLong getLatLongFromAddress(String address) {

        RestTemplate restTemplate = new RestTemplate();

        String UTFaddress = URLEncoder.encode(address, UTF_8);

        String EncodedAddress = UTFaddress.replaceAll("%2C", ","); // Nominatim needs commas not 2%C

        String url = "https://nominatim.openstreetmap.org/search?q=" + EncodedAddress + "&format=json&limit=1&addressdetails=1";
        
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.set("User-Agent", "Eircare");

        HttpEntity<String> httpEntity = new HttpEntity<>(httpHeaders);

        ResponseEntity<NominatimResponse[]> responseEntity = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            httpEntity, 
            NominatimResponse[].class);
        
            if (responseEntity.getBody() == null || responseEntity.getBody().length == 0){
                throw new RuntimeException("Couldnt get address");
            }

            return new LatLong(responseEntity.getBody()[0].getLat(), responseEntity.getBody()[0].getLon());
        };
    }