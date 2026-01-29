const { Donor, Hospital } = require('./src/models');
const db = require('./src/models');

async function check() {
    try {
        const email = 'city@hospital.com';
        const donor = await Donor.findOne({ where: { email } });
        const hospital = await Hospital.findOne({ where: { email } });

        console.log('Checking email:', email);
        console.log('In Donor table:', donor ? 'YES (ID: ' + donor.id + ')' : 'NO');
        console.log('In Hospital table:', hospital ? 'YES (ID: ' + hospital.id + ')' : 'NO');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
