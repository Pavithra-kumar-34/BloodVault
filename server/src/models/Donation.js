const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Donor = require('./Donor');
const Hospital = require('./Hospital');

const Donation = sequelize.define('Donation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    blood_group: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER, // in ml
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending' // pending, donated, rejected
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    }
});

// Relationships
Donation.belongsTo(Donor, { foreignKey: 'donor_id' });
Donation.belongsTo(Hospital, { foreignKey: 'hospital_id' });
Donor.hasMany(Donation, { foreignKey: 'donor_id' });
Hospital.hasMany(Donation, { foreignKey: 'hospital_id' });

module.exports = Donation;
