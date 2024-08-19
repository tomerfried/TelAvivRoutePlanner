import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import MapComponent, {getIndexOfShortestRoute} from './MapComponent';
import {fetchRoutes, fetchParkingLotsInformation} from '../../services/api';
import * as ReactGoogleMapsApi from "@react-google-maps/api";
import {initialize} from '@googlemaps/jest-mocks';
import * as Api from "../../services/api.js";
import RoutePlannerLayer from "./RoutePlannerLayer";

jest.mock('./RoutePlannerLayer');

jest.mock('../../services/api', () => ({
    fetchRoutes: jest.fn(),
    fetchParkingLotsInformation: jest.fn(),
}));

afterEach(() => {
    jest.clearAllMocks();
});

describe('MapComponent', () => {
    let boundsMock;
    let responseRoutesMock;
    let responseParkingLotsInfosMock

    beforeEach(() => {
        jest.clearAllMocks();
        initialize();

        window.google = {
            maps: {
                Map: jest.fn().mockImplementation(() => ({
                    setCenter: jest.fn(),
                    getCenter: jest.fn().mockImplementation(() => ({
                        toJSON: jest.fn(),
                    })),
                    setZoom: jest.fn(),
                    getZoom: jest.fn(),
                    setOptions: jest.fn(),
                    fitBounds: jest.fn(),
                })),
                LatLngBounds: jest.fn(() => boundsMock),
                ControlPosition: {TOP_RIGHT: 'TOP_RIGHT'}
            }
        };

        responseRoutesMock = [{parkingLot: {name: 'ParkingLot1', info: 'Info1'}}]
        responseParkingLotsInfosMock = [{name: 'ParkingLot1', info: 'Info1'}];
    });

    test('tests whether the required set of operations is performed once Search is clicked', async () => {
        jest.spyOn(ReactGoogleMapsApi, "useJsApiLoader").mockReturnValue({
            isLoaded: true
        });

        const fetchRoutesSpy = jest.spyOn(Api, 'fetchRoutes').mockImplementation(() => responseRoutesMock);
        const fetchParkingLotsInformationSpy = jest.spyOn(Api, 'fetchParkingLotsInformation').mockImplementation(() => responseParkingLotsInfosMock);

        const {rerender} = render(<MapComponent/>);

        fireEvent.change(screen.getByLabelText("Origin:"), {target: {value: 'Origin'}});
        fireEvent.change(screen.getByLabelText("Destination:"), {target: {value: 'Destination'}});
        fireEvent.click(screen.getByRole('button', {name: "Search"}));

        await waitFor(() => expect(fetchRoutesSpy).toHaveBeenCalledWith('Origin', 'Destination'));
        await waitFor(() => expect(fetchParkingLotsInformationSpy).toHaveBeenCalledWith(['ParkingLot1']));

        rerender(<MapComponent/>);

        expect(RoutePlannerLayer).toHaveBeenCalled();
        expect(RoutePlannerLayer.mock.instances[0].clearMapObjects).toHaveBeenCalled();
        expect(RoutePlannerLayer.mock.instances[0].addPlaceMarker).toHaveBeenCalled();
        expect(RoutePlannerLayer.mock.instances[0].addRoute).toHaveBeenCalled();
        expect(RoutePlannerLayer.mock.instances[0].highlightSelectedRouteAndDehighlightOthers).toHaveBeenCalled();
        expect(RoutePlannerLayer.mock.instances[0].fitMapBounds).toHaveBeenCalled();
    });

    it('should get index of shortest route', () => {
        const routes = [
            {totalTime: 20},
            {totalTime: 10},
            {totalTime: 30},
        ];

        const index = getIndexOfShortestRoute(routes);

        expect(index).toBe(1);
    });
});
