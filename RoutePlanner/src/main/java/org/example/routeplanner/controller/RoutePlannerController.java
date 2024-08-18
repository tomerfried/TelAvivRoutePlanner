/**
 * Controller class that handles HTTP requests related to route planning.
 * The controller provides endpoints for finding routes between locations using {@RoutePlannerService}.
 */
package org.example.routeplanner.controller;

import org.example.routeplanner.service.RoutePlannerService;
import org.example.routeplanner.model.Route;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.ResourceAccessException;
import java.util.List;

@RestController
@RequestMapping("/routes")
public class RoutePlannerController {

    private final RoutePlannerService routePlannerService;

    /**
     * Constructor for {@code RoutePlannerController}.
     *
     * @param routePlannerService The service responsible for route planning logic.
     */
    @Autowired
    public RoutePlannerController(RoutePlannerService routePlannerService) {
        this.routePlannerService = routePlannerService;
    }

    /**
     * GET endpoint to retrieve routes between a given current location and destination.
     *
     * @param origin The starting point for route calculation.
     * @param destination     The destination point for route calculation.
     * @return ResponseEntity containing either a list of Route objects or an error message.
     */
    @GetMapping
    public ResponseEntity<?> getRoutes(@RequestParam String origin, @RequestParam String destination) {
        try {
            List<Route> routes = routePlannerService.findRoutes(origin, destination);
            return ResponseEntity.ok(routes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (ResourceAccessException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
