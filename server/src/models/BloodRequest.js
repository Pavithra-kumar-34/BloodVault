const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Hospital = require('./Hospital');

const BloodRequest = sequelize.define('BloodRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patient_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    blood_group: {
        type: DataTypes.STRING,
        allowNull: false
    },
    units_needed: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    required_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    contact_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emergency_level: {
        type: DataTypes.ENUM('Normal', 'Urgent', 'Critical'),
        defaultValue: 'Normal'
    },
    status: {
        type: DataTypes.ENUM('Open', 'Fulfilled', 'Closed'),
        defaultValue: 'Open'
    }
});

// Relationships
BloodRequest.belongsTo(Hospital, { foreignKey: 'hospital_id' });
Hospital.hasMany(BloodRequest, { foreignKey: 'hospital_id' });

module.exports = BloodRequest;
