const express = require('express');
const router = express.Router();
const { BloodInventory, BloodStock, sequelize } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

// Helper to check and mark expired stock
const checkAndMarkExpired = async (hospital_id) => {
    const today = new Date().toISOString().split('T')[0];
    const stocks = await BloodStock.findAll({
        where: {
            hospital_id,
            status: { [Op.notIn]: ['Expired', 'Issued'] },
            expiry_date: { [Op.lte]: today }
        }
    });

    if (stocks.length > 0) {
        const groups = [...new Set(stocks.map(s => s.blood_group))];
        await BloodStock.update(
            { status: 'Expired' },
            {
                where: {
                    id: { [Op.in]: stocks.map(s => s.id) }
                }
            }
        );
        for (const bg of groups) {
            await updateInventorySummary(hospital_id, bg);
        }
    }
};

// Get Inventory Summary for logged-in Hospital
router.get('/', auth, async (req, res) => {
    try {
        await checkAndMarkExpired(req.user.id);
        const inventory = await BloodInventory.findAll({
            where: { hospital_id: req.user.id }
        });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Detailed Blood Stock for logged-in Hospital
router.get('/detailed', auth, async (req, res) => {
    try {
        await checkAndMarkExpired(req.user.id);
        const stocks = await BloodStock.findAll({
            where: { hospital_id: req.user.id },
            order: [['expiry_date', 'ASC']]
        });
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to update inventory summary
const updateInventorySummary = async (hospital_id, blood_group) => {
    const available = await BloodStock.sum('quantity', {
        where: { hospital_id, blood_group, status: 'Available' }
    }) || 0;
    const reserved = await BloodStock.sum('quantity', {
        where: { hospital_id, blood_group, status: 'Reserved' }
    }) || 0;
    const issued = await BloodStock.sum('quantity', {
        where: { hospital_id, blood_group, status: 'Issued' }
    }) || 0;
    const expired = await BloodStock.sum('quantity', {
        where: { hospital_id, blood_group, status: 'Expired' }
    }) || 0;

    let stock = await BloodInventory.findOne({
        where: { hospital_id, blood_group }
    });

    if (stock) {
        stock.units_available = available;
        stock.units_reserved = reserved;
        stock.units_issued = issued;
        stock.units_expired = expired;
        stock.last_updated = new Date();
        await stock.save();
    } else {
        await BloodInventory.create({
            hospital_id,
            blood_group,
            units_available: available,
            units_reserved: reserved,
            units_issued: issued,
            units_expired: expired
        });
    }
};

// Add New Blood Stock Entry
router.post('/add', auth, async (req, res) => {
    try {
        const { blood_group, donor_name, donation_date, expiry_date, quantity } = req.body;
        console.log('Adding stock:', { blood_group, donor_name, donation_date, expiry_date, quantity, hospital_id: req.user.id });

        const newStock = await BloodStock.create({
            hospital_id: req.user.id,
            blood_group,
            donor_name,
            donation_date: donation_date || new Date(),
            expiry_date,
            quantity: quantity || 1,
            status: 'Available'
        });

        // Update summary
        await updateInventorySummary(req.user.id, blood_group);

        res.json(newStock);
    } catch (error) {
        console.error('Error adding blood stock:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update Detailed Stock Entry (Donor name, Expiry, etc.)
router.put('/stock/:id', auth, async (req, res) => {
    try {
        const { blood_group, donor_name, donation_date, expiry_date, quantity, status } = req.body;
        const stock = await BloodStock.findOne({
            where: { id: req.params.id, hospital_id: req.user.id }
        });

        if (!stock) {
            return res.status(404).json({ error: 'Stock entry not found' });
        }

        const oldBloodGroup = stock.blood_group;

        // Update fields if provided
        if (blood_group) stock.blood_group = blood_group;
        if (donor_name) stock.donor_name = donor_name;
        if (donation_date) stock.donation_date = donation_date;
        if (expiry_date) stock.expiry_date = expiry_date;
        if (quantity !== undefined) stock.quantity = quantity;
        if (status) stock.status = status;

        await stock.save();

        // Sync summary
        await updateInventorySummary(req.user.id, oldBloodGroup);
        if (blood_group && blood_group !== oldBloodGroup) {
            await updateInventorySummary(req.user.id, blood_group);
        }

        res.json(stock);
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update Stock Status (Issued, Expired, etc.) - Fast status switch
router.patch('/stock/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const stock = await BloodStock.findOne({
            where: { id: req.params.id, hospital_id: req.user.id }
        });

        if (!stock) {
            return res.status(404).json({ error: 'Stock entry not found' });
        }

        const oldBloodGroup = stock.blood_group;
        stock.status = status;
        await stock.save();

        // Update summary
        await updateInventorySummary(req.user.id, oldBloodGroup);

        res.json(stock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Stock Entry
router.delete('/stock/:id', auth, async (req, res) => {
    try {
        const stock = await BloodStock.findOne({
            where: { id: req.params.id, hospital_id: req.user.id }
        });

        if (!stock) {
            return res.status(404).json({ error: 'Stock entry not found' });
        }

        const blood_group = stock.blood_group;
        await stock.destroy();

        // Update summary
        await updateInventorySummary(req.user.id, blood_group);

        res.json({ message: 'Stock entry deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Inventory Summary Directly (Keep for compatibility if used elsewhere)
router.post('/update', auth, async (req, res) => {
    try {
        const { blood_group, units_available, units_reserved, units_issued, units_expired } = req.body;

        let stock = await BloodInventory.findOne({
            where: {
                hospital_id: req.user.id,
                blood_group: blood_group
            }
        });

        if (stock) {
            stock.units_available = units_available ?? stock.units_available;
            stock.units_reserved = units_reserved ?? stock.units_reserved;
            stock.units_issued = units_issued ?? stock.units_issued;
            stock.units_expired = units_expired ?? stock.units_expired;
            stock.last_updated = new Date();
            await stock.save();
        } else {
            stock = await BloodInventory.create({
                hospital_id: req.user.id,
                blood_group,
                units_available: units_available || 0,
                units_reserved: units_reserved || 0,
                units_issued: units_issued || 0,
                units_expired: units_expired || 0
            });
        }

        res.json(stock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

