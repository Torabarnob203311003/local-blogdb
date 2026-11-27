# CRUD Console Project — Blog Management CLI (`blogdb`)

A command-line CRUD blog management application built with **Node.js**, **JavaScript**, **Sequelize ORM**, and **MySQL**. This project implements role-based access for **Readers**, **Registered Users**, and **Admins** over a relational MySQL database (`blogdb`), along with colored terminal tables, Bangladesh Standard Time (`Asia/Dhaka`) formatting, and a bonus **Forgot Password (Security Question)** recovery workflow.

---

## Project Video Demonstration

- **Recorded Demo Video Link:** [Watch Project Demonstration Video on Google Drive](https://drive.google.com/drive/folders/18YGMEDnN2UusD9wlVWAHdDtlqz1qwhHd?usp=sharing)
- **Direct URL:** https://drive.google.com/drive/folders/18YGMEDnN2UusD9wlVWAHdDtlqz1qwhHd?usp=sharing

---

## Project Description

This CLI application provides an interactive console interface (`Blog Management Console App`) for creating, reading, updating, and deleting blogs and managing user accounts:
- **Readers** can view all blogs in the system without logging in via `allBlog()`.
- **Users** can register (with an individual User ID and a security question), log in to `Welcome to your dashboard (User Console)`, view their own blog titles, search blogs by ID or title (with separate fields and Bangladesh Date/Time), create multiple blogs, update or delete their blogs by blog ID, and recover forgotten passwords.
- **Admins** can log in to `Welcome to your dashboard (Admin Console)`, view all registered users in a colored terminal table via `allUsers()`, view all blogs from all users in a colored table via `allUsersBlog()`, search any blog by ID or title, activate/deactivate user accounts (`isActive` rendered in green for `true` and red for `false`), delete any user, and delete any blog.

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
| `id` | `INT` | `AUTO_INCREMENT PRIMARY KEY` | Unique Individual User ID |
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
| `id` | `INT` | `AUTO_INCREMENT PRIMARY KEY` | Unique Individual Blog ID |
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

1. **Startup Menu (`Blog Management Console App`)**
   - `1. View All Blogs` (`allBlog()`)
   - `2. Login`
   - `3. Register`
   - `4. Forgot Password` *(Bonus Feature)*
   - `5. Exit`
2. **User Journey & Console Menu (`Welcome to your dashboard (User Console)`)**
   - Assigns an individual `User ID` upon registration and displays it on the dashboard header.
   - Automatically displays the user's created blog titles upon login (or `"No blogs are found"` if none exist).
   - `1. View Your Blogs`
   - `2. Search Blog by ID/Title` (Displays separate `Blog ID`, `Blog Title`, `Category`, `Blog Content`, `Author`, and `Created Date` & `Created Time` in Bangladesh Time)
   - `3. Create Blog`
   - `4. Update Blog` (by Blog ID)
   - `5. Delete Blog` (by Blog ID)
   - `6. Logout`
3. **Admin Journey & Console Menu (`Welcome to your dashboard (Admin Console)`)**
   - `1. View All Users` (`allUsers()` — Renders a colored terminal table where `isActive: true` is displayed in **Green** text and `isActive: false` is displayed in **Red** text)
   - `2. View All Blogs` (`allUsersBlog()` — Renders all blogs in a formatted colored table)
   - `3. Search Blog by ID/Title`
   - `4. Update User` (Toggle `isActive` between `true` and `false`; deactivated users see `"User is deactivated"` when attempting to log in)
   - `5. Delete User`
   - `6. Delete Blog`
   - `7. Logout`

---

## Bonus / Advanced Feature: Forgot Password with Security Question Verification

As an additional enhancement beyond the core assignment requirements, I implemented a complete **Forgot Password Recovery System** using a **Pet Name Security Question (`"What is your pet name?"`)**.

### How the Forgot Password Flow Works
1. **Security Question Collection During Registration:**
   - When a user creates an account (`Register`), alongside `First Name`, `Last Name`, `Email`, and `Password`, the CLI asks a security question:
     `Security Question - What is your pet name?:`
   - The user's answer is normalized (trimmed and lowercased) and stored securely while keeping the MySQL `users` table schema strictly aligned with the 9 required columns.
2. **Triggering Forgot Password:**
   - A user can trigger password recovery in **two ways**:
     1. Directly selecting **`4. Forgot Password`** from the main console menu.
     2. Automatically being prompted (`Forgot your password? Reset it now using your Security Question? (y/n)`) if they enter an incorrect password during **`2. Login`**.
3. **Email & Security Question Verification:**
   - The system asks for the user's registered **Email** and verifies that the account exists in the `users` table in MySQL.
   - Next, it asks the security question:
     `Security Question - What is your pet name?:`
   - It compares the user's input against the answer saved during account registration.
4. **Creating a New Password:**
   - If the security answer matches, the **`Create New Password`** screen appears (`Enter New Password` and `Confirm New Password` with hidden password input).
   - Once confirmed, the new password is immediately updated in the MySQL `users` table via Sequelize ORM (`User.update()`), and the user can log in with their new password right away.

### Functions Implemented in Code for Forgot Password
- **`registerUser(firstname, lastname, email, password, petName)`** *(in `controllers/authController.js`)*:
  Creates the user record in MySQL via `User.create()` and saves the user's security answer via `saveSecurityAnswer(email, petName)`.
- **`saveSecurityAnswer(email, petName)` & `loadSecurityAnswers()`** *(in `controllers/authController.js`)*:
  Manages persistent storage and retrieval of each user's pet-name security answer mapped to their email address.
- **`verifyPetNameAnswer(email, petNameInput)`** *(in `controllers/authController.js`)*:
  Checks whether the email exists in the MySQL `users` table (`User.findOne()`) and validates whether `petNameInput` matches the user's registered pet name.
- **`resetUserPassword(email, newPassword)`** *(in `controllers/authController.js`)*:
  Executes `User.update({ password: newPassword }, { where: { email } })` to update the user's password directly in the MySQL `blogdb` database.
- **`handleForgotPasswordFlow(prefilledEmail)`** *(in `index.js`)*:
  Controls the interactive console prompts for email lookup, asking `"Security Question - What is your pet name?"`, validating password confirmation, and completing the password reset.

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

### 5. Promote a User to Admin Manually (SQL / DBeaver)
By default, newly registered users have `role = 'user'`. To set an account as admin in MySQL or DBeaver:
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
| Role | Email | Password | Security Pet Name | `isActive` | Expected Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@blogdb.com` | `admin123` | `tiger` | `true` | Opens `Welcome to your dashboard (Admin Console)` |
| **Active User** | `arif@blogdb.com` | `user123` | `tommy` | `true` | Lists user's blog titles & opens `Welcome to your dashboard (User Console)` |
| **Deactivated User** | `nadia@blogdb.com` | `user123` | `mimi` | `false` | Blocks login & prints `User is deactivated` |
