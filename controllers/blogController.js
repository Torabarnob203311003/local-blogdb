const { Op } = require('sequelize');
const { Blog, User } = require('../config/database');

/**
 * Reader Journey: Any reader can view all available blogs without logging in
 * by executing the allBlog() function.
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

        console.log('\n============================================================');
        console.log('                      ALL AVAILABLE BLOGS                   ');
        console.log('============================================================');
        blogs.forEach((b) => {
            const item = b.toJSON();
            const author = item.author
                ? `${item.author.firstname} ${item.author.lastname}`
                : `User #${item.userId}`;
            console.log(`Blog ID   : ${item.id}`);
            console.log(`Title     : ${item.blogTitle}`);
            console.log(`Category  : ${item.category}`);
            console.log(`Author    : ${author}`);
            console.log(`Content   : ${item.blog}`);
            console.log(`Created   : ${new Date(item.createAt).toLocaleString()}`);
            console.log('------------------------------------------------------------');
        });
    } catch (err) {
        console.error('\n[Error] Could not retrieve blogs:', err.message);
    }
}

/**
 * Displays all blog titles created by the logged-in user.
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

        console.log('\n---------------- YOUR BLOG TITLES ----------------');
        blogs.forEach((b) => {
            console.log(`ID: ${b.id} | Title: ${b.blogTitle} (Category: ${b.category})`);
        });
        console.log('--------------------------------------------------');
    } catch (err) {
        console.error('\n[Error] Could not fetch your blogs:', err.message);
    }
}

/**
 * Search for a blog by blog ID or blog title using Sequelize Op.or / Op.like.
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

        console.log('\n================== MATCHING BLOG(S) ==================');
        results.forEach((b) => {
            const item = b.toJSON();
            const author = item.author
                ? `${item.author.firstname} ${item.author.lastname}`
                : `User #${item.userId}`;
            console.log(`Blog ID   : ${item.id}`);
            console.log(`Title     : ${item.blogTitle}`);
            console.log(`Category  : ${item.category}`);
            console.log(`Author    : ${author} (User ID: ${item.userId})`);
            console.log(`Content   : ${item.blog}`);
            console.log(`Created   : ${new Date(item.createAt).toLocaleString()}`);
            console.log('------------------------------------------------------');
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

        console.log(`\n✅ Blog created successfully with ID: ${created.id}`);
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
    deleteBlogById
};
