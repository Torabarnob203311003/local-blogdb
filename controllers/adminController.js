const { pool } = require('../config/database');

/**
 * Admin Journey: View the complete user list by calling the allUsers() function.
 */
async function allUsers() {
    try {
        const [users] = await pool.execute(
            `SELECT id, firstname, lastname, email, isActive, role, createAt, updateAt
             FROM users
             ORDER BY id ASC`
        );

        if (users.length === 0) {
            console.log('\nNo users found in the database.');
            return;
        }

        console.log('\n==========================================================================');
        console.log('                            COMPLETE USER LIST                            ');
        console.log('==========================================================================');
        users.forEach((u) => {
            const activeStatus = Boolean(u.isActive);
            console.log(
                `ID: ${u.id} | Name: ${u.firstname} ${u.lastname} | Email: ${u.email} | Role: ${u.role} | isActive: ${activeStatus}`
            );
        });
        console.log('==========================================================================');
    } catch (err) {
        console.error('\n[Error] Failed to fetch users:', err.message);
    }
}

/**
 * Admin Journey: View all blogs from all users by calling the allUsersBlog() function.
 */
async function allUsersBlog() {
    try {
        const [blogs] = await pool.execute(
            `SELECT b.id, b.userId, b.blogTitle, b.blog, b.category, b.createAt, b.updateAt,
                    u.firstname, u.lastname, u.email
             FROM blogs b
             LEFT JOIN users u ON b.userId = u.id
             ORDER BY b.id ASC`
        );

        if (blogs.length === 0) {
            console.log('\nNo blogs are found');
            return;
        }

        console.log('\n==========================================================================');
        console.log('                         ALL BLOGS FROM ALL USERS                         ');
        console.log('==========================================================================');
        blogs.forEach((b) => {
            const authorName = b.firstname ? `${b.firstname} ${b.lastname}` : 'Unknown User';
            console.log(`Blog ID   : ${b.id} | Title: ${b.blogTitle} | Category: ${b.category}`);
            console.log(`Author    : ${authorName} (User ID: ${b.userId}, Email: ${b.email || 'N/A'})`);
            console.log(`Content   : ${b.blog}`);
            console.log(`Created   : ${new Date(b.createAt).toLocaleString()}`);
            console.log('--------------------------------------------------------------------------');
        });
    } catch (err) {
        console.error('\n[Error] Failed to fetch all users blogs:', err.message);
    }
}

/**
 * Admin Journey: Update a user's isActive status.
 */
async function updateUserActiveStatus(userId, isActiveBool) {
    try {
        const now = new Date();
        const [result] = await pool.execute(
            'UPDATE users SET isActive = ?, updateAt = ? WHERE id = ?',
            [isActiveBool ? 1 : 0, now, userId]
        );

        if (result.affectedRows === 0) {
            console.log(`\n[!] No user found with ID ${userId}.`);
            return;
        }

        console.log(
            `\n✅ User ID ${userId} status updated: isActive = ${Boolean(isActiveBool)}`
        );
    } catch (err) {
        console.error('\n[Error] Failed to update user status:', err.message);
    }
}

/**
 * Admin Journey: Delete any user.
 */
async function removeUserById(userId) {
    try {
        // Delete user's blogs first to ensure clean removal even if FK cascade isn't set
        await pool.execute('DELETE FROM blogs WHERE userId = ?', [userId]);

        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            console.log(`\n[!] No user found with ID ${userId}.`);
            return;
        }

        console.log(`\n✅ User ID ${userId} and their associated blogs have been deleted.`);
    } catch (err) {
        console.error('\n[Error] Failed to delete user:', err.message);
    }
}

module.exports = {
    allUsers,
    allUsersBlog,
    updateUserActiveStatus,
    removeUserById
};
