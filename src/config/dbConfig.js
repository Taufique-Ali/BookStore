import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on your server capacity
    queueLimit: 0,
});

try {
    await pool.getConnection().then((conn) => conn.release());
    console.log('Database connection pool created successfully.');
} catch (error) {
    console.error('Error creating database connection pool:', error);
    throw error;
}

export default pool;