const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'blogdb';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT) || 3306;

// Create Sequelize ORM instance with custom timestamp column names (createAt & updateAt)
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    timezone: '+06:00',
    logging: false
});

// 1. User Model (table: users)
const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        firstname: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        role: {
            type: DataTypes.STRING(20),
            defaultValue: 'user'
        },
        createAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updateAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: 'users',
        timestamps: true,
        createdAt: 'createAt',
        updatedAt: 'updateAt'
    }
);

// 2. Blog Model (table: blogs)
const Blog = sequelize.define(
    'Blog',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        blogTitle: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        blog: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        createAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updateAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: 'blogs',
        timestamps: true,
        createdAt: 'createAt',
        updatedAt: 'updateAt'
    }
);

// 3. One-to-Many Relationship between users and blogs
User.hasMany(Blog, {
    foreignKey: 'userId',
    as: 'blogs',
    onDelete: 'CASCADE'
});
Blog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'author'
});

/**
 * Ensures `blogdb` exists in MySQL and syncs the Sequelize models (`users` and `blogs`).
 */
async function initDatabase() {
    let tempConn;
    try {
        tempConn = await mysql.createConnection({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPass
        });
        await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await tempConn.end();

        await sequelize.authenticate();
        await sequelize.sync();
    } catch (err) {
        console.error('\n[Database Error] Could not connect or initialize MySQL:', err.message);
        console.error('Please verify your MySQL server is running and check your .env credentials.\n');
    }
}

module.exports = {
    sequelize,
    User,
    Blog,
    initDatabase
};
