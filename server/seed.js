const db = require('./src/models');
const bcrypt = require('bcrypt');

const seed = async () => {
    try {
        // Only force sync in dev/test, be careful in prod!
        await db.sequelize.sync({ force: true });
        console.log('Database synced');

        // Seed Hospitals
        const hospitals = await db.Hospital.bulkCreate([
            {
                name: 'City General Hospital',
                location: 'Downtown, NY',
                email: 'city@hospital.com',
                contact: '555-0101',
                password: 'password123'
            },
            {
                name: 'St. Mary\'s Medical Center',
                location: 'Westside, NY',
                email: 'stmary@hospital.com',
                contact: '555-0102',
                password: 'password123'
            }
        ]);
        console.log('Hospitals seeded');

        // Seed Donors with new schema
        const hashedPassword = await bcrypt.hash('password123', 10);
        const donors = await db.Donor.bulkCreate([
            {
                name: 'John Doe',
                age: 30,
                date_of_birth: '1993-05-15',
                gender: 'Male',
                blood_group: 'O+',
                phone: '555-1111',
                email: 'john@example.com',
                address: '123 Main St',
                city: 'New York',
                state: 'NY',
                pincode: '10001',
                password: hashedPassword,
                last_donation_date: '2023-10-15',
                chronic_diseases: false,
                hemoglobin: 14.5,
                emergency_contact_name: 'Jane Doe',
                emergency_contact_number: '555-9999',
                availability_status: 'Available',
                donor_type: 'Regular',
                preferred_donation_location: 'City General'
            },
            {
                name: 'Jane Smith',
                age: 25,
                date_of_birth: '1998-08-20',
                gender: 'Female',
                blood_group: 'A-',
                phone: '555-2222',
                email: 'jane@example.com',
                address: '456 Oak Ave',
                city: 'New York',
                state: 'NY',
                pincode: '10002',
                password: hashedPassword,
                last_donation_date: '2023-11-20',
                chronic_diseases: false,
                allergies: 'Peanuts',
                emergency_contact_name: 'Mom Smith',
                emergency_contact_number: '555-8888',
                availability_status: 'Busy',
                donor_type: 'First-time'
            },
            {
                name: 'Alice Johnson',
                age: 28,
                date_of_birth: '1995-03-10',
                gender: 'Female',
                blood_group: 'B+',
                phone: '555-3333',
                email: 'alice@example.com',
                address: '789 Pine Ln',
                city: 'New York',
                state: 'NY',
                pincode: '10003',
                password: hashedPassword,
                last_donation_date: null,
                chronic_diseases: false,
                emergency_contact_name: 'Damon Salvatore',
                emergency_contact_number: '555-7777',
                availability_status: 'Available',
                donor_type: 'Regular'
            },
            {
                name: 'Bob Brown',
                age: 35,
                date_of_birth: '1988-12-05',
                gender: 'Male',
                blood_group: 'AB+',
                phone: '555-4444',
                email: 'bob@example.com',
                address: '321 Elm St',
                city: 'Brooklyn',
                state: 'NY',
                pincode: '11201',
                password: hashedPassword,
                last_donation_date: '2023-09-10',
                chronic_diseases: true,
                medications: 'Hypertension meds',
                emergency_contact_name: 'Wife Brown',
                emergency_contact_number: '555-6666',
                availability_status: 'Not Available'
            },
            {
                name: 'Charlie Davis',
                age: 40,
                date_of_birth: '1983-07-25',
                gender: 'Male',
                blood_group: 'O-',
                phone: '555-5555',
                email: 'charlie@example.com',
                address: '654 Maple Dr',
                city: 'Queens',
                state: 'NY',
                pincode: '11301',
                password: hashedPassword,
                last_donation_date: '2023-12-01',
                chronic_diseases: false,
                emergency_contact_name: 'Brother Davis',
                emergency_contact_number: '555-5551',
                availability_status: 'Available',
                donor_type: 'Rare'
            }
        ]);
        console.log('Donors seeded');

        // Seed Donations
        await db.Donation.bulkCreate([
            {
                donor_id: donors[0].id,
                hospital_id: hospitals[0].id,
                blood_group: 'O+',
                quantity: 450,
                status: 'donated',
                date: '2023-10-15'
            },
            {
                donor_id: donors[1].id,
                hospital_id: hospitals[0].id,
                blood_group: 'A-',
                quantity: 450,
                status: 'donated',
                date: '2023-11-20'
            },
            {
                donor_id: donors[3].id,
                hospital_id: hospitals[1].id,
                blood_group: 'AB+',
                quantity: 450,
                status: 'donated',
                date: '2023-09-10'
            },
            {
                donor_id: donors[4].id,
                hospital_id: hospitals[1].id,
                blood_group: 'O-',
                quantity: 450,
                status: 'pending',
                date: '2023-12-01'
            }
        ]);
        console.log('Donations seeded');

        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
