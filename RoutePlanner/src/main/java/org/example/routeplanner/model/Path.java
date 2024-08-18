package org.example.routeplanner.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.maps.model.DirectionsRoute;

/**
 * Represents a path in the route planner service.
 */
public abstract class Path {

    private DirectionsRoute directionsRoute;
    private double totalTime;

    /**
     * Constructs a Path object.
     *
     * @param directionsRoute   A DirectionsRoute object of Google Maps API which represents
     * the set of instructions that defines the path
     * @param totalTime  The total time required for the path.
     */
    @JsonCreator
    public Path(@JsonProperty("directionsRoute") DirectionsRoute directionsRoute,
                @JsonProperty("totalTime") double totalTime) {
        this.directionsRoute = directionsRoute;
        this.totalTime = totalTime;
    }

    public DirectionsRoute getDirectionsRoute() {
        return directionsRoute;
    }

    public void setDirectionsRoute(DirectionsRoute directionsRoute) {
        this.directionsRoute = directionsRoute;
    }

    public double getTotalTime() {
        return totalTime;
    }

    public void setTotalTime(double totalTime) {
        this.totalTime = totalTime;
    }
}
