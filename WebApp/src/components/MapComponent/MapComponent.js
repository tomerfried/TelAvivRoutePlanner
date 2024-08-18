import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { fetchRoutes, fetchParkingLotsInformation } from '../../services/api';
import './MapComponent.css';
import InputWindow from "../InputWindow/InputWindow";
import RoutePlannerLayer from './RoutePlannerLayer.js';

function MapComponent() {
    const { isLoaded: isApiLoaded } = useJsApiLoader({
        libraries: ['geometry', 'marker'],
        id: 'google-map-script',
        googleMapsApiKey: "INSERTֹֹ-KEY-HERE"
    });

    const [parkingLotInfos, setParkingLotInfos] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [zoom, setZoom] = useState(10);
    const [center, setCenter] = useState({ lat: 32.0853, lng: 34.7818 });
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [routePlannerLayerInitialized, setRoutePlannerLayerInitialized] = useState(false);
    const routePlannerLayer = useRef(null);



    const ORIGIN_ICON_URL = "https://cdn-icons-png.freepik.com/512/2544/2544087.png?ga=GA1.1.720494702.1722840877";
    const DESTINATION_ICON_URL = "https://cdn-icons-png.freepik.com/512/2279/2279544.png?ga=GA1.1.720494702.1722840877";
    const PARKING_LOT_ICON_URL = "https://cdn-icons-png.freepik.com/512/6984/6984921.png?ga=GA1.1.720494702.1722840877";

    const onLoad = useCallback((mapInstance) => {
        routePlannerLayer.current = new RoutePlannerLayer({map: mapInstance});
        setRoutePlannerLayerInitialized(true);
        setZoom(mapInstance.getZoom());
        setCenter(mapInstance.getCenter().toJSON());
    }, []);

    const updateOriginAndDestination = (newOrigin, newDestination) => {
        setOrigin(newOrigin);
        setDestination(newDestination);
    };

    useEffect(() => {
        const fetchRouteAndParkingLots = async () => {
            try {
                setIsFetching(true);
                const responseRoutes = await fetchRoutes(origin, destination);
                const parkingLotsNames = responseRoutes.map(item => item.parkingLot.name);
                const parkingInfos = await fetchParkingLotsInformation(parkingLotsNames);
                setRoutes(responseRoutes);
                setParkingLotInfos(parkingInfos);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsFetching(false);
            }
        };
        fetchRouteAndParkingLots();


        }, [origin, destination]);

    useEffect(() => {
        if (!isFetching && routePlannerLayerInitialized === true && routes.length > 0) {
            routePlannerLayer.current.clearMapObjects();
            let originObject = routes[0].origin;
            let destinationObject = routes[0].destination;

            routePlannerLayer.current.addPlaceMarker(originObject, ORIGIN_ICON_URL);
            routePlannerLayer.current.addPlaceMarker(destinationObject, DESTINATION_ICON_URL);

            routes.forEach((route, index) => {
                routePlannerLayer.current.addRoute(route, parkingLotInfos[index], PARKING_LOT_ICON_URL)
            });

            const shortestRouteIndex = getIndexOfShortestRoute(routes);
            routePlannerLayer.current.highlightSelectedRouteAndDehighlightOthers(shortestRouteIndex);
            routePlannerLayer.current.fitMapBounds();
        }
    }, [routePlannerLayerInitialized, isFetching, routes, parkingLotInfos]);

    return isApiLoaded ? (
        <GoogleMap
            mapContainerStyle={{ width: '100vw', height: '100vh' }}
            zoom={zoom}
            center={center}
            onLoad={onLoad}
            options={{
                mapTypeControl: true,
                mapTypeControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_RIGHT
                }
            }}
        >
            {isFetching && <div className="loading-spinner"></div>}
            <InputWindow
                origin={origin}
                destination={destination}
                setOrigin={setOrigin}
                setDestination={setDestination}
                updateOriginAndDestination={updateOriginAndDestination}
            />
        </GoogleMap>
    ) : null;
}

export default React.memo(MapComponent);

export function getIndexOfShortestRoute(routes) {
    return routes.reduce((minIndex, Route, Index) => (
        Route.totalTime < routes[minIndex].totalTime ? Index : minIndex
    ), 0);
}
