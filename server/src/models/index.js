const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const Donor = require('./Donor');
const Hospital = require('./Hospital');
const Donation = require('./Donation');
const BloodInventory = require('./BloodInventory');
const BloodRequest = require('./BloodRequest');
const BloodStock = require('./BloodStock');

const db = {
    sequelize,
    Sequelize,
    Donor,
    Hospital,
    Donation,
    BloodInventory,
    BloodRequest,
    BloodStock
};

module.exports = db;
