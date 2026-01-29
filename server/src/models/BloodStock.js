const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Hospital = require('./Hospital');
const Donor = require('./Donor');

const BloodStock = sequelize.define('BloodStock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    blood_group: {
        type: DataTypes.STRING,
        allowNull: false
    },
    donor_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    donation_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1 // usually 1 unit per entry
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Available' // Available, Reserved, Issued, Expired
    },
    hospital_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

// Relationships
BloodStock.belongsTo(Hospital, { foreignKey: 'hospital_id' });
Hospital.hasMany(BloodStock, { foreignKey: 'hospital_id' });

BloodStock.belongsTo(Donor, { foreignKey: 'donor_id', allowNull: true });
Donor.hasMany(BloodStock, { foreignKey: 'donor_id' });

module.exports = BloodStock;
