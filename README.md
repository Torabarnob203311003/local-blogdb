# CRUD Console Project — Blog Management CLI (`blogdb`)

A command-line CRUD blog management application built with **Node.js**, **JavaScript**, and **MySQL**. This project implements role-based access for **Readers**, **Registered Users**, and **Admins** over a relational MySQL database (`blogdb`).

---

## Project Video Demonstration

- **Recorded Demo Video Link:** `[Add Your Uploaded Demo Video Link Here]`

---

## Project Description

This CLI application provides an interactive console interface for creating, reading, updating, and deleting blogs and managing user accounts:
- **Readers** can view all blogs in the system without logging in via `allBlog()`.
- **Users** can register, log in, view their own blog titles, search blogs by ID or title, create multiple blogs, and update or delete their blogs by blog ID.
- **Admins** can view all registered users via `allUsers()`, view all blogs from all users via `allUsersBlog()`, search any blog by ID or title, activate/deactivate user accounts (`isActive`), delete any user, and delete any blog.

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** JavaScript (CommonJS)
- **Database:** MySQL (`blogdb`)
- **ORM:** Sequelize
- **Packages:** `sequelize`, `mysql2`, `readline-sync`, `dotenv`

---

## Database Information

### Database Name: `blogdb`

#### 1. `users` Table
| Field | Type | Default / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `AUTO_INCREMENT PRIMARY KEY` | Unique User ID |
| `firstname` | `VARCHAR(100)` | `NOT NULL` | User's first name |
| `lastname` | `VARCHAR(100)` | `NOT NULL` | User's last name |
| `email` | `VARCHAR(150)` | `UNIQUE NOT NULL` | User's login email |
| `password` | `VARCHAR(255)` | `NOT NULL` | User's password |
| `isActive` | `BOOLEAN` | `DEFAULT TRUE` | Account status (`false` prevents login) |
| `role` | `VARCHAR(20)` | `DEFAULT 'user'` | Role (`user` or manually updated to `admin`) |
| `createAt` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
| `updateAt` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Record update timestamp |

#### 2. `blogs` Table
| Field | Type | Default / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `AUTO_INCREMENT PRIMARY KEY` | Unique Blog ID |
| `userId` | `INT` | `FOREIGN KEY REFERENCES users(id)` | Author's User ID |
| `blogTitle` | `VARCHAR(255)` | `NOT NULL` | Title of the blog |
| `blog` | `TEXT` | `NOT NULL` | Full blog content |
| `category` | `VARCHAR(100)` | `NOT NULL` | Blog category |
| `createAt` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
| `updateAt` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Update timestamp |

#### Relationship (One-to-Many)
- One user can create multiple blogs (`users.id` -> `blogs.userId`).
- Each blog belongs to one user.

---

## Features

1. **Startup Menu**
   - `View All Blogs` (`allBlog()`)
   - `Login`
   - `Register`
2. **User Journey & Console Menu**
   - Automatically displays the user's created blog titles upon login (or `"No blogs are found"` if none exist).
   - `View Your Blogs`
   - `Search Blog by ID/Title`
   - `Create Blog`
   - `Update Blog` (by Blog ID)
   - `Delete Blog` (by Blog ID)
3. **Admin Journey & Console Menu**
   - `View All Users` (`allUsers()`)
   - `View All Blogs` (`allUsersBlog()`)
   - `Search Blog by ID/Title`
   - `Update User` (toggle `isActive` between `true` and `false`; deactivated users see `"User is deactivated"` when attempting to log in)
   - `Delete User`
   - `Delete Blog`

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd "CRUD console project"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root folder (you can copy `.env.example`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=blogdb
```
*(Both `node_modules/` and `.env` are added to `.gitignore` so they are never pushed to GitHub.)*

### 4. Initialize the Database & Tables
You can initialize the `blogdb` database and tables automatically:
```bash
npm run setup-db
```
Or load sample test accounts and blogs using:
```bash
npm run seed
```
*(Alternatively, you can execute `seed.sql` directly in MySQL Workbench / DBeaver / CLI.)*

### 5. Promote a User to Admin Manually (SQL)
By default, newly registered users have `role = 'user'`. To set an account as admin in MySQL:
```sql
USE blogdb;
UPDATE users SET role = 'admin' WHERE email = 'your_admin_email@example.com';
```

---

## Usage Instructions

Start the interactive CLI application:
```bash
npm start
```
or:
```bash
node index.js
```

### Pre-Seeded Test Accounts (After running `npm run seed`)
| Role | Email | Password | `isActive` | Expected Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@blogdb.com` | `admin123` | `true` | Opens Admin Console Menu |
| **Active User** | `arif@blogdb.com` | `user123` | `true` | Lists user's blog titles & opens User Console Menu |
| **Deactivated User** | `nadia@blogdb.com` | `user123` | `false` | Blocks login & prints `User is deactivated` |
# local-blogdb
