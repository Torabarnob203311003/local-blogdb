const { initDatabase, pool } = require('./config/database');

async function runSetup() {
    try {
        console.log('Initializing database and tables...');
        await initDatabase();
        console.log('✅ Database "blogdb" and tables ("users", "blogs") are ready!');
    } catch (err) {
        console.error('❌ Setup failed:', err.message);
    } finally {
        await pool.end();
    }
}

runSetup();
