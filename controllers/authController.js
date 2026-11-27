const fs = require('fs');
const path = require('path');
const { User } = require('../config/database');

const SECURITY_STORE_PATH = path.join(__dirname, '..', 'config', 'securityAnswers.json');

/**
 * Loads saved security answers (email -> pet name) from local JSON store
 * so the MySQL `users` table keeps the exact 9 columns required by the assignment.
 */
function loadSecurityAnswers() {
    try {
        if (!fs.existsSync(SECURITY_STORE_PATH)) {
            const defaults = {
                'admin@blogdb.com': 'tiger',
                'arif@blogdb.com': 'tommy',
                'nadia@blogdb.com': 'mimi'
            };
            fs.writeFileSync(SECURITY_STORE_PATH, JSON.stringify(defaults, null, 2), 'utf-8');
            return defaults;
        }
        const raw = fs.readFileSync(SECURITY_STORE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

function saveSecurityAnswer(email, petName) {
    try {
        const answers = loadSecurityAnswers();
        answers[email.trim().toLowerCase()] = petName.trim().toLowerCase();
        fs.writeFileSync(SECURITY_STORE_PATH, JSON.stringify(answers, null, 2), 'utf-8');
    } catch (e) {
        // Non-fatal
    }
}

/**
 * Registers a new user using Sequelize User.create().
 * Default values: isActive = true, role = 'user'
 * Also saves the user's answer to "What is your pet name?" for Forgot Password recovery.
 */
async function registerUser(firstname, lastname, email, password, petName = '') {
    try {
        if (!firstname || !lastname || !email || !password) {
            console.log('\n[!] All fields (First Name, Last Name, Email, Password) are required.');
            return false;
        }

        if (!petName || !petName.trim()) {
            console.log('\n[!] Security Question answer ("What is your pet name?") is required.');
            return false;
        }

        const cleanEmail = email.trim();
        const existingUser = await User.findOne({
            where: { email: cleanEmail }
        });

        if (existingUser) {
            console.log('\n[!] An account with this email already exists. Please log in instead.');
            return false;
        }

        const newUser = await User.create({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            email: cleanEmail,
            password: password,
            isActive: true,
            role: 'user'
        });

        saveSecurityAnswer(cleanEmail, petName);

        console.log(`\n✅ Registration completed! Your Individual User ID is: ${newUser.id} (Role: ${newUser.role})`);
        console.log('🔒 Security Question ("What is your pet name?") saved for password recovery.');
        console.log('You can now log in to your account.');
        return true;
    } catch (err) {
        console.error('\n[Error] Failed to register user:', err.message);
        return false;
    }
}

/**
 * Authenticates a user by email and password using Sequelize User.findOne().
 * If isActive is false, displays "User is deactivated" and prevents login.
 * Returns { user: null, wrongPassword: true, email } if password was wrong so CLI can offer Forgot Password.
 */
async function loginUser(email, password) {
    try {
        if (!email || !password) {
            console.log('\n[!] Email and password cannot be empty.');
            return null;
        }

        const cleanEmail = email.trim();
        const userRecord = await User.findOne({
            where: { email: cleanEmail }
        });

        if (!userRecord) {
            console.log('\n[!] Invalid email or user does not exist.');
            return null;
        }

        const user = userRecord.toJSON();

        if (user.password !== password) {
            console.log('\n[!] Incorrect password.');
            return { wrongPassword: true, email: cleanEmail };
        }

        if (!user.isActive) {
            console.log('User is deactivated');
            return null;
        }

        if (user.role === 'admin') {
            console.log('\n====================================================');
            console.log('     Welcome to your dashboard (Admin Console)      ');
            console.log(`     Admin ID: ${user.id} | Name: ${user.firstname} ${user.lastname}`);
            console.log('====================================================');
        } else {
            console.log('\n====================================================');
            console.log('      Welcome to your dashboard (User Console)      ');
            console.log(`      User ID: ${user.id} | Name: ${user.firstname} ${user.lastname}`);
            console.log('====================================================');
        }

        return user;
    } catch (err) {
        console.error('\n[Error] Login failed:', err.message);
        return null;
    }
}

/**
 * Verifies the user's email and their security answer ("What is your pet name?").
 */
async function verifyPetNameAnswer(email, petNameInput) {
    try {
        if (!email || !petNameInput) {
            console.log('\n[!] Email and Security Question answer are required.');
            return false;
        }

        const cleanEmail = email.trim();
        const userRecord = await User.findOne({
            where: { email: cleanEmail }
        });

        if (!userRecord) {
            console.log('\n[!] No user account found with this email.');
            return false;
        }

        const answers = loadSecurityAnswers();
        const savedAnswer = answers[cleanEmail.toLowerCase()];

        if (!savedAnswer) {
            console.log('\n[!] No security answer is set for this account.');
            return false;
        }

        if (savedAnswer !== petNameInput.trim().toLowerCase()) {
            console.log('\n❌ Security Question answer does not match! Password reset denied.');
            return false;
        }

        console.log('\n✅ Security answer verified!');
        return true;
    } catch (err) {
        console.error('\n[Error] Verification failed:', err.message);
        return false;
    }
}

/**
 * Updates the user's password in MySQL (`users` table) using Sequelize User.update().
 */
async function resetUserPassword(email, newPassword) {
    try {
        if (!newPassword || !newPassword.trim()) {
            console.log('\n[!] New password cannot be empty.');
            return false;
        }

        const [updatedRows] = await User.update(
            { password: newPassword },
            { where: { email: email.trim() } }
        );

        if (updatedRows === 0) {
            console.log('\n[!] Failed to update password. User not found.');
            return false;
        }

        console.log('\n✅ Password has been reset successfully in MySQL! You can now log in with your new password.');
        return true;
    } catch (err) {
        console.error('\n[Error] Could not reset password:', err.message);
        return false;
    }
}

module.exports = {
    registerUser,
    loginUser,
    verifyPetNameAnswer,
    resetUserPassword
};
