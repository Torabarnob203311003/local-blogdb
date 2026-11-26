const readline = require('readline-sync');
const { initDatabase, pool } = require('./config/database');
const authController = require('./controllers/authController');
const blogController = require('./controllers/blogController');
const adminController = require('./controllers/adminController');

/**
 * User Console Menu
 * Options:
 * 1. View Your Blogs
 * 2. Search Blog by ID/Title
 * 3. Create Blog
 * 4. Update Blog
 * 5. Delete Blog
 * 6. Logout
 */
async function showUserConsoleMenu(loggedInUser) {
    // Immediately after login:
    // If the user has no blogs, display "No blogs are found" in the console.
    // If the user has created blogs, display all blog titles created by that user.
    console.log('');
    await blogController.getUserBlogTitles(loggedInUser.id);

    let sessionActive = true;
    while (sessionActive) {
        console.log('\n================ USER CONSOLE MENU ================');
        console.log('1. View Your Blogs');
        console.log('2. Search Blog by ID/Title');
        console.log('3. Create Blog');
        console.log('4. Update Blog');
        console.log('5. Delete Blog');
        console.log('6. Logout');
        console.log('===================================================');

        const selection = readline.question('Choose an option (1-6): ').trim();

        switch (selection) {
            case '1':
                await blogController.getUserBlogTitles(loggedInUser.id);
                break;

            case '2': {
                const searchTerm = readline.question('Enter Blog ID or Blog Title to search: ');
                await blogController.searchBlogByIdOrTitle(searchTerm, loggedInUser.id);
                break;
            }

            case '3': {
                console.log('\n--- Create a New Blog ---');
                const blogTitle = readline.question('Enter Blog Title: ');
                const blogContent = readline.question('Enter Blog Content: ');
                const category = readline.question('Enter Blog Category: ');
                await blogController.createNewBlog(loggedInUser.id, blogTitle, blogContent, category);
                break;
            }

            case '4': {
                console.log('\n--- Update Your Blog ---');
                const blogId = readline.question('Enter Blog ID to update: ').trim();
                const newTitle = readline.question('New Blog Title (press Enter to keep current): ');
                const newContent = readline.question('New Blog Content (press Enter to keep current): ');
                const newCategory = readline.question('New Category (press Enter to keep current): ');
                await blogController.updateBlogById(blogId, loggedInUser.id, newTitle, newContent, newCategory);
                break;
            }

            case '5': {
                console.log('\n--- Delete Your Blog ---');
                const blogId = readline.question('Enter Blog ID to delete: ').trim();
                await blogController.deleteBlogById(blogId, loggedInUser.id);
                break;
            }

            case '6':
                console.log('\nLogging out of user account...');
                sessionActive = false;
                break;

            default:
                console.log('\n[!] Invalid option. Please enter a number between 1 and 6.');
        }
    }
}

/**
 * Admin Console Menu
 * Options:
 * 1. View All Users
 * 2. View All Blogs
 * 3. Search Blog by ID/Title
 * 4. Update User
 * 5. Delete User
 * 6. Delete Blog
 * 7. Logout
 */
async function showAdminConsoleMenu() {
    let adminActive = true;
    while (adminActive) {
        console.log('\n================ ADMIN CONSOLE MENU ================');
        console.log('1. View All Users');
        console.log('2. View All Blogs');
        console.log('3. Search Blog by ID/Title');
        console.log('4. Update User');
        console.log('5. Delete User');
        console.log('6. Delete Blog');
        console.log('7. Logout');
        console.log('====================================================');

        const selection = readline.question('Choose an option (1-7): ').trim();

        switch (selection) {
            case '1':
                await adminController.allUsers();
                break;

            case '2':
                await adminController.allUsersBlog();
                break;

            case '3': {
                const searchTerm = readline.question('Enter Blog ID or Blog Title to search: ');
                await blogController.searchBlogByIdOrTitle(searchTerm);
                break;
            }

            case '4': {
                console.log('\n--- Update User Active Status ---');
                const userId = readline.question('Enter User ID: ').trim();
                const statusStr = readline.question('Set isActive status (true/false): ').trim().toLowerCase();
                if (statusStr !== 'true' && statusStr !== 'false') {
                    console.log('\n[!] Please enter either "true" or "false".');
                } else {
                    const isActive = statusStr === 'true';
                    await adminController.updateUserActiveStatus(userId, isActive);
                }
                break;
            }

            case '5': {
                console.log('\n--- Delete User ---');
                const userId = readline.question('Enter User ID to delete: ').trim();
                await adminController.removeUserById(userId);
                break;
            }

            case '6': {
                console.log('\n--- Delete Any Blog ---');
                const blogId = readline.question('Enter Blog ID to delete: ').trim();
                await blogController.deleteBlogById(blogId);
                break;
            }

            case '7':
                console.log('\nLogging out of admin session...');
                adminActive = false;
                break;

            default:
                console.log('\n[!] Invalid option. Please enter a number between 1 and 7.');
        }
    }
}

/**
 * Main Application Entry Point
 * Startup Options:
 * 1. View All Blogs
 * 2. Login
 * 3. Register
 * 4. Exit
 */
async function startApp() {
    await initDatabase();

    let running = true;
    while (running) {
        console.log('\n====================================================');
        console.log('             BLOG MANAGEMENT CONSOLE APP            ');
        console.log('====================================================');
        console.log('1. View All Blogs');
        console.log('2. Login');
        console.log('3. Register');
        console.log('4. Exit');
        console.log('====================================================');

        const choice = readline.question('Select an option (1-4): ').trim();

        switch (choice) {
            case '1':
                await blogController.allBlog();
                break;

            case '2': {
                console.log('\n--- User / Admin Login ---');
                const email = readline.question('Email: ');
                const password = readline.question('Password: ', { hideEchoBack: true });
                const authenticatedUser = await authController.loginUser(email, password);

                if (authenticatedUser) {
                    if (authenticatedUser.role === 'admin') {
                        await showAdminConsoleMenu(authenticatedUser);
                    } else {
                        await showUserConsoleMenu(authenticatedUser);
                    }
                }
                break;
            }

            case '3': {
                console.log('\n--- Register New Account ---');
                const firstname = readline.question('First Name: ');
                const lastname = readline.question('Last Name: ');
                const email = readline.question('Email: ');
                const password = readline.question('Password: ', { hideEchoBack: true });
                await authController.registerUser(firstname, lastname, email, password);
                break;
            }

            case '4':
                console.log('\nThank you for using the Blog Management Console App. Goodbye!');
                running = false;
                await pool.end();
                process.exit(0);
                break;

            default:
                console.log('\n[!] Invalid choice. Please select an option between 1 and 4.');
        }
    }
}

if (require.main === module) {
    startApp();
}

module.exports = {
    startApp,
    allBlog: blogController.allBlog,
    allUsers: adminController.allUsers,
    allUsersBlog: adminController.allUsersBlog
};
