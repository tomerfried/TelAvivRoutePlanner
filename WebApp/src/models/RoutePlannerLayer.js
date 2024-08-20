import ReactDOMServer from 'react-dom/server';
import ParkingInfoModal from "../components/ParkingInfoModal/ParkingInfoModal";

export default class RoutePlannerLayer {
    constructor({map}) {
        this.map = map;
        this.bounds = new window.google.maps.LatLngBounds();
        this.mapObjects = {
            placeMarkers: [],
            allRoutesPolylines: [],
            walkingETAPopups: [],
            drivingETAPopups: [],
        };
    }

    addRoute(route, parkingLotInfo, parkingLotIconUrl) {
        const routePolylines = this.createFullRoutePolylines(route);
        this.addPolyLinesToMapAndBounds(routePolylines);
        const routeIndex = this.mapObjects.allRoutesPolylines.length - 1;
        this.setRouteProminenceToChangeByClick(routeIndex);
        this.addParkingLotMarker(parkingLotInfo, route, parkingLotIconUrl);
        this.addDrivingRouteETAPopup(route.drivingPath);
        this.addWalkingRouteETAPopup(route.walkingPath);
    }

    createFullRoutePolylines(route) {
        const drivingRoutePolylines = this.createDrivingRoutePolylines(route.drivingPath);
        const walkingRoutePolylines = this.createWalkingRoutePolylines(route.walkingPath);
        const routePolylines = drivingRoutePolylines.concat(walkingRoutePolylines);
        return routePolylines;
    }

    createDrivingRoutePolylines(routeDrivingPath) {
        let polylineOptions = {
            geodesic: true,
            strokeOpacity: 1.0,
            strokeWeight: 4
        };
        return this.createPathPolylines(routeDrivingPath, polylineOptions);
    }

    createWalkingRoutePolylines(routeWalkingPath) {
        let polylineOptions = {
            strokeOpacity: 0,
            icons: [{
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillOpacity: 1,
                    scale: 2,
                    strokeOpacity: 1,
                    strokeWeight: 3
                },
                offset: '0',
                repeat: '10px'
            }]
        };
        return this.createPathPolylines(routeWalkingPath, polylineOptions);
    }

    createPathPolylines(path, polylineOptions) {
        const polylines = path.directionsRoute.legs[0].steps.map(step => {
            const decodedPath = window.google.maps.geometry.encoding.decodePath(step.polyline.encodedPath);
            const polyline = new window.google.maps.Polyline({
                path: decodedPath,
                ...polylineOptions
            });
            return polyline;
        });
        return polylines;
    }

    addPolyLinesToMapAndBounds(polylines) {
        this.mapObjects.allRoutesPolylines.push(polylines);
        polylines.forEach(polyline => polyline.setMap(this.map));
        polylines.forEach(polyline => {
            polyline.setMap(this.map);
            polyline.getPath().forEach(latlng => this.bounds.extend(latlng));
        });
    }

    setRouteProminenceToChangeByClick(routeIndex) {
        this.mapObjects.allRoutesPolylines[routeIndex].forEach(polyline => {
            polyline.addListener('click', () => this.highlightSelectedRouteAndDehighlightOthers(routeIndex));
        });
    }

    highlightSelectedRouteAndDehighlightOthers(selectedRouteIndex) {
        this.mapObjects.allRoutesPolylines.forEach((routeObjects, i) => {
            if (i === selectedRouteIndex) {
                this.highlightRoute(i);
            } else {
                this.dehighlightRoute(i);
            }
        });

    }

    highlightRoute(routeIndex) {
        this.setRoutePolylinesAppearance(routeIndex, '#0062ff', 1000);
        this.mapObjects.walkingETAPopups[routeIndex].open(this.map);
        this.mapObjects.drivingETAPopups[routeIndex].open(this.map);
    }

    dehighlightRoute(routeIndex) {
        this.setRoutePolylinesAppearance(routeIndex, '#c0bbbb', 500);
        this.mapObjects.walkingETAPopups[routeIndex].close();
        this.mapObjects.drivingETAPopups[routeIndex].close();
    }

    setRoutePolylinesAppearance(routeIndex, color, zIndex) {
        const routePolylines = this.mapObjects.allRoutesPolylines[routeIndex];

        routePolylines.forEach(polyline => {
            polyline.setOptions({strokeColor: color, zIndex: zIndex});

            const icons = polyline.get('icons');
            if (icons) {
                icons[0].icon.strokeColor = color;
                polyline.set('icons', icons);
            }
        });
    }

    addParkingLotMarker(parkingLotInfo, route, iconUrl = null) {
        const parkingLotMarker = this.addMarker(route.parkingLot, iconUrl);
        let parkingLotInfoWindow = this.createParkingLotInfoWindow(parkingLotInfo);
        this.setParkingLotInfoWindowToBeOpenedByClick(parkingLotMarker, parkingLotInfoWindow, route);
        this.mapObjects.placeMarkers.push(parkingLotMarker);
    }

    setParkingLotInfoWindowToBeOpenedByClick(clickableMarker, parkingLotInfoWindow) {
        clickableMarker.addListener('click', () => {
            parkingLotInfoWindow.open(this.map);
            parkingLotInfoWindow.setPosition(clickableMarker.getPosition());
        });

    }

    createParkingLotInfoWindow(parkingLotInfo) {
        const parkingLotInfoWindow = new window.google.maps.InfoWindow({
            content: ReactDOMServer.renderToString(<ParkingInfoModal parkingLotInfo={parkingLotInfo}/>),
            zIndex: 1000,
        });
        return parkingLotInfoWindow
    }

    addDrivingRouteETAPopup(routeDrivingPath) {
        let estimatedTimeInfoWindow = this.createETAPopup(routeDrivingPath, "נסיעה: ", 0.75);
        this.mapObjects.drivingETAPopups.push(estimatedTimeInfoWindow);
    }

    addWalkingRouteETAPopup(routeWalkingPath) {
        let estimatedTimeInfoWindow = this.createETAPopup(routeWalkingPath, "הליכה: ", 0.5);
        this.mapObjects.walkingETAPopups.push(estimatedTimeInfoWindow);
    }

    createETAPopup(routePath, textPrefixBeforeEstimatedTime, positionOnRouteFragment) {
        let routeSteps = routePath.directionsRoute.legs[0].steps;
        let estimatedTime = routePath.directionsRoute.legs[0].duration.humanReadable.replace("mins", "דקות");
        let popUpPosition = routeSteps[Math.floor(routeSteps.length * positionOnRouteFragment)].startLocation;
        const estimatedTimeInfoWindow = new window.google.maps.InfoWindow({
            position: popUpPosition,
            content: `<div class="custom-infowindow" >${textPrefixBeforeEstimatedTime + estimatedTime}</div>`,
            headerDisabled: true,
            zIndex: 500,
            disableAutoPan: true
        });
        return estimatedTimeInfoWindow;
    }

    addPlaceMarker(placeObject, iconUrl = null) {
        const placeMarker = this.addMarker(placeObject, iconUrl);
        this.mapObjects.placeMarkers.push(placeMarker);
    }

    addMarker(placeObject, iconUrl = null) {
        return new window.google.maps.Marker({
            position: placeObject.location,
            map: this.map,
            title: placeObject.name,
            icon: {url: iconUrl, scaledSize: new window.google.maps.Size(70, 70)},
        });
    }

    clearMapObjectArray(mapObjectArray) {
        mapObjectArray.forEach(obj => obj.setMap(null));
        mapObjectArray.splice(0, mapObjectArray.length);
    }

    clearMapObjects() {
        this.clearMapObjectArray(this.mapObjects.placeMarkers);
        this.clearMapObjectArray(this.mapObjects.walkingETAPopups);
        this.clearMapObjectArray(this.mapObjects.drivingETAPopups);

        this.mapObjects.allRoutesPolylines.forEach(routeObjects => {
            routeObjects.forEach(obj => obj.setMap(null));
        });
        this.mapObjects.allRoutesPolylines = [];
    }

    fitMapBounds() {
        this.map.fitBounds(this.bounds);
    }
}