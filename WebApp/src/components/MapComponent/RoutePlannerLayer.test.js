import ReactDOMServer from 'react-dom/server';
import ParkingInfoModal from '../ParkingInfoModal/ParkingInfoModal';
import RoutePlannerLayer from "./RoutePlannerLayer";

jest.mock('react-dom/server', () => ({
    renderToString: jest.fn(),
}));

describe('RoutePlannerLayer tests', () => {
    let mapMock;
    let boundsMock;
    let routeMock;
    let mapObjectsMock;
    let routePlannerLayer;

    beforeEach(() => {
        mapMock = {};
        boundsMock = {extend: jest.fn()};
        routeMock = {
            drivingPath: {
                directionsRoute: {
                    legs: [
                        {
                            steps: [
                                {polyline: {encodedPath: 'encodedPathMock'}, startLocation: {lat: 1, lng: 1}},
                            ],
                            duration: {humanReadable: '10 mins'},
                        },
                    ],
                },
            },
            walkingPath: {
                directionsRoute: {
                    legs: [
                        {
                            steps: [
                                {polyline: {encodedPath: 'encodedPathMock'}, startLocation: {lat: 2, lng: 2}},
                            ],
                            duration: {humanReadable: '15 mins'},
                        },
                    ],
                },
            },
            parkingLot: {location: {lat: 3, lng: 3}},
        };
        mapObjectsMock = {
            drivingETAPopups: [],
            walkingETAPopups: [],
            placeMarkers: [],
            allRoutesPolylines: [],
        };

        window.google = {
            maps: {
                geometry: {
                    encoding: {
                        decodePath: jest.fn(() => [{lat: 0, lng: 0}]),
                    },
                },
                Polyline: jest.fn().mockImplementation(() => ({
                    setMap: jest.fn(),
                    addListener: jest.fn(),
                    setOptions: jest.fn(),
                    get: jest.fn()
                })),
                Marker: jest.fn().mockImplementation(() => ({
                    addListener: jest.fn(),
                    setMap: jest.fn(),
                })),
                InfoWindow: jest.fn().mockImplementation(() => ({
                    open: jest.fn(),
                    close: jest.fn(),
                })),
                Size: jest.fn(),
                SymbolPath: {CIRCLE: 'CIRCLE'},
                LatLngBounds: jest.fn(() => boundsMock),
            }
        };

        routePlannerLayer = new RoutePlannerLayer({map: mapMock, parkingLotIconUrl: 'iconUrl'});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add ETA popup for driving route', () => {
        routePlannerLayer.addDrivingRouteETAPopup(routeMock.drivingPath);

        expect(window.google.maps.InfoWindow).toHaveBeenCalledWith(expect.objectContaining({
            position: {lat: 1, lng: 1},
            content: '<div class="custom-infowindow" >נסיעה: 10 דקות</div>',
            headerDisabled: true,
            zIndex: 500,
            disableAutoPan: true,
        }));
        expect(routePlannerLayer.mapObjects.drivingETAPopups.length).toBe(1);
    });

    it('should add ETA popup for walking route', () => {
        routePlannerLayer.addWalkingRouteETAPopup(routeMock.walkingPath);

        expect(window.google.maps.InfoWindow).toHaveBeenCalledWith(expect.objectContaining({
            position: {lat: 2, lng: 2},
            content: '<div class="custom-infowindow" >הליכה: 15 דקות</div>',
            headerDisabled: true,
            zIndex: 500,
            disableAutoPan: true,
        }));
        expect(routePlannerLayer.mapObjects.walkingETAPopups.length).toBe(1);
    });

    it('should create driving route polylines', () => {
        const polylines = routePlannerLayer.createDrivingRoutePolylines(routeMock.drivingPath);

        expect(window.google.maps.geometry.encoding.decodePath).toHaveBeenCalledWith('encodedPathMock');
        expect(window.google.maps.Polyline).toHaveBeenCalledWith(expect.objectContaining({
            path: [{lat: 0, lng: 0}],
            geodesic: true,
            strokeOpacity: 1.0,
            strokeWeight: 4,
        }));
        expect(polylines.length).toBe(1);
    });

    it('should create walking route polylines', () => {
        const polylines = routePlannerLayer.createWalkingRoutePolylines(routeMock.walkingPath);

        expect(window.google.maps.geometry.encoding.decodePath).toHaveBeenCalledWith('encodedPathMock');
        expect(window.google.maps.Polyline).toHaveBeenCalledWith(expect.objectContaining({
            path: [{lat: 0, lng: 0}],
            strokeOpacity: 0,
            icons: [{
                icon: expect.objectContaining({
                    path: 'CIRCLE',
                    fillOpacity: 1,
                    scale: 2,
                    strokeOpacity: 1,
                    strokeWeight: 3,
                }),
                offset: '0',
                repeat: '10px',
            }],
        }));
        expect(polylines.length).toBe(1);
    });

    it('should add polylines to map and extend bounds', () => {
        const polylineMock = {
            setMap: jest.fn(),
            getPath: jest.fn().mockReturnValue([{lat: 0, lng: 0}])
        };
        const polylines = [polylineMock];

        routePlannerLayer.addPolyLinesToMapAndBounds(polylines);

        expect(polylineMock.setMap).toHaveBeenCalledWith(mapMock);
        expect(boundsMock.extend).toHaveBeenCalledWith({lat: 0, lng: 0});
    });

    it('should add route, configure polylines, add listeners, and change prominences', () => {
        const polylineMock = {
            addListener: jest.fn(),
            setMap: jest.fn(),
            getPath: jest.fn().mockReturnValue([{lat: 1, lng: 1}, {lat: 2, lng: 2}])
        };

        const createDrivingRoutePolylinesSpy = jest.spyOn(routePlannerLayer, 'createDrivingRoutePolylines').mockReturnValue([polylineMock]);
        const createWalkingRoutePolylinesSpy = jest.spyOn(routePlannerLayer, 'createWalkingRoutePolylines').mockReturnValue([polylineMock]);
        const addParkingLotMarkerSpy = jest.spyOn(routePlannerLayer, 'addParkingLotMarker').mockImplementation(() => {
        });
        const addDrivingRouteETAPopupSpy = jest.spyOn(routePlannerLayer, 'addDrivingRouteETAPopup').mockImplementation(() => {
        });
        const addWalkingRouteETAPopupSpy = jest.spyOn(routePlannerLayer, 'addWalkingRouteETAPopup').mockImplementation(() => {
        });


        routePlannerLayer.addRoute(routeMock, [{info: 'info'}]);

        expect(createDrivingRoutePolylinesSpy).toHaveBeenCalledWith(routeMock.drivingPath);
        expect(createWalkingRoutePolylinesSpy).toHaveBeenCalledWith(routeMock.walkingPath);

        expect(routePlannerLayer.mapObjects.allRoutesPolylines.length).toBe(1);
        const routePolylines = routePlannerLayer.mapObjects.allRoutesPolylines[0];

        routePolylines.forEach((polyline, index) => {
            expect(polyline.addListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        if (mapObjectsMock.placeMarkers.length > 0) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(addParkingLotMarkerSpy).toHaveBeenCalledWith({info: 'info'}, routeMock, 'iconUrl');
        }

        expect(addDrivingRouteETAPopupSpy).toHaveBeenCalledWith(routeMock.drivingPath);
        expect(addWalkingRouteETAPopupSpy).toHaveBeenCalledWith(routeMock.walkingPath);
    });

    it('should add a marker', () => {
        const placeObject = {location: {lat: 1, lng: 1}, name: 'Place'};

        const marker = routePlannerLayer.addMarker(placeObject, 'iconUrl');

        expect(window.google.maps.Marker).toHaveBeenCalledWith(expect.objectContaining({
            position: placeObject.location,
            map: mapMock,
            title: placeObject.name,
            icon: expect.objectContaining({
                url: 'iconUrl',
                scaledSize: expect.any(window.google.maps.Size),
            }),
        }));
    });

    it('should add a place marker', () => {
        const placeObject = {location: {lat: 1, lng: 1}, name: 'Place'};

        routePlannerLayer.addPlaceMarker(placeObject, 'iconUrl');

        expect(routePlannerLayer.mapObjects.placeMarkers.length).toBe(1);
        expect(window.google.maps.Marker).toHaveBeenCalledWith(expect.objectContaining({
            position: placeObject.location,
            map: mapMock,
            title: placeObject.name,
            icon: expect.objectContaining({
                url: 'iconUrl',
                scaledSize: expect.any(window.google.maps.Size),
            }),
        }));
    });

    it('should add a parking lot marker with info window', () => {
        const parkingLotInfo = {info: 'info'};

        routePlannerLayer.addParkingLotMarker(parkingLotInfo, routeMock, 'iconUrl');

        expect(window.google.maps.Marker).toHaveBeenCalledWith(expect.objectContaining({
            position: routeMock.parkingLot.location,
            map: mapMock,
            title: undefined,
            icon: expect.objectContaining({
                url: 'iconUrl',
                scaledSize: expect.any(window.google.maps.Size),
            }),
        }));
        expect(ReactDOMServer.renderToString).toHaveBeenCalledWith(<ParkingInfoModal parkingLotInfo={parkingLotInfo}/>);
        expect(routePlannerLayer.mapObjects.placeMarkers.length).toBe(1);
        expect(routePlannerLayer.mapObjects.placeMarkers[0].addListener).toHaveBeenCalledWith('click', expect.any(Function));
    });


    it('should clear map object array', () => {
        const mapObjectArray = [{setMap: jest.fn()}, {setMap: jest.fn()}];

        routePlannerLayer.clearMapObjectArray(mapObjectArray);

        mapObjectArray.forEach(obj => {
            expect(obj.setMap).toHaveBeenCalledWith(null);
        });
    });

    it('should clear all map objects', () => {
        routePlannerLayer.mapObjects = {
            placeMarkers: [{setMap: jest.fn()}],
            walkingETAPopups: [{setMap: jest.fn()}],
            drivingETAPopups: [{setMap: jest.fn()}],
            allRoutesPolylines: [[{setMap: jest.fn()}]],
        };

        routePlannerLayer.clearMapObjects();

        Object.values(routePlannerLayer.mapObjects).forEach(array => {
            array.forEach(obj => {
                expect(obj.setMap).toHaveBeenCalledWith(null);
            });
        });
    });

    it('should change route prominence', () => {
        const polylineMock = {
            setOptions: jest.fn(),
            get: jest.fn(() => [{icon: {strokeColor: ''}}]),
            set: jest.fn(),
        };
        routePlannerLayer.mapObjects = {
            allRoutesPolylines: [[polylineMock]],
            walkingETAPopups: [{open: jest.fn(), close: jest.fn()}],
            drivingETAPopups: [{open: jest.fn(), close: jest.fn()}],
        };

        routePlannerLayer.highlightRoute(0);

        expect(polylineMock.setOptions).toHaveBeenCalledWith(expect.objectContaining({
            strokeColor: '#0062ff',
            zIndex: 1000,
        }));
        expect(routePlannerLayer.mapObjects.walkingETAPopups[0].open).toHaveBeenCalledWith(mapMock);
        expect(routePlannerLayer.mapObjects.drivingETAPopups[0].open).toHaveBeenCalledWith(mapMock);
    });

    it('should change all routes prominences', () => {
        const polylineMock = {
            setOptions: jest.fn(),
            get: jest.fn(() => [{icon: {strokeColor: ''}}]),
            set: jest.fn(),
        };
        routePlannerLayer.mapObjects = {
            allRoutesPolylines: [[polylineMock], [polylineMock]],
            walkingETAPopups: [{open: jest.fn(), close: jest.fn()}, {open: jest.fn(), close: jest.fn()}],
            drivingETAPopups: [{open: jest.fn(), close: jest.fn()}, {open: jest.fn(), close: jest.fn()}],
        };

        routePlannerLayer.highlightSelectedRouteAndDehighlightOthers(0);

        expect(routePlannerLayer.mapObjects.walkingETAPopups[0].open).toHaveBeenCalledWith(mapMock);
        expect(routePlannerLayer.mapObjects.walkingETAPopups[1].close).toHaveBeenCalled();
        expect(routePlannerLayer.mapObjects.drivingETAPopups[0].open).toHaveBeenCalledWith(mapMock);
        expect(routePlannerLayer.mapObjects.drivingETAPopups[1].close).toHaveBeenCalled();
    });

    it('should fit map bounds', () => {
        mapMock.fitBounds = jest.fn();
        routePlannerLayer.map = mapMock;
        routePlannerLayer.bounds = boundsMock;

        routePlannerLayer.fitMapBounds();

        expect(mapMock.fitBounds).toHaveBeenCalledWith(boundsMock);
    });
});
