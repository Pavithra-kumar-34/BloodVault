const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./src/models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Blood Donation System API is running...');
});

const authRoutes = require('./src/routes/auth');
const hospitalRoutes = require('./src/routes/hospital');
const donorRoutes = require('./src/routes/donor');

const requestRoutes = require('./src/routes/request');
const inventoryRoutes = require('./src/routes/inventory');
const publicRoutes = require('./src/routes/public');

app.use('/api/auth', authRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/public', publicRoutes);

// Database Sync and Server Start
db.sequelize.sync({ force: false }).then(() => {
    console.log('Database connected and synced');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database connection error:', err);
});
