const axios = require('axios');
const fs = require('fs');
const { getParkingLot, checkParkingLotStatus, createParkingLotInstance } = require('../services/achuzotHachofScraperService');
const ParkingLot = require('../models/parkingLot');
const cheerio = require("cheerio");
jest.mock('axios');

const readHtmlFile = async (filePath) => {
    try {
        return await fs.promises.readFile(filePath, 'utf8');
    } catch (err) {
        console.error('Error reading HTML file:', err);
        throw err;
    }
};


test('should create a valid parking lot instance', async () => {
    const allParkingLotsPage = await readHtmlFile('./test/allParkingLotsPage.html');
    const beitHadarParkingLotPage = await readHtmlFile('./test/beitHadarParkingLotPage.html');

    axios.get.mockResolvedValueOnce({data: allParkingLotsPage});
    axios.get.mockResolvedValueOnce({data: beitHadarParkingLotPage});

    const result = await getParkingLot('בית הדר');
    expect(axios.get).toHaveBeenNthCalledWith(2, "https://www.ahuzot.co.il/Parking/ParkingDetails/?ID=93");
    expect(result).toBeInstanceOf(ParkingLot);
    expect(result.name).toBe('חניון בית הדר ');
    expect(result.address).toBe('הרכבת 3');
    expect(result.parkingLotStatus).toBe('FULL');
    expect(result.numberOfSpots).toBe(580);
    expect(result.fixedPriceInformation).toBe("תעריף לכניסה חד פעמית  24 ₪תקף בימים א` - ה` בין השעות 16:00 עד 07:00 בבוקר שלמחרת ובימי שישי, שבת, ערבי חג וחגים בין השעות 07:00 עד 07:00 בבוקר שלמחרת");
});

test('should throw error given invalid input', async () => {
    const all_parking_lots_page = await readHtmlFile('./test/allParkingLotsPage.html');
    axios.get.mockResolvedValueOnce({data: all_parking_lots_page});

    await expect(async () => {
        await getParkingLot('abcd');
    }).rejects.toThrow('Parking lot not found');
});

test('should throw error given empty input', async () => {
    await expect(async () => {
        await getParkingLot('');
    }).rejects.toThrow('Parking lot name missing');
    await expect(async () => {
        await getParkingLot(null);
    }).rejects.toThrow('Parking lot name missing');
});

test('should should return OPEN parking lot status', async () => {
    const achimeirParkingLotPage = await readHtmlFile('./test/achimeirParkingLotPage.html');
    const parkingPage = cheerio.load(achimeirParkingLotPage);
    const parkingLotStatus = checkParkingLotStatus(parkingPage);
    expect(parkingLotStatus).toBe('OPEN');
});

test('should should return ACTIVE parking lot status', async () => {
    const abulafiaParkingLotPage = await readHtmlFile('./test/abulafiaParkingLotPage.html');
    const parkingPage = cheerio.load(abulafiaParkingLotPage);
    const parkingLotStatus = checkParkingLotStatus(parkingPage);
    expect(parkingLotStatus).toBe('ACTIVE');
});

test('should should return AVAILABLE parking lot status', async () => {
    const montefioriParkingLotPage = await readHtmlFile('./test/montefioriParkingLotPage.html');
    const parkingPage = cheerio.load(montefioriParkingLotPage);
    const parkingLotStatus = checkParkingLotStatus(parkingPage);
    expect(parkingLotStatus).toBe('AVAILABLE');
});

test('should should return NO_INFORMATION parking lot status', async () => {
    const montefioriNoStatusParkingLotPage = await readHtmlFile('./test/montefioriNoStatusParkingLotPage.html');
    const parkingPage = cheerio.load(montefioriNoStatusParkingLotPage);
    const parkingLotStatus = checkParkingLotStatus(parkingPage);
    expect(parkingLotStatus).toBe('NO_INFORMATION');
});

test('should throw error if parkingPage is empty', async () => {
    expect(async () => {
        checkParkingLotStatus(null);
    }).rejects.toThrow("Parking lot page cannot be null");
});

test('should throw error if arguments are null', async () => {
    expect(async () => {
        createParkingLotInstance("", null);
    }).rejects.toThrow("Arguments cannot be null");

    expect(async () => {
        createParkingLotInstance(null, "");
    }).rejects.toThrow("Arguments cannot be null");
});