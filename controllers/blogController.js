const { pool } = require('../config/database');

/**
 * Reader Journey: Any reader can view all available blogs without logging in
 * by executing the allBlog() function.
 */
async function allBlog() {
    try {
        const [blogs] = await pool.execute(
            `SELECT b.id, b.userId, b.blogTitle, b.blog, b.category, b.createAt, b.updateAt,
                    u.firstname, u.lastname
             FROM blogs b
             LEFT JOIN users u ON b.userId = u.id
             ORDER BY b.id ASC`
        );

        if (blogs.length === 0) {
            console.log('\nNo blogs are found');
            return;
        }

        console.log('\n============================================================');
        console.log('                      ALL AVAILABLE BLOGS                   ');
        console.log('============================================================');
        blogs.forEach((item) => {
            const author = item.firstname ? `${item.firstname} ${item.lastname}` : `User #${item.userId}`;
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
        const [blogs] = await pool.execute(
            `SELECT id, blogTitle, category, createAt
             FROM blogs
             WHERE userId = ?
             ORDER BY id ASC`,
            [userId]
        );

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
 * Search for a blog by blog ID or blog title, and display the matching blog(s).
 * When `userId` is passed, filters within that user's blogs (or all blogs if omitted).
 */
async function searchBlogByIdOrTitle(queryInput, userId = null) {
    try {
        const cleanQuery = (queryInput || '').trim();
        if (!cleanQuery) {
            console.log('\n[!] Please enter a valid Blog ID or Title to search.');
            return;
        }

        const isId = !isNaN(cleanQuery) && Number.isInteger(Number(cleanQuery));

        let sql = `
            SELECT b.id, b.userId, b.blogTitle, b.blog, b.category, b.createAt, b.updateAt,
                   u.firstname, u.lastname
            FROM blogs b
            LEFT JOIN users u ON b.userId = u.id
            WHERE (b.blogTitle LIKE ? ${isId ? 'OR b.id = ?' : ''})
        `;
        const params = [`%${cleanQuery}%`];
        if (isId) {
            params.push(Number(cleanQuery));
        }

        if (userId !== null) {
            sql += ' AND b.userId = ?';
            params.push(userId);
        }

        sql += ' ORDER BY b.id ASC';

        const [results] = await pool.execute(sql, params);

        if (results.length === 0) {
            console.log('\nNo blogs are found');
            return;
        }

        console.log('\n================== MATCHING BLOG(S) ==================');
        results.forEach((item) => {
            const author = item.firstname ? `${item.firstname} ${item.lastname}` : `User #${item.userId}`;
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
 * Creates a new blog for the authenticated user.
 */
async function createNewBlog(userId, blogTitle, blogContent, category) {
    try {
        if (!blogTitle || !blogContent || !category) {
            console.log('\n[!] Blog Title, Content, and Category are required.');
            return;
        }

        const now = new Date();
        const [result] = await pool.execute(
            `INSERT INTO blogs (userId, blogTitle, blog, category, createAt, updateAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, blogTitle.trim(), blogContent.trim(), category.trim(), now, now]
        );

        console.log(`\n✅ Blog created successfully with ID: ${result.insertId}`);
    } catch (err) {
        console.error('\n[Error] Failed to create blog:', err.message);
    }
}

/**
 * Updates an existing blog by its blog ID.
 */
async function updateBlogById(blogId, userId, newTitle, newBlogContent, newCategory) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM blogs WHERE id = ? AND userId = ?',
            [blogId, userId]
        );

        if (rows.length === 0) {
            console.log('\n[!] Blog not found or you do not have permission to edit it.');
            return;
        }

        const current = rows[0];
        const updatedTitle = newTitle && newTitle.trim() !== '' ? newTitle.trim() : current.blogTitle;
        const updatedContent = newBlogContent && newBlogContent.trim() !== '' ? newBlogContent.trim() : current.blog;
        const updatedCategory = newCategory && newCategory.trim() !== '' ? newCategory.trim() : current.category;
        const now = new Date();

        await pool.execute(
            `UPDATE blogs
             SET blogTitle = ?, blog = ?, category = ?, updateAt = ?
             WHERE id = ? AND userId = ?`,
            [updatedTitle, updatedContent, updatedCategory, now, blogId, userId]
        );

        console.log(`\n✅ Blog ID ${blogId} has been updated successfully.`);
    } catch (err) {
        console.error('\n[Error] Could not update blog:', err.message);
    }
}

/**
 * Deletes a blog using its blog ID.
 * If userId is supplied, ensures only the owner can delete it.
 * If userId is null (Admin), deletes any blog by ID.
 */
async function deleteBlogById(blogId, userId = null) {
    try {
        let sql = 'DELETE FROM blogs WHERE id = ?';
        const params = [blogId];

        if (userId !== null) {
            sql += ' AND userId = ?';
            params.push(userId);
        }

        const [result] = await pool.execute(sql, params);

        if (result.affectedRows === 0) {
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
