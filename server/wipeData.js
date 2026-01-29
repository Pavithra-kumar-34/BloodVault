const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Processing database wipe...');

db.serialize(() => {
    // Disable foreign keys to avoid deletion errors
    db.run('PRAGMA foreign_keys = OFF');

    const tables = ['Donors', 'Hospitals', 'Donations', 'BloodInventories', 'BloodRequests'];

    tables.forEach(table => {
        db.run(`DELETE FROM ${table}`, (err) => {
            if (err) {
                console.error(`Error clearing ${table}:`, err.message);
            } else {
                console.log(`Table ${table} cleared.`);
            }
        });
        // Reset auto-increment
        db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
    });

    db.run('PRAGMA foreign_keys = ON');
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database wipe completed successfully.');
    }
});
