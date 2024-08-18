package org.example.routeplanner.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.maps.model.DirectionsRoute;

public class WalkingPath extends Path{
    /**
     * Constructs a walking path object.
     *
     * @param directionsRoute   A DirectionsRoute object of Google Maps API which represents
     * the set of instructions that defines the walking path
     * @param totalTime  The total time required for walking.
     */
    @JsonCreator
    public WalkingPath(@JsonProperty("directionsRoute") DirectionsRoute directionsRoute,
                       @JsonProperty("totalTime") double totalTime) {
        super(directionsRoute, totalTime);
    }
}
