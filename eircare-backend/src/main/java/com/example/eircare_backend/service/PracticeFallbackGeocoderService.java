package com.example.eircare_backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.example.eircare_backend.model.Practice;
import com.example.eircare_backend.repository.PracticeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PracticeFallbackGeocoderService {

    private final PracticeRepository practiceRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    @Value("${anthropic.api-key}")

    private String anthropicApiKey;

    public PracticeFallbackGeocoderService(PracticeRepository practiceRepository, ObjectMapper objectMapper) {

        this.practiceRepository = practiceRepository;

        this.objectMapper = objectMapper;
        this.restClient = RestClient.create();
    }

    public Practice aiGeocode(Long practiceId) {

        Practice practice = practiceRepository.findById(practiceId)

                .orElseThrow(() -> new RuntimeException("Practice not found"));

        String claudePrompt = String.format(
            "Given the GP practice name and address below, return the GPS coordinates for this location in Ireland.\n\n" +
            "Return only a valid JSON object with exactly these fields:\n" +
            "- latitude: number (decimal degrees, if dont know return null)\n" +
            "- longitude: number (decimal degrees. If don't know, return null)\n\n" +
            "Practice name: %s\nAddress: %s\n\nReturn only the JSON, no explanation or anything.",
            practice.getName(), practice.getAddress()
        );

        Map<String, Object> requestBody = Map.of(
            "model", "claude-haiku-4-5-20251001",
            "max_tokens", 256,
            "messages", List.of(Map.of("role", "user", "content", claudePrompt))
        );

        try {
            String response = restClient.post()
                    .uri("https://api.anthropic.com/v1/messages")
                    .header("x-api-key", anthropicApiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);

            String text = root.path("content").get(0).path("text").asText();

            String json = text.trim();

            if (json.startsWith("```")) {

                json = json.replaceAll("```json", "").replaceAll("```", "").trim();
            }

            JsonNode result = objectMapper.readTree(json);

            JsonNode latNode = result.get("latitude");
            JsonNode longNode = result.get("longitude");

            if (latNode != null && !latNode.isNull() && longNode != null && !longNode.isNull()) {

                practice.setLatitude(latNode.asDouble());

                practice.setLongitude(longNode.asDouble());
            }

        } catch (Exception e) {
            throw new RuntimeException("AI geocoding failed: " + e.getMessage());
        }

        return practiceRepository.save(practice);
    }
}
