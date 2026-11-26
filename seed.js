const { initDatabase, pool } = require('./config/database');

async function seedData() {
    try {
        await initDatabase();

        console.log('Resetting existing records in "blogs" and "users"...');
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
        await pool.execute('TRUNCATE TABLE blogs');
        await pool.execute('TRUNCATE TABLE users');
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

        const now = new Date();

        // Seed Users: 1 Admin, 1 Active User, 1 Deactivated User
        const sampleUsers = [
            [1, 'System', 'Admin', 'admin@blogdb.com', 'admin123', true, 'admin', now, now],
            [2, 'Arif', 'Hossain', 'arif@blogdb.com', 'user123', true, 'user', now, now],
            [3, 'Nadia', 'Islam', 'nadia@blogdb.com', 'user123', false, 'user', now, now]
        ];

        for (const u of sampleUsers) {
            await pool.execute(
                `INSERT INTO users (id, firstname, lastname, email, password, isActive, role, createAt, updateAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                u
            );
        }
        console.log('✅ Seeded 3 demo users (Admin, Active User, Deactivated User).');

        // Seed Blogs for Active User (userId: 2)
        const sampleBlogs = [
            [
                1,
                2,
                'Getting Started with Node.js and MySQL',
                'Learn how to connect a Node.js console application to a MySQL database using mysql2.',
                'Backend Development',
                now,
                now
            ],
            [
                2,
                2,
                'Understanding REST vs CLI Architecture',
                'A comparison between web APIs and interactive command-line applications.',
                'Software Architecture',
                now,
                now
            ]
        ];

        for (const b of sampleBlogs) {
            await pool.execute(
                `INSERT INTO blogs (id, userId, blogTitle, blog, category, createAt, updateAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                b
            );
        }
        console.log('✅ Seeded 2 sample blogs for userId 2.');
        console.log('\n🎉 Database seeding completed successfully!');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        await pool.end();
    }
}

seedData();
