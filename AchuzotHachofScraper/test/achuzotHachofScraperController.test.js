const request = require('supertest');
const express = require('express');
const app = express();
const parkingLotController = require('../controllers/achuzotHachofScraperController');
app.use('/api', parkingLotController);

jest.mock('../services/achuzotHachofScraperService', () => {
    const originalModule = jest.requireActual('../services/achuzotHachofScraperService');
    return {
        ...originalModule,
        getParkingLot: jest.fn(),
    };
});

const { getParkingLot } = require('../services/achuzotHachofScraperService');

describe('GET /parking-lot', () => {
    test('should return parking lot information', async () => {
        const mockParkingLot = {
            name: 'חניון בית הדר ',
            address: 'הרכבת 3',
            parkingLotStatus: 'FULL',
            numberOfSpots: 580,
            fixedPriceInformation: "תעריף לכניסה חד פעמית  24 ₪תקף בימים א` - ה` בין השעות 16:00 עד 07:00 בבוקר שלמחרת ובימי שישי, שבת, ערבי חג וחגים בין השעות 07:00 עד 07:00 בבוקר שלמחרת",
        };

        getParkingLot.mockResolvedValue(mockParkingLot);

        const response = await request(app)
            .get('/api/parking-lot')
            .query({ name: 'חניון בית הדר' })
            .expect(200);

        expect(response.body).toEqual(mockParkingLot);
    });

    test('should handle missing name parameter', async () => {
        const response = await request(app)
            .get('/api/parking-lot')
            .expect(400);

        expect(response.body.error).toBe('Name parameter is required');
    });

    test('should handle errors from service', async () => {
        const errorMessage = 'Failed to get parking lot';
        getParkingLot.mockRejectedValue(new Error(errorMessage));

        const response = await request(app)
            .get('/api/parking-lot')
            .query({ name: 'חניון לא קיים' })
            .expect(500);

        expect(response.body.error).toBe(errorMessage);
    });
});
