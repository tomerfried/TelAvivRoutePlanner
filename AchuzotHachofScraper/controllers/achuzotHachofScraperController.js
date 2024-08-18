const express = require('express');
const router = express.Router();
const { getParkingLots } = require("../services/achuzotHachofScraperService");


router.get('/parking-lot', async (req, res) => {
    try {
        const names = req.query.names.split(",");
        if (!names || names.length === 0) {
            return res.status(400).json({ error: 'Name parameter is required' });
        }
        const parkingLots = await getParkingLots(names);

        if (!parkingLots) {
            return res.status(404).json({ error: 'Parking lot not found' });
        }

        res.json(parkingLots);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
