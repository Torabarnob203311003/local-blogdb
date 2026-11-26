const { initDatabase, sequelize } = require('./config/database');

async function runSetup() {
    try {
        console.log('Initializing database and syncing Sequelize models...');
        await initDatabase();
        console.log('✅ Database "blogdb" and tables ("users", "blogs") are ready!');
    } catch (err) {
        console.error('❌ Setup failed:', err.message);
    } finally {
        await sequelize.close();
    }
}

runSetup();
