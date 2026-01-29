const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Donor = sequelize.define('Donor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Personal Details
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
        allowNull: false
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    blood_group: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    // Address Details
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: false
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    // Medical & Blood Info
    last_donation_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    chronic_diseases: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    medications: {
        type: DataTypes.STRING,
        allowNull: true
    },
    recent_surgeries: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    allergies: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hemoglobin: {
        type: DataTypes.FLOAT,
        allowNull: true
    },

    // Emergency Info
    emergency_contact_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    emergency_contact_number: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Location Info
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    preferred_donation_location: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Account & Status
    profile_photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    availability_status: {
        type: DataTypes.ENUM('Available', 'Busy', 'Not Available'),
        defaultValue: 'Available'
    },
    donor_type: {
        type: DataTypes.ENUM('First-time', 'Regular', 'Rare'),
        defaultValue: 'First-time'
    },

    // Virtual Field for Eligibility
    eligibility_status: {
        type: DataTypes.VIRTUAL,
        get() {
            if (!this.last_donation_date) return 'Eligible';

            const lastDate = new Date(this.last_donation_date);
            const today = new Date();
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const gap = this.gender === 'Female' ? 120 : 90;

            return diffDays >= gap ? 'Eligible' : `Eligible in ${gap - diffDays} days`;
        }
    }
});

module.exports = Donor;
