const { User, Blog } = require('../config/database');

/**
 * Admin Journey: View the complete user list by calling the allUsers() function.
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

        console.log('\n==========================================================================');
        console.log('                            COMPLETE USER LIST                            ');
        console.log('==========================================================================');
        users.forEach((record) => {
            const u = record.toJSON();
            console.log(
                `ID: ${u.id} | Name: ${u.firstname} ${u.lastname} | Email: ${u.email} | Role: ${u.role} | isActive: ${Boolean(u.isActive)}`
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

        console.log('\n==========================================================================');
        console.log('                         ALL BLOGS FROM ALL USERS                         ');
        console.log('==========================================================================');
        blogs.forEach((record) => {
            const b = record.toJSON();
            const authorName = b.author ? `${b.author.firstname} ${b.author.lastname}` : 'Unknown User';
            const authorEmail = b.author ? b.author.email : 'N/A';
            console.log(`Blog ID   : ${b.id} | Title: ${b.blogTitle} | Category: ${b.category}`);
            console.log(`Author    : ${authorName} (User ID: ${b.userId}, Email: ${authorEmail})`);
            console.log(`Content   : ${b.blog}`);
            console.log(`Created   : ${new Date(b.createAt).toLocaleString()}`);
            console.log('--------------------------------------------------------------------------');
        });
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

        console.log(
            `\n✅ User ID ${userId} status updated: isActive = ${Boolean(isActiveBool)}`
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
