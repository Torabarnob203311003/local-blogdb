const { User, Blog } = require('../config/database');
const { formatBangladeshDateTime } = require('./blogController');

// ANSI Color Codes for Terminal Styling
const COLORS = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
    gray: '\x1b[90m'
};

/**
 * Pads or truncates a plain string to a fixed visual width, then optionally wraps it in ANSI color codes.
 */
function formatCell(val, width, color = '') {
    const str = String(val ?? '');
    const truncated = str.length > width ? str.slice(0, width - 3) + '...' : str;
    const padded = truncated.padEnd(width, ' ');
    return color ? `${color}${padded}${COLORS.reset}` : padded;
}

/**
 * Admin Journey: View the complete user list by calling the allUsers() function.
 * Renders a colored ASCII table where isActive = true is GREEN and isActive = false is RED.
 */
async function allUsers() {
    try {
        const users = await User.findAll({
            attributes: ['id', 'firstname', 'lastname', 'email', 'isActive', 'role', 'createAt', 'updateAt'],
            order: [['id', 'ASC']]
        });

        if (users.length === 0) {
            console.log('\nNo users found in the database.');
            return;
        }

        const wId = 4;
        const wName = 20;
        const wEmail = 24;
        const wRole = 8;
        const wStatus = 10;
        const wCreated = 25;

        const borderTop = `┌${'─'.repeat(wId + 2)}┬${'─'.repeat(wName + 2)}┬${'─'.repeat(wEmail + 2)}┬${'─'.repeat(wRole + 2)}┬${'─'.repeat(wStatus + 2)}┬${'─'.repeat(wCreated + 2)}┐`;
        const borderMid = `├${'─'.repeat(wId + 2)}┼${'─'.repeat(wName + 2)}┼${'─'.repeat(wEmail + 2)}┼${'─'.repeat(wRole + 2)}┼${'─'.repeat(wStatus + 2)}┼${'─'.repeat(wCreated + 2)}┤`;
        const borderBot = `└${'─'.repeat(wId + 2)}┴${'─'.repeat(wName + 2)}┴${'─'.repeat(wEmail + 2)}┴${'─'.repeat(wRole + 2)}┴${'─'.repeat(wStatus + 2)}┴${'─'.repeat(wCreated + 2)}┘`;

        console.log(`\n${COLORS.bold}${COLORS.cyan}                                    ALL REGISTERED USERS TABLE                                    ${COLORS.reset}`);
        console.log(borderTop);
        console.log(
            `│ ${formatCell('ID', wId, COLORS.bold + COLORS.yellow)} │ ${formatCell('Full Name', wName, COLORS.bold + COLORS.yellow)} │ ${formatCell('Email', wEmail, COLORS.bold + COLORS.yellow)} │ ${formatCell('Role', wRole, COLORS.bold + COLORS.yellow)} │ ${formatCell('isActive', wStatus, COLORS.bold + COLORS.yellow)} │ ${formatCell('Created (BD Time)', wCreated, COLORS.bold + COLORS.yellow)} │`
        );
        console.log(borderMid);

        users.forEach((record) => {
            const u = record.toJSON();
            const fullName = `${u.firstname} ${u.lastname}`;
            const activeBool = Boolean(u.isActive);
            const statusColor = activeBool ? COLORS.bold + COLORS.green : COLORS.bold + COLORS.red;
            const roleColor = u.role === 'admin' ? COLORS.bold + COLORS.magenta : COLORS.cyan;
            const created = formatBangladeshDateTime(u.createAt);
            const createdShort = `${created.dateStr} ${created.timeStr}`;

            console.log(
                `│ ${formatCell(u.id, wId, COLORS.white)} │ ${formatCell(fullName, wName, COLORS.white)} │ ${formatCell(u.email, wEmail, COLORS.white)} │ ${formatCell(u.role, wRole, roleColor)} │ ${formatCell(String(activeBool), wStatus, statusColor)} │ ${formatCell(createdShort, wCreated, COLORS.gray)} │`
            );
        });

        console.log(borderBot);
    } catch (err) {
        console.error('\n[Error] Failed to fetch users:', err.message);
    }
}

/**
 * Admin Journey: View all blogs from all users by calling the allUsersBlog() function.
 * Renders a formatted colored table of all blogs across all users.
 */
async function allUsersBlog() {
    try {
        const blogs = await Blog.findAll({
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstname', 'lastname', 'email']
                }
            ],
            order: [['id', 'ASC']]
        });

        if (blogs.length === 0) {
            console.log('\nNo blogs are found');
            return;
        }

        const wId = 4;
        const wTitle = 28;
        const wCat = 16;
        const wAuthor = 18;
        const wContent = 30;
        const wCreated = 23;

        const borderTop = `┌${'─'.repeat(wId + 2)}┬${'─'.repeat(wTitle + 2)}┬${'─'.repeat(wCat + 2)}┬${'─'.repeat(wAuthor + 2)}┬${'─'.repeat(wContent + 2)}┬${'─'.repeat(wCreated + 2)}┐`;
        const borderMid = `├${'─'.repeat(wId + 2)}┼${'─'.repeat(wTitle + 2)}┼${'─'.repeat(wCat + 2)}┼${'─'.repeat(wAuthor + 2)}┼${'─'.repeat(wContent + 2)}┼${'─'.repeat(wCreated + 2)}┤`;
        const borderBot = `└${'─'.repeat(wId + 2)}┴${'─'.repeat(wTitle + 2)}┴${'─'.repeat(wCat + 2)}┴${'─'.repeat(wAuthor + 2)}┴${'─'.repeat(wContent + 2)}┴${'─'.repeat(wCreated + 2)}┘`;

        console.log(`\n${COLORS.bold}${COLORS.cyan}                                                 ALL BLOGS FROM ALL USERS                                                 ${COLORS.reset}`);
        console.log(borderTop);
        console.log(
            `│ ${formatCell('ID', wId, COLORS.bold + COLORS.yellow)} │ ${formatCell('Blog Title', wTitle, COLORS.bold + COLORS.yellow)} │ ${formatCell('Category', wCat, COLORS.bold + COLORS.yellow)} │ ${formatCell('Author (User ID)', wAuthor, COLORS.bold + COLORS.yellow)} │ ${formatCell('Blog Content', wContent, COLORS.bold + COLORS.yellow)} │ ${formatCell('Created (BD Time)', wCreated, COLORS.bold + COLORS.yellow)} │`
        );
        console.log(borderMid);

        blogs.forEach((record) => {
            const b = record.toJSON();
            const authorName = b.author
                ? `${b.author.firstname} ${b.author.lastname} (#${b.userId})`
                : `User #${b.userId}`;
            const created = formatBangladeshDateTime(b.createAt);
            const createdShort = `${created.dateStr} ${created.timeStr}`;

            console.log(
                `│ ${formatCell(b.id, wId, COLORS.bold + COLORS.green)} │ ${formatCell(b.blogTitle, wTitle, COLORS.bold + COLORS.white)} │ ${formatCell(b.category, wCat, COLORS.cyan)} │ ${formatCell(authorName, wAuthor, COLORS.magenta)} │ ${formatCell(b.blog, wContent, COLORS.white)} │ ${formatCell(createdShort, wCreated, COLORS.gray)} │`
            );
        });

        console.log(borderBot);
    } catch (err) {
        console.error('\n[Error] Failed to fetch all users blogs:', err.message);
    }
}

/**
 * Admin Journey: Update a user's isActive status using Sequelize User.update().
 */
async function updateUserActiveStatus(userId, isActiveBool) {
    try {
        const [updatedRows] = await User.update(
            { isActive: Boolean(isActiveBool) },
            { where: { id: userId } }
        );

        if (updatedRows === 0) {
            console.log(`\n[!] No user found with ID ${userId}.`);
            return;
        }

        const statusColored = isActiveBool
            ? `${COLORS.bold}${COLORS.green}true${COLORS.reset}`
            : `${COLORS.bold}${COLORS.red}false${COLORS.reset}`;

        console.log(
            `\n✅ User ID ${userId} status updated: isActive = ${statusColored}`
        );
    } catch (err) {
        console.error('\n[Error] Failed to update user status:', err.message);
    }
}

/**
 * Admin Journey: Delete any user using Sequelize User.destroy().
 */
async function removeUserById(userId) {
    try {
        await Blog.destroy({ where: { userId } });

        const deletedRows = await User.destroy({ where: { id: userId } });

        if (deletedRows === 0) {
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
