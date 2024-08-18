package com.example.RoutePlanner;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import org.example.routeplanner.controller.RoutePlannerController;
import org.example.routeplanner.model.Route;
import org.example.routeplanner.service.RoutePlannerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.client.ResourceAccessException;


@ContextConfiguration(classes = RoutePlannerController.class)
@WebMvcTest(RoutePlannerController.class)
public class RoutePlannerControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoutePlannerService routePlannerService;

    @Test
    public void CreatesValidOutput() throws Exception {
        // Arrange
        String jsonString = new String(Files.readAllBytes(Paths.get(".\\src\\test\\java\\com\\example\\RoutePlanner\\testData\\validOutput.json")));
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        List<Route> mockeRouteList = objectMapper.readValue(jsonString, new TypeReference<>(){});
        when(routePlannerService.findRoutes(anyString(), anyString())).thenReturn(mockeRouteList);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/routes")
                        .param("origin", "כפר סבא")
                        .param("destination", "כיכר רבין, תל אביב"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)));
    }

    @Test
    public void missingParameters() throws Exception {
        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/routes")
                        .param("origin", "כפר סבא"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void destinationNotInTelAviv() throws Exception {
        // Arrange
        when(routePlannerService.findRoutes(anyString(), anyString())).thenThrow(new IllegalArgumentException("Destination is not in Tel Aviv"));
        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/routes")
                        .param("origin", "Tel Aviv")
                        .param("destination", "Jerusalem"))
                        .andExpect(status().isBadRequest())
                        .andExpect(content().string("Destination is not in Tel Aviv"));
        return;
    }

    @Test
    public void originNotInIsrael() throws Exception {
        // Arrange
        when(routePlannerService.findRoutes(anyString(), anyString())).thenThrow(new IllegalArgumentException("Current location is not in Israel"));

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/routes")
                        .param("origin", "New York")
                        .param("destination", "Tel Aviv"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Current location is not in Israel"));
    }

    @Test
    public void notFoundorigin() throws Exception {
        // Arrange
        when(routePlannerService.findRoutes(anyString(), anyString())).thenThrow(new IllegalArgumentException("Location not found"));

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/routes")
                        .param("origin", "Unknown Place")
                        .param("destination", "Tel Aviv"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Location not found"));
    }

    @Test
    public void notFoundParkingLots() throws Exception {
        // Arrange
        when(routePlannerService.findRoutes(anyString(), anyString())).thenThrow(new IllegalArgumentException("No parking lots found"));

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/routes")
                        .param("origin", "Tel Aviv")
                        .param("destination", "Herzliya"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("No parking lots found"));
    }

    @Test
    public void googleMapsApiError() throws Exception {
        // Arrange
        when(routePlannerService.findRoutes(anyString(), anyString())).thenThrow(new ResourceAccessException("Google Maps API error"));

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/routes")
                        .param("origin", "Tel Aviv")
                        .param("destination", "Herzliya"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Google Maps API error"));
    }

    @Test
    public void addressDoesNotExist() throws Exception {
        // Arrange
        when(routePlannerService.findRoutes(anyString(), anyString())).thenThrow(new IllegalArgumentException("Address does not exist"));

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/routes")
                        .param("origin", "Nonexistent Place")
                        .param("destination", "Tel Aviv"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Address does not exist"));
    }
}
