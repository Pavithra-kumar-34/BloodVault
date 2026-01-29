const express = require('express');
const router = express.Router();
const { Donor } = require('../models');
const auth = require('../middleware/auth');

// Get Donor Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const donor = await Donor.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(donor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Availability
router.put('/availability', auth, async (req, res) => {
    try {
        const { status } = req.body; // 'Available', 'Busy', 'Not Available'
        await Donor.update({ availability_status: status }, {
            where: { id: req.user.id }
        });
        res.json({ message: 'Availability updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
