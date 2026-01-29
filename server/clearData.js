const db = require('./src/models');

async function clearDatabase() {
    try {
        console.log('Starting database cleanup...');

        // Disable foreign key checks for manual deletion if needed, 
        // but force sync is easier for a full reset.
        // We'll use sync({ force: true }) to recreate tables and clear all data.
        await db.sequelize.sync({ force: true });

        console.log('Successfully deleted all data and reset tables!');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
}

clearDatabase();
