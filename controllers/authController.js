const { User } = require('../config/database');

/**
 * Registers a new user using Sequelize User.create().
 * Default values: isActive = true, role = 'user'
 */
async function registerUser(firstname, lastname, email, password) {
    try {
        if (!firstname || !lastname || !email || !password) {
            console.log('\n[!] All fields (First Name, Last Name, Email, Password) are required.');
            return false;
        }

        const existingUser = await User.findOne({
            where: { email: email.trim() }
        });

        if (existingUser) {
            console.log('\n[!] An account with this email already exists. Please log in instead.');
            return false;
        }

        await User.create({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            email: email.trim(),
            password: password,
            isActive: true,
            role: 'user'
        });

        console.log('\n✅ Registration completed! You can now log in to your account.');
        return true;
    } catch (err) {
        console.error('\n[Error] Failed to register user:', err.message);
        return false;
    }
}

/**
 * Authenticates a user by email and password using Sequelize User.findOne().
 * If isActive is false, displays "User is deactivated" and prevents login.
 */
async function loginUser(email, password) {
    try {
        if (!email || !password) {
            console.log('\n[!] Email and password cannot be empty.');
            return null;
        }

        const userRecord = await User.findOne({
            where: { email: email.trim() }
        });

        if (!userRecord) {
            console.log('\n[!] Invalid email or user does not exist.');
            return null;
        }

        const user = userRecord.toJSON();

        if (user.password !== password) {
            console.log('\n[!] Incorrect password. Please try again.');
            return null;
        }

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
