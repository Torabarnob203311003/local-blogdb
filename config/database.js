const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blogdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

/**
 * Ensures the `blogdb` database and both `users` and `blogs` tables exist.
 */
async function initDatabase() {
    let tempConn;
    try {
        tempConn = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await tempConn.changeUser({ database: dbConfig.database });

        const usersTableSQL = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstname VARCHAR(100) NOT NULL,
                lastname VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                isActive BOOLEAN DEFAULT TRUE,
                role VARCHAR(20) DEFAULT 'user',
                createAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updateAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;

        const blogsTableSQL = `
            CREATE TABLE IF NOT EXISTS blogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                blogTitle VARCHAR(255) NOT NULL,
                blog TEXT NOT NULL,
                category VARCHAR(100) NOT NULL,
                createAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updateAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_blog_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            );
        `;

        await tempConn.query(usersTableSQL);
        await tempConn.query(blogsTableSQL);
    } catch (err) {
        console.error('\n[Database Error] Could not connect or initialize MySQL:', err.message);
        console.error('Please verify your MySQL server is running and check your .env credentials.\n');
    } finally {
        if (tempConn) {
            await tempConn.end();
        }
    }
}

module.exports = {
    pool,
    initDatabase
};
