const { pool } = require('../config/database');

/**
 * Registers a new user in the `users` table.
 * Default values: isActive = true, role = 'user'
 */
async function registerUser(firstname, lastname, email, password) {
    try {
        if (!firstname || !lastname || !email || !password) {
            console.log('\n[!] All fields (First Name, Last Name, Email, Password) are required.');
            return false;
        }

        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email.trim()]
        );

        if (existingUsers.length > 0) {
            console.log('\n[!] An account with this email already exists. Please log in instead.');
            return false;
        }

        const now = new Date();
        await pool.execute(
            `INSERT INTO users (firstname, lastname, email, password, isActive, role, createAt, updateAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [firstname.trim(), lastname.trim(), email.trim(), password, true, 'user', now, now]
        );

        console.log('\n✅ Registration completed! You can now log in to your account.');
        return true;
    } catch (err) {
        console.error('\n[Error] Failed to register user:', err.message);
        return false;
    }
}

/**
 * Authenticates a user by email and password.
 * Checks if `isActive` is false and prints "User is deactivated" as required.
 */
async function loginUser(email, password) {
    try {
        if (!email || !password) {
            console.log('\n[!] Email and password cannot be empty.');
            return null;
        }

        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email.trim()]
        );

        if (rows.length === 0) {
            console.log('\n[!] Invalid email or user does not exist.');
            return null;
        }

        const user = rows[0];

        if (user.password !== password) {
            console.log('\n[!] Incorrect password. Please try again.');
            return null;
        }

        // If isActive is false (0 in MySQL TINYINT(1)), block login with exact message
        if (!user.isActive) {
            console.log('User is deactivated');
            return null;
        }

        console.log(`\n✅ Welcome back, ${user.firstname} ${user.lastname}! (Role: ${user.role})`);
        return user;
    } catch (err) {
        console.error('\n[Error] Login failed:', err.message);
        return null;
    }
}

module.exports = {
    registerUser,
    loginUser
};
