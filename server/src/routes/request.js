const express = require('express');
const router = express.Router();
const { BloodRequest, Hospital } = require('../models');
const auth = require('../middleware/auth');

// Create a Request (Hospital only)
router.post('/create', auth, async (req, res) => {
    try {
        const request = await BloodRequest.create({
            ...req.body,
            hospital_id: req.user.id
        });
        // TODO: Trigger notifications for matching donors here
        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Requests for Hospital (My Requests)
router.get('/hospital', auth, async (req, res) => {
    try {
        const requests = await BloodRequest.findAll({
            where: { hospital_id: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Open Requests (For Donors)
router.get('/all', auth, async (req, res) => {
    try {
        const requests = await BloodRequest.findAll({
            where: { status: 'Open' },
            include: [{ model: Hospital, attributes: ['name', 'city', 'phone'] }],
            order: [['emergency_level', 'DESC'], ['createdAt', 'DESC']] // Critical first
        });
        res.json(requests);
    } catch (error) {
    }
});

// Update a Request (Hospital only, own requests)
router.put('/update/:id', auth, async (req, res) => {
    try {
        const request = await BloodRequest.findOne({
            where: { id: req.params.id, hospital_id: req.user.id }
        });
        if (!request) return res.status(404).json({ error: 'Request not found or unauthorized' });

        await request.update(req.body);
        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a Request (Hospital only, own requests)
router.delete('/delete/:id', auth, async (req, res) => {
    try {
        console.log('=== DELETE REQUEST DEBUG ===');
        console.log('Request ID:', req.params.id);
        console.log('Logged in user:', req.user);
        console.log('User ID:', req.user.id);
        console.log('User Role:', req.user.role);

        // First, check if the request exists at all
        const anyRequest = await BloodRequest.findOne({
            where: { id: req.params.id }
        });

        if (!anyRequest) {
            console.log('Request does not exist in database at all');
            return res.status(404).json({ error: 'Blood request not found' });
        }

        console.log('Request found in database:', {
            id: anyRequest.id,
            hospital_id: anyRequest.hospital_id,
            patient_name: anyRequest.patient_name
        });

        // Now check if it belongs to this hospital
        if (anyRequest.hospital_id !== req.user.id) {
            console.log('Hospital ID mismatch!');
            console.log('Request belongs to hospital:', anyRequest.hospital_id);
            console.log('Current user is hospital:', req.user.id);
            return res.status(403).json({ error: 'You can only delete your own requests' });
        }

        await anyRequest.destroy();
        console.log('Request deleted successfully:', req.params.id);
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Delete request error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
