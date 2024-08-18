package org.example.routeplanner.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.example.routeplanner.model.DrivingPath;
import org.example.routeplanner.model.WalkingPath;

import java.util.List;

public class Route {
    private Place origin;
    private Place destination;
    private Place parkingLot;
    private DrivingPath drivingPath;
    private WalkingPath walkingPath;
    private double totalTime;

    /**
     * Constructs a new Route object which consists of walking path to a parking lot,
     * the parking lot, and the walking path to the destination.
     * Consists also of the total time of the journey.
     *
     * @param origin Where the route starts at
     * @param destination Where the route ends at
     * @param parkingLot   The parking lot associated with the route.
     * @param drivingPath  The driving path for the route.
     * @param walkingPath  The walking path for the route.
     * @param totalTime    The total time required for the entire route.
     */
    @JsonCreator
    public Route(
                @JsonProperty("origin") Place origin,
                @JsonProperty("destination") Place destination,
                @JsonProperty("parkingLot") Place parkingLot,
                @JsonProperty("drivingPath") DrivingPath drivingPath,
                @JsonProperty("walkingPath") WalkingPath walkingPath,
                @JsonProperty("totalTime") double totalTime) {
        this.origin = origin;
        this.destination = destination;
        this.parkingLot = parkingLot;
        this.drivingPath = drivingPath;
        this.walkingPath = walkingPath;
        this.totalTime = totalTime;
    }

    // Getters and setters
    public Place getOrigin(){
        return origin;
    }
    public void setOrigin(Place origin){
        this.origin = origin;
    }
    public Place getDestination(){
        return destination;
    }
    public void setDestination(Place destination){
        this.destination = destination;
    }
    public Place getParkingLot() {
        return parkingLot;
    }
    public void setParkingLot(Place parkingLot) {
        this.parkingLot = parkingLot;
    }
    public DrivingPath getDrivingPath() {
        return drivingPath;
    }
    public void setDrivingPath(DrivingPath drivingPath) {
        this.drivingPath = drivingPath;
    }
    public WalkingPath getWalkingPath() {
        return walkingPath;
    }
    public void setWalkingPath(WalkingPath walkingPath) {
        this.walkingPath = walkingPath;
    }
    public double getTotalTime() {
        return totalTime;
    }
    public void setTotalTime(double totalTime) {
        this.totalTime = totalTime;
    }
}
