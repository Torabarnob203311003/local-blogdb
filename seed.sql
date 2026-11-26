-- Create Database
CREATE DATABASE IF NOT EXISTS blogdb;
USE blogdb;

-- Drop existing tables if resetting
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS users;

-- 1. Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) DEFAULT 'user',
    createAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create blogs table (One-to-Many relationship with users)
CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    blogTitle VARCHAR(255) NOT NULL,
    blog TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    createAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_blog_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Insert Demo Users (Admin, Active User, Deactivated User)
INSERT INTO users (id, firstname, lastname, email, password, isActive, role) VALUES
(1, 'System', 'Admin', 'admin@blogdb.com', 'admin123', TRUE, 'admin'),
(2, 'Arif', 'Hossain', 'arif@blogdb.com', 'user123', TRUE, 'user'),
(3, 'Nadia', 'Islam', 'nadia@blogdb.com', 'user123', FALSE, 'user');

-- 4. Insert Demo Blogs
INSERT INTO blogs (id, userId, blogTitle, blog, category) VALUES
(1, 2, 'Getting Started with Node.js and MySQL', 'Learn how to connect a Node.js console application to a MySQL database using mysql2.', 'Backend Development'),
(2, 2, 'Understanding REST vs CLI Architecture', 'A comparison between web APIs and interactive command-line applications.', 'Software Architecture');
