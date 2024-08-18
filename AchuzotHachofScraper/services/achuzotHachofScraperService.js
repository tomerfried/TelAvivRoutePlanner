const axios = require('axios');
const cheerio = require('cheerio');
const ParkingLot = require('../models/parkingLot');

const PARKING_URL = 'https://www.ahuzot.co.il/Parking/All/';

const PARKING_LOT_STATUS = {
    ACTIVE: 'ACTIVE',
    AVAILABLE: 'AVAILABLE',
    FULL: 'FULL',
    ALMOST_FULL: 'ALMOST_FULL',
    OPEN: 'OPEN',
    NO_INFORMATION: 'NO_INFORMATION'
};

const IMAGE_SELECTORS = {
    ACTIVE: "img[src*='pail.png']",
    AVAILABLE: "img[src*='panui.png']",
    FULL: "img[src*='male.png']",
    ALMOST_FULL: "img[src*='meat.png']"
};

const checkParkingLotStatus = (parkingPage) => {
    if (parkingPage === null) {
        throw new Error("Parking lot page cannot be null");
    }

    if (parkingPage(IMAGE_SELECTORS.ACTIVE).length > 0) return PARKING_LOT_STATUS.ACTIVE;
    if (parkingPage(IMAGE_SELECTORS.AVAILABLE).length > 0) return PARKING_LOT_STATUS.AVAILABLE;
    if (parkingPage(IMAGE_SELECTORS.FULL).length > 0) return PARKING_LOT_STATUS.FULL;
    if (parkingPage(IMAGE_SELECTORS.ALMOST_FULL).length > 0) return PARKING_LOT_STATUS.ALMOST_FULL;
    return PARKING_LOT_STATUS.NO_INFORMATION;
};

const createParkingLotInstance = (cheerioAPI, parkingPage) => {
    if (!cheerioAPI || !parkingPage) {
        throw new Error("Arguments cannot be null");
    }

    const name = parkingPage("td.ParkingTableHeader span.Title").text() || null;
    const address = (parkingPage("td.ParkingTable span.MainText").first().text()
        .split("כתובת החניון")[1]?.split(" תל-אביב יפו")[0]?.replace(":", "")?.trim()) || null;
    const parkingLotStatus = checkParkingLotStatus(parkingPage) || null;
    const numberOfSpots = parseInt(parkingPage("div#Icon6 table.ParkingIconTable").text(), 10) || null;

    const fixedPriceInformation = parkingPage("td.ParkingTable span.MainText p").filter((i, el) => {
        return cheerioAPI(el).text().includes("תעריף לכניסה חד פעמית");
    }).first().text() || null;

    if (name === null &&
        address === null &&
        parkingLotStatus === "NO_INFORMATION" &&
        numberOfSpots === null &&
        fixedPriceInformation === null) {
        throw new Error("Parking lot information not found");
    }

    return new ParkingLot(name, address, parkingLotStatus, numberOfSpots, fixedPriceInformation);
}


const getParkingLots = async (parkingLotsNames) => {
    if (!parkingLotsNames || parkingLotsNames.length === 0) {
        throw new Error('Parking lots names missing')
    }
    const response = await axios.get(PARKING_URL);
    const cheerioAPI = cheerio.load(response.data);
    const parkingLinks = cheerioAPI('a.ParkingLinkX');

    const parkingLotsInstances = []
    for (const name of parkingLotsNames) {
        try {
            const parkingUrl = parkingLinks.filter((_, element) => cheerioAPI(element).find('span').text().includes(name))
                .map((_, element) => cheerioAPI(element).attr('href'))
                .get()[0];
            const parkingPageResponse = await axios.get(parkingUrl);
            const parkingPage = cheerio.load(parkingPageResponse.data);
            parkingLotsInstances.push(createParkingLotInstance(cheerioAPI, parkingPage));
        }
        catch (error) {
            console.error(`Error fetching parking lot ${name}:`, error);
        }
    }
    return parkingLotsInstances
};

module.exports = {
    getParkingLots,
    checkParkingLotStatus,
    createParkingLotInstance
};
