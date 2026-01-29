const express = require('express');
const router = express.Router();
const { Donor, Donation, Sequelize } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth'); // We need to create this middleware

// Get Hospital Stats
router.get('/stats', auth, async (req, res) => {
    try {
        const hospitalId = req.user.id;
        const { BloodInventory, Donation, BloodRequest } = require('../models');

        // Total blood units available in inventory
        const totalUnits = await BloodInventory.sum('units_available', {
            where: { hospital_id: hospitalId }
        }) || 0;

        // Units by blood group from inventory
        const unitsByGroup = await BloodInventory.findAll({
            attributes: ['blood_group', [Sequelize.col('units_available'), 'total_quantity']],
            where: { hospital_id: hospitalId }
        });

        // Pending Requests (from BloodRequest table)
        const pendingRequests = await BloodRequest.count({
            where: { hospital_id: hospitalId, status: 'Open' }
        });

        res.json({
            totalUnits,
            unitsByGroup,
            pendingRequests
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get All Donors
router.get('/donors/all', auth, async (req, res) => {
    try {
        const donors = await Donor.findAll({
            attributes: { exclude: ['password'] }, // Don't send passwords
            order: [['availability_status', 'DESC'], ['createdAt', 'DESC']] // Available donors first
        });
        res.json(donors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search Donors
router.get('/search', auth, async (req, res) => {
    try {
        const { blood_group, location } = req.query;

        let whereClause = { donor_type: { [Op.ne]: 'hidden' } }; // Basic filter if needed

        if (blood_group) {
            whereClause.blood_group = blood_group;
        }

        if (location) {
            whereClause[Op.or] = [
                { city: { [Op.like]: `%${location}%` } },
                { state: { [Op.like]: `%${location}%` } },
                { address: { [Op.like]: `%${location}%` } }
            ];
        }

        const donors = await Donor.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] } // Don't send passwords
        });

        res.json(donors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Blood Request (Actually logging a donation request/need)
// For now, let's assume this creates a 'pending' donation record or we need a Request model?
// The prompt said "blood request". Usually this means asking FOR blood.
// Let's create a specialized 'BloodRequest' table later if needed, but for now 
// we can use the Donation table to track "Requested" vs "Donated".
// If status is 'requested', it's a need. If 'donated', it's stock.
// Let's update Donation model status enum in mind.

module.exports = router;
