const express = require('express');
const router = express.Router();
const { Donor, BloodInventory, BloodRequest, Sequelize } = require('../models');

// Public Stats for Home Page
router.get('/public-stats', async (req, res) => {
    try {
        // Total Registered Donors
        const totalDonors = await Donor.count();

        // Active Donors (Available)
        const activeDonors = await Donor.count({ where: { availability_status: 'Available' } });

        // Total Blood Units Available (Sum of all inventories)
        const totalUnits = await BloodInventory.sum('units_available') || 0;

        // Active Requests
        const activeRequests = await BloodRequest.count({ where: { status: 'Open' } });

        res.json({
            totalDonors,
            activeDonors,
            totalUnits,
            activeRequests
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
