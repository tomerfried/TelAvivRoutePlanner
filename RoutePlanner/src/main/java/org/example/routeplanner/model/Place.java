package org.example.routeplanner.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.maps.model.LatLng;

public class Place {
    private final String name;
    private final String address;
    private final LatLng location;

    /**
     * Constructs a new Place object with the specified name, address, and location.
     *
     * @param name     The name of the Place.
     * @param address  The address of the Place.
     * @param location The geographical location (latitude and longitude) of the Place.
     */
    @JsonCreator
    public Place(@JsonProperty("name") String name,
                 @JsonProperty("address") String address,
                 @JsonProperty("location") LatLng location) {
        this.name = name;
        this.address = address;
        this.location = location;
    }


    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public LatLng getLocation() {
        return location;
    }

}
