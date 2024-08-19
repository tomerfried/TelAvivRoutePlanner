package org.example.routeplanner.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.maps.*;
import com.google.maps.errors.ApiException;
import com.google.maps.model.*;
import io.micrometer.common.util.StringUtils;
import org.example.routeplanner.model.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import info.debatty.java.stringsimilarity.Cosine;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Service class responsible for route planning using Google Maps APIs.
 */
@Service
public class RoutePlannerService {

    // Constants defining geographical boundaries for Israel and Tel Aviv
    private static final double ISRAEL_MIN_LAT = 29.0;
    private static final double ISRAEL_MAX_LAT = 33.5;
    private static final double ISRAEL_MIN_LON = 34.25;
    private static final double ISRAEL_MAX_LON = 35.9;
    private static final double TEL_AVIV_MIN_LAT = 32.0;
    private static final double TEL_AVIV_MAX_LAT = 32.13;
    private static final double TEL_AVIV_MIN_LON = 34.75;
    private static final double TEL_AVIV_MAX_LON = 34.84;
    private static final double EARTH_RADIUS = 6371e3;

    private static final HashMap<String, LatLng>  allParkingLotsLocations;

    static {
        try {
             allParkingLotsLocations = new ObjectMapper().readValue(new File("src/main/resources/allParkingLotsLocations.json"), new TypeReference<HashMap<String, LatLng>>() {});
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private final GeoApiContext context = new GeoApiContext.Builder()
            .apiKey("INSERT_KEY_HERE")
            .build();

    public RoutePlannerService() throws IOException {
    }

    /**
     * Finds routes from a specified current location to a destination, which consists of
     * the driving path to the parking lot and the walking path from the parking lot to the destination
     *
     * @param origin the starting location as an address string
     * @param destination     the destination location as an address string
     * @return a list of Route objects representing different routes
     * @throws ResourceAccessException if there is an issue accessing Google Maps API
     * @throws IllegalArgumentException if input location is not in Israel/Tel Aviv
     */
    public List<Route> findRoutes(String origin, String destination) throws IllegalArgumentException, ResourceAccessException {
        if (StringUtils.isEmpty(origin) || StringUtils.isEmpty(destination)) {
            throw new IllegalArgumentException("Current location or destination are empty");
        }

        try {
            LatLng originLatLng = getLocationFromAddress(origin);
            LatLng destinationLatLng = getLocationFromAddress(destination);

            if (!isInIsrael(originLatLng)) {
                throw new IllegalArgumentException("Current location is not in Israel");
            }
            if (!isInTelAviv(destinationLatLng)) {
                throw new IllegalArgumentException("Destination is not in Tel Aviv");
            }

            List<Route> routes = new ArrayList<>();
            PlacesSearchResult[] parkingLots = getNearbyParkingLots(destinationLatLng, 500);
            HashSet<String> addedParkingLots = new HashSet<>();

            for (PlacesSearchResult parkingLotResult : parkingLots) {
                if (parkingLotResult.permanentlyClosed) {
                    continue;
                }
                String normalizedParkingLotName = findBestMatch(parkingLotResult.geometry.location);
                if (normalizedParkingLotName == null
                    || addedParkingLots.contains(normalizedParkingLotName)){
                    continue;
                }

                LatLng parkingLotLocation = parkingLotResult.geometry.location;
                Place originObject = new Place(origin, null, originLatLng);
                Place destinationObject = new Place(destination, null, destinationLatLng);
                Place parkingLotObject = new Place(normalizedParkingLotName, parkingLotResult.vicinity, parkingLotLocation);
                DrivingPath drivingPath = createDrivingPath(parkingLotLocation, originLatLng);
                WalkingPath walkingPath = createWalkingPath(parkingLotLocation, destinationLatLng);
                routes.add(new Route(
                        originObject,
                        destinationObject,
                        parkingLotObject,
                        drivingPath,
                        walkingPath,
                        drivingPath.getTotalTime() + walkingPath.getTotalTime()));
                addedParkingLots.add(normalizedParkingLotName);
            }

            return routes;
        } catch (ApiException | InterruptedException | IOException e) {
            throw new ResourceAccessException("Google Maps API error");
        }
    }

    /**
     * Retrieves geographical coordinates (LatLng) from a given address string.
     *
     * @param address the address to geocode
     * @return LatLng object representing the coordinates of the address
     * @throws ResourceAccessException if there is an issue accessing Google Maps API
     * @throws IllegalArgumentException if address does not exist
     */
    public LatLng getLocationFromAddress(String address) throws IllegalArgumentException, ResourceAccessException {
        try {
            GeocodingApiRequest geocodeRequest = GeocodingApi.geocode(context, address);
            GeocodingResult[] results = geocodeRequest.await();

            if (results.length == 0) {
                throw new IllegalArgumentException("Address does not exist");
            }
            return results[0].geometry.location;
        } catch (ApiException | InterruptedException | IOException e) {
            throw new ResourceAccessException("Google Maps API error");
        }

    }

    /**
     * Retrieves nearby parking lots around a specific location within a given radius.
     *
     * @param destination         the central location to search around
     * @param radiusFromDestination the radius in meters to search within
     * @return array of PlacesSearchResult objects representing nearby parking lots
     * @throws IOException          if an I/O error occurs
     * @throws InterruptedException if the thread executing the task is interrupted
     * @throws ApiException         if the Google Maps API request fails
     */
    public PlacesSearchResult[] getNearbyParkingLots(LatLng destination, int radiusFromDestination) throws IOException, InterruptedException, ApiException {
        NearbySearchRequest nearbySearchRequest = PlacesApi.nearbySearchQuery(context, destination)
                .radius(radiusFromDestination)
                .keyword("אחוזות החוף")
                .language("he");
        PlacesSearchResponse response = nearbySearchRequest.await();

        PlacesSearchResult[] parkingLots = response.results;
        return parkingLots;
    }

    /**
     * Retrieves directions (route) information from an origin to a destination.
     *
     * @param origin      starting point of the route
     * @param destination destination point of the route
     * @param mode        mode of travel (e.g., driving, walking)
     * @return DirectionsResult object containing the route information
     * @throws ApiException         if the Google Maps API request fails
     * @throws InterruptedException if the thread executing the task is interrupted
     * @throws IOException          if an I/O error occurs
     */
    public DirectionsResult getDirections(LatLng origin, LatLng destination, TravelMode mode) throws ApiException, InterruptedException, IOException {
        DirectionsApiRequest directionApiRequest = DirectionsApi.newRequest(context)
                .origin(origin)
                .destination(destination)
                .mode(mode)
                .language("he");

        DirectionsResult result = directionApiRequest.await();
        return result;
    }

    /**
     * Creates a driving path (route) from a current location to a parking lot.
     *
     * @param parkingLotLocationLatLng coordinates of the parking lot
     * @param originLatLng   coordinates of the current location
     * @return DrivingPath object representing the driving route
     * @throws ApiException         if the Google Maps API request fails
     * @throws InterruptedException if the thread executing the task is interrupted
     * @throws IOException          if an I/O error occurs
     */
    public DrivingPath createDrivingPath(LatLng parkingLotLocationLatLng, LatLng originLatLng) throws ApiException, InterruptedException, IOException {
        DirectionsResult driveToParkingLotDirections = getDirections(originLatLng, parkingLotLocationLatLng, TravelMode.DRIVING);
        long drivingTime = driveToParkingLotDirections.routes[0].legs[0].duration.inSeconds / 60;
        return new DrivingPath(driveToParkingLotDirections.routes[0], drivingTime);
    }

    /**
     * Creates a walking path (route) from a parking lot to a destination.
     *
     * @param parkingLotLocationLatLng coordinates of the parking lot
     * @param destinationLatLng       coordinates of the destination
     * @return WalkingPath object representing the walking route
     * @throws ApiException         if the Google Maps API request fails
     * @throws InterruptedException if the thread executing the task is interrupted
     * @throws IOException          if an I/O error occurs
     */
    public WalkingPath createWalkingPath(LatLng parkingLotLocationLatLng, LatLng destinationLatLng) throws ApiException, InterruptedException, IOException {
        DirectionsResult walkToDestinationDirections = getDirections(parkingLotLocationLatLng, destinationLatLng, TravelMode.WALKING);
        long walkingTime = walkToDestinationDirections.routes[0].legs[0].duration.inSeconds / 60;
        return new WalkingPath(walkToDestinationDirections.routes[0], walkingTime);
    }

    /**
     * Checks if the given latitude and longitude are within the boundaries of Israel.
     *
     * @param location latitude and longitude, wrapped with Google's LatLng class
     * @return true if the point is within Israel, false otherwise
     */
    public static boolean isInIsrael(LatLng location) {
        double latitude = location.lat;
        double longitude = location.lng;

        return latitude >= ISRAEL_MIN_LAT && latitude <= ISRAEL_MAX_LAT &&
                longitude >= ISRAEL_MIN_LON && longitude <= ISRAEL_MAX_LON;
    }

    /**
     * Checks if the given LatLng location is within the boundaries of Tel Aviv.
     *
     * @param location the LatLng object representing the location to check
     * @return true if the location is within Tel Aviv, false otherwise
     */
    public static boolean isInTelAviv(LatLng location) {
        double latitude = location.lat;
        double longitude = location.lng;

        return latitude >= TEL_AVIV_MIN_LAT && latitude <= TEL_AVIV_MAX_LAT &&
                longitude >= TEL_AVIV_MIN_LON && longitude <= TEL_AVIV_MAX_LON;
    }

    public static String findBestMatch(LatLng inputParkingLotLocation) {
        String closestName = null;
        double closestDistance = Double.MAX_VALUE;

        for (String name : allParkingLotsLocations.keySet()) {
            LatLng parkingLotLocation = allParkingLotsLocations.get(name);
            double distance = distance(inputParkingLotLocation, parkingLotLocation);

            if (distance <= 150 && distance < closestDistance) {
                closestName = name;
                closestDistance = distance;
            }
        }

        return closestName;
    }

    public static double distance(LatLng inputParkingLotLocation, LatLng parkingLotLocation) {
        double lat1 = inputParkingLotLocation.lat;
        double lon1 = inputParkingLotLocation.lng;
        double lat2 = parkingLotLocation.lat;
        double lon2 = parkingLotLocation.lng;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }
}
