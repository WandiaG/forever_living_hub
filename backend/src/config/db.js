import { createPool } from 'mysql2/promise';
import { configDotenv } from 'dotenv';

// Load environment variables from the .env file
configDotenv();

// Create a connection pool to handle multiple database connections efficiently.

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

console.log('Database pool created successfully.');

// Export the pool so it can be used throughout the application
export default pool;
