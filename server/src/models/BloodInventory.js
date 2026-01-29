const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Hospital = require('./Hospital');

const BloodInventory = sequelize.define('BloodInventory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    blood_group: {
        type: DataTypes.STRING, // A+, B+, etc.
        allowNull: false
    },
    units_available: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    units_reserved: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    units_issued: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    units_expired: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Relationships
BloodInventory.belongsTo(Hospital, { foreignKey: 'hospital_id' });
Hospital.hasMany(BloodInventory, { foreignKey: 'hospital_id' });

module.exports = BloodInventory;
