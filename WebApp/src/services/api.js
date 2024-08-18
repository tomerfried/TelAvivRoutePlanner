export const fetchRoutes = async (origin, destination) => {
    const routesResponse = await fetch(`http://localhost:3000/routes?origin=${origin}&destination=${destination}`);
    return await routesResponse.json();
};

export const fetchParkingLotsInformation = async (names) => {
    const parkingLotInfosResponse = await fetch(`http://localhost:3001/api/parking-lot?names=${names.join()}`);
    return await parkingLotInfosResponse.json();
};
