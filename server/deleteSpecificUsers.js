const db = require('./src/models');

const emailsToDelete = [
    "city@hhospital.com",
    "kumarnn1256@gmail.com",
    "uhduh@gmail.com",
    "jini12121@gmail.com",
    "city@hospital.com",
    "abcd@gmail.com"
];

async function deleteSpecificUsers() {
    try {
        console.log('Starting targeted deletion of specific users...');

        // Delete from Donors
        const donorCount = await db.Donor.destroy({
            where: {
                email: emailsToDelete
            }
        });
        console.log(`Deleted ${donorCount} donors.`);

        // Delete from Hospitals
        const hospitalCount = await db.Hospital.destroy({
            where: {
                email: emailsToDelete
            }
        });
        console.log(`Deleted ${hospitalCount} hospitals.`);

        console.log('Targeted deletion completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during targeted deletion:', error);
        process.exit(1);
    }
}

deleteSpecificUsers();
