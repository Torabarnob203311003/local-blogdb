const { Op } = require('sequelize');
const { Blog, User } = require('../config/database');

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

function formatCell(val, width, color = '') {
    const str = String(val ?? '');
    const truncated = str.length > width ? str.slice(0, width - 3) + '...' : str;
    const padded = truncated.padEnd(width, ' ');
    return color ? `${color}${padded}${COLORS.reset}` : padded;
}

/**
 * Formats a timestamp into readable Bangladesh Time (Asia/Dhaka) with separate Date and Time.
 */
function formatBangladeshDateTime(dateInput) {
    if (!dateInput) {
        return { dateStr: 'N/A', timeStr: 'N/A', fullStr: 'N/A' };
    }
    const d = new Date(dateInput);

    const dateStr = d.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const timeStr = d.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    return {
        dateStr,
        timeStr,
        fullStr: `${dateStr} at ${timeStr} (BD Time)`
    };
}

/**
 * Helper to print a single blog with clearly separated fields
 * (Blog ID, Title, Category, Blog / Content, Author, Created Date & Time, Updated Date & Time).
 */
function printFormattedBlog(item) {
    const author = item.author
        ? `${item.author.firstname} ${item.author.lastname}`
        : `User #${item.userId}`;
    const created = formatBangladeshDateTime(item.createAt);
    const updated = formatBangladeshDateTime(item.updateAt);

    console.log(`${COLORS.bold}${COLORS.yellow}Blog ID      :${COLORS.reset} ${COLORS.bold}${COLORS.green}${item.id}${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.yellow}Blog Title   :${COLORS.reset} ${COLORS.bold}${COLORS.white}${item.blogTitle}${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.yellow}Category     :${COLORS.reset} ${COLORS.cyan}${item.category}${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.yellow}Blog Content :${COLORS.reset} ${item.blog}`);
    console.log(`${COLORS.bold}${COLORS.yellow}Author       :${COLORS.reset} ${COLORS.magenta}${author} (User ID: ${item.userId})${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.yellow}Created Date :${COLORS.reset} ${created.dateStr}`);
    console.log(`${COLORS.bold}${COLORS.yellow}Created Time :${COLORS.reset} ${created.timeStr} (Bangladesh Time)`);
    console.log(`${COLORS.bold}${COLORS.yellow}Updated At   :${COLORS.reset} ${updated.fullStr}`);
    console.log('------------------------------------------------------------');
}

/**
 * Reader Journey: Any reader can view all available blogs without logging in
 * by executing the allBlog() function.
 * Displays all blogs in a formatted colored table.
 */
async function allBlog() {
    try {
        const blogs = await Blog.findAll({
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstname', 'lastname']
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

        console.log(`\n${COLORS.bold}${COLORS.cyan}                                                    ALL AVAILABLE BLOGS                                                   ${COLORS.reset}`);
        console.log(borderTop);
        console.log(
            `│ ${formatCell('ID', wId, COLORS.bold + COLORS.yellow)} │ ${formatCell('Blog Title', wTitle, COLORS.bold + COLORS.yellow)} │ ${formatCell('Category', wCat, COLORS.bold + COLORS.yellow)} │ ${formatCell('Author', wAuthor, COLORS.bold + COLORS.yellow)} │ ${formatCell('Blog Content', wContent, COLORS.bold + COLORS.yellow)} │ ${formatCell('Created (BD Time)', wCreated, COLORS.bold + COLORS.yellow)} │`
        );
        console.log(borderMid);

        blogs.forEach((b) => {
            const item = b.toJSON();
            const author = item.author
                ? `${item.author.firstname} ${item.author.lastname}`
                : `User #${item.userId}`;
            const created = formatBangladeshDateTime(item.createAt);
            const createdShort = `${created.dateStr} ${created.timeStr}`;

            console.log(
                `│ ${formatCell(item.id, wId, COLORS.bold + COLORS.green)} │ ${formatCell(item.blogTitle, wTitle, COLORS.bold + COLORS.white)} │ ${formatCell(item.category, wCat, COLORS.cyan)} │ ${formatCell(author, wAuthor, COLORS.magenta)} │ ${formatCell(item.blog, wContent, COLORS.white)} │ ${formatCell(createdShort, wCreated, COLORS.gray)} │`
            );
        });

        console.log(borderBot);
    } catch (err) {
        console.error('\n[Error] Could not retrieve blogs:', err.message);
    }
}

/**
 * Displays all blog titles created by the logged-in user in a colored table.
 * If the user has no blogs, displays "No blogs are found" in the console.
 */
async function getUserBlogTitles(userId) {
    try {
        const blogs = await Blog.findAll({
            where: { userId },
            attributes: ['id', 'blogTitle', 'category', 'createAt'],
            order: [['id', 'ASC']]
        });

        if (blogs.length === 0) {
            console.log('No blogs are found');
            return;
        }

        const wId = 4;
        const wTitle = 34;
        const wCat = 18;
        const wCreated = 25;

        const borderTop = `┌${'─'.repeat(wId + 2)}┬${'─'.repeat(wTitle + 2)}┬${'─'.repeat(wCat + 2)}┬${'─'.repeat(wCreated + 2)}┐`;
        const borderMid = `├${'─'.repeat(wId + 2)}┼${'─'.repeat(wTitle + 2)}┼${'─'.repeat(wCat + 2)}┼${'─'.repeat(wCreated + 2)}┤`;
        const borderBot = `└${'─'.repeat(wId + 2)}┴${'─'.repeat(wTitle + 2)}┴${'─'.repeat(wCat + 2)}┴${'─'.repeat(wCreated + 2)}┘`;

        console.log(`\n${COLORS.bold}${COLORS.cyan}                               YOUR BLOG TITLES                               ${COLORS.reset}`);
        console.log(borderTop);
        console.log(
            `│ ${formatCell('ID', wId, COLORS.bold + COLORS.yellow)} │ ${formatCell('Blog Title', wTitle, COLORS.bold + COLORS.yellow)} │ ${formatCell('Category', wCat, COLORS.bold + COLORS.yellow)} │ ${formatCell('Created (BD Time)', wCreated, COLORS.bold + COLORS.yellow)} │`
        );
        console.log(borderMid);

        blogs.forEach((b) => {
            const created = formatBangladeshDateTime(b.createAt);
            const createdShort = `${created.dateStr} ${created.timeStr}`;
            console.log(
                `│ ${formatCell(b.id, wId, COLORS.bold + COLORS.green)} │ ${formatCell(b.blogTitle, wTitle, COLORS.bold + COLORS.white)} │ ${formatCell(b.category, wCat, COLORS.cyan)} │ ${formatCell(createdShort, wCreated, COLORS.gray)} │`
            );
        });
        console.log(borderBot);
    } catch (err) {
        console.error('\n[Error] Could not fetch your blogs:', err.message);
    }
}

/**
 * Search for a blog by blog ID or blog title using Sequelize Op.or / Op.like.
 * Displays matching blog(s) with separate Title, Blog Content, Category, and Bangladesh Date & Time.
 */
async function searchBlogByIdOrTitle(queryInput, userId = null) {
    try {
        const cleanQuery = (queryInput || '').trim();
        if (!cleanQuery) {
            console.log('\n[!] Please enter a valid Blog ID or Title to search.');
            return;
        }

        const isNumericId = !isNaN(cleanQuery) && Number.isInteger(Number(cleanQuery));
        const orFilters = [{ blogTitle: { [Op.like]: `%${cleanQuery}%` } }];

        if (isNumericId) {
            orFilters.push({ id: Number(cleanQuery) });
        }

        const whereCondition = {
            [Op.or]: orFilters
        };

        if (userId !== null) {
            whereCondition.userId = userId;
        }

        const results = await Blog.findAll({
            where: whereCondition,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstname', 'lastname']
                }
            ],
            order: [['id', 'ASC']]
        });

        if (results.length === 0) {
            console.log('\nNo blogs are found');
            return;
        }

        console.log(`\n${COLORS.bold}${COLORS.cyan}===================== SEARCH BLOG DETAILS =====================${COLORS.reset}`);
        results.forEach((b) => {
            printFormattedBlog(b.toJSON());
        });
    } catch (err) {
        console.error('\n[Error] Search failed:', err.message);
    }
}

/**
 * Creates a new blog for the authenticated user using Sequelize Blog.create().
 */
async function createNewBlog(userId, blogTitle, blogContent, category) {
    try {
        if (!blogTitle || !blogContent || !category) {
            console.log('\n[!] Blog Title, Content, and Category are required.');
            return;
        }

        const created = await Blog.create({
            userId,
            blogTitle: blogTitle.trim(),
            blog: blogContent.trim(),
            category: category.trim()
        });

        const createdTime = formatBangladeshDateTime(created.createAt);
        console.log('\n✅ Blog created successfully!');
        console.log('---------------- CREATED BLOG SUMMARY ----------------');
        console.log(`Blog ID      : ${created.id}`);
        console.log(`Blog Title   : ${created.blogTitle}`);
        console.log(`Category     : ${created.category}`);
        console.log(`Blog Content : ${created.blog}`);
        console.log(`Created Date : ${createdTime.dateStr}`);
        console.log(`Created Time : ${createdTime.timeStr} (Bangladesh Time)`);
        console.log('------------------------------------------------------');
    } catch (err) {
        console.error('\n[Error] Failed to create blog:', err.message);
    }
}

/**
 * Updates an existing blog by its blog ID using Sequelize.
 */
async function updateBlogById(blogId, userId, newTitle, newBlogContent, newCategory) {
    try {
        const blogRecord = await Blog.findOne({
            where: { id: blogId, userId }
        });

        if (!blogRecord) {
            console.log('\n[!] Blog not found or you do not have permission to edit it.');
            return;
        }

        const updates = {};
        if (newTitle && newTitle.trim() !== '') updates.blogTitle = newTitle.trim();
        if (newBlogContent && newBlogContent.trim() !== '') updates.blog = newBlogContent.trim();
        if (newCategory && newCategory.trim() !== '') updates.category = newCategory.trim();

        await blogRecord.update(updates);
        console.log(`\n✅ Blog ID ${blogId} has been updated successfully.`);
    } catch (err) {
        console.error('\n[Error] Could not update blog:', err.message);
    }
}

/**
 * Deletes a blog using its blog ID via Sequelize Blog.destroy().
 */
async function deleteBlogById(blogId, userId = null) {
    try {
        const whereCondition = { id: blogId };
        if (userId !== null) {
            whereCondition.userId = userId;
        }

        const deletedCount = await Blog.destroy({
            where: whereCondition
        });

        if (deletedCount === 0) {
            console.log('\n[!] Blog not found or you are not authorized to delete it.');
            return;
        }

        console.log(`\n✅ Blog ID ${blogId} deleted successfully.`);
    } catch (err) {
        console.error('\n[Error] Could not delete blog:', err.message);
    }
}

module.exports = {
    allBlog,
    getUserBlogTitles,
    searchBlogByIdOrTitle,
    createNewBlog,
    updateBlogById,
    deleteBlogById,
    formatBangladeshDateTime
};
