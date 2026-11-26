const { initDatabase, sequelize, User, Blog } = require('./config/database');

async function seedData() {
    try {
        await initDatabase();

        console.log('Syncing Sequelize models and resetting tables...');
        await sequelize.sync({ force: true });

        await User.bulkCreate([
            {
                id: 1,
                firstname: 'System',
                lastname: 'Admin',
                email: 'admin@blogdb.com',
                password: 'admin123',
                isActive: true,
                role: 'admin'
            },
            {
                id: 2,
                firstname: 'Arif',
                lastname: 'Hossain',
                email: 'arif@blogdb.com',
                password: 'user123',
                isActive: true,
                role: 'user'
            },
            {
                id: 3,
                firstname: 'Nadia',
                lastname: 'Islam',
                email: 'nadia@blogdb.com',
                password: 'user123',
                isActive: false,
                role: 'user'
            }
        ]);
        console.log('✅ Seeded 3 demo users (Admin, Active User, Deactivated User).');

        await Blog.bulkCreate([
            {
                id: 1,
                userId: 2,
                blogTitle: 'Getting Started with Node.js and MySQL',
                blog: 'Learn how to connect a Node.js console application to a MySQL database using Sequelize ORM and mysql2.',
                category: 'Backend Development'
            },
            {
                id: 2,
                userId: 2,
                blogTitle: 'Understanding REST vs CLI Architecture',
                blog: 'A comparison between web APIs and interactive command-line applications.',
                category: 'Software Architecture'
            }
        ]);
        console.log('✅ Seeded 2 sample blogs for userId 2.');
        console.log('\n🎉 Database seeding completed successfully with Sequelize ORM!');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        await sequelize.close();
    }
}

seedData();
