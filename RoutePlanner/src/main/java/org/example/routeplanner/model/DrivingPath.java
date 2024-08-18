package org.example.routeplanner.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.maps.model.DirectionsRoute;

public class DrivingPath extends Path{
    /**
     * Constructs a driving path object.
     *
     * @param directionsRoute   A DirectionsRoute object of Google Maps API which represents
     * the set of instructions that defines the driving path
     * @param totalTime  The total time required for driving.
     */
    @JsonCreator
    public DrivingPath(@JsonProperty("directionsRoute") DirectionsRoute directionsRoute,
                       @JsonProperty("totalTime") double totalTime) {
        super(directionsRoute, totalTime);
    }
}
