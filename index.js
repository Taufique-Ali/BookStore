import 'dotenv/config';
import express from 'express';

import pool from './src/config/dbConfig.js';
import db from './src/config/dbConfig.js';
import router from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// router
app.use('/api', router);

// Test database connection
pool.getConnection()
    .then((conn) => {
        console.log('Database connected successfully.');
        conn.release();
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});