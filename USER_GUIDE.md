# 📖 Complete User Guide

## Welcome! 👋

Welcome to the **System Call Interface** - a user-friendly web application that lets you safely interact with your computer's operating system through a secure interface. This guide will walk you through everything you need to know, even if you're completely new to programming or operating systems!

---

## Table of Contents

1. [What is This Project?](#what-is-this-project)
2. [Getting Started](#getting-started)
3. [Understanding User Roles](#understanding-user-roles)
4. [How to Use the Application](#how-to-use-the-application)
5. [System Calls Explained](#system-calls-explained)
6. [Dashboard Guide](#dashboard-guide)
7. [Managing Users (Admin Only)](#managing-users-admin-only)
8. [Managing Policies (Admin Only)](#managing-policies-admin-only)
9. [Dark Mode](#dark-mode)
10. [Troubleshooting](#troubleshooting)
11. [Frequently Asked Questions](#frequently-asked-questions)

---

## What is This Project?

### The Simple Explanation

Imagine your computer's operating system as a big library with many books (files) and reading rooms (processes). Normally, you'd need to know special commands to access these resources. This application is like a friendly librarian that:

- Helps you browse files safely
- Shows you what's running on your computer
- Keeps track of everything you do
- Makes sure you only access what you're allowed to

### Technical Explanation

This is a **System Call Interface** - a web-based application that provides a controlled environment for executing operating system operations. It demonstrates OS concepts like:

- **System Calls**: Functions that request services from the OS kernel
- **Access Control**: Different users have different permissions
- **Audit Logging**: Every action is recorded for security
- **Process Management**: View and control running programs

---

## Getting Started

### Step 1: Installation

Before you can use the application, you need to install it on your computer.

#### Prerequisites (What You Need)

1. **Node.js** (version 20 or higher)
   - This is like the engine that runs our application
   - Download from: https://nodejs.org/
   - Click "Download LTS" and install

2. **A Web Browser**
   - Chrome, Firefox, Edge, or Safari
   - Any modern browser works!

3. **A Code Editor** (Optional, but helpful)
   - VS Code is recommended: https://code.visualstudio.com/
   - This lets you view the code if you're curious

#### Installation Steps

**Step 1: Download the Project**
```bash
# If you have Git installed:
git clone https://github.com/jaiveerminhas06/-User-Friendly-System-Call-Interface-for-Enhanced-Security.git

# Or download the ZIP file from GitHub and extract it
```

**Step 2: Open Your Terminal/Command Prompt**
- **Windows**: Press `Windows + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `terminal`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

**Step 3: Navigate to the Project Folder**
```bash
cd path/to/SysCall\ Interface
```

**Step 4: Install Dependencies**
```bash
npm install
```
This downloads all the necessary libraries. It might take a few minutes!

**Step 5: Set Up the Database**
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```
This creates your database and adds test accounts.

**Step 6: Start the Application**
```bash
npm run dev
```

**Step 7: Open Your Browser**
Visit: `http://localhost:3000`

🎉 You should see the login page!

---

## Understanding User Roles

The application has three types of users, each with different permissions:

### 1. 👁️ Viewer (Read-Only Access)

**What they can do:**
- ✅ View system information (CPU, memory, OS details)
- ✅ List directory contents
- ✅ View logs of their own actions

**What they CANNOT do:**
- ❌ Create or modify files
- ❌ Delete files
- ❌ Run commands
- ❌ Access admin features

**Best for:** Students learning OS concepts, read-only monitoring

**Test Account:**
- Email: `viewer@syscall.local`
- Password: `viewer123`

---

### 2. ⚡ Power User (Most Operations)

**What they can do:**
- ✅ Everything Viewer can do
- ✅ Create new files
- ✅ Modify existing files
- ✅ Delete files
- ✅ Run safe whitelisted commands
- ✅ View all processes

**What they CANNOT do:**
- ❌ Manage other users
- ❌ Change system policies
- ❌ Access admin panel

**Best for:** Developers, system operators, advanced users

**Test Account:**
- Email: `power@syscall.local`
- Password: `power123`

---

### 3. 🔐 Admin (Full Control)

**What they can do:**
- ✅ Everything Power User can do
- ✅ Create/modify/delete user accounts
- ✅ Change user roles
- ✅ Configure system policies
- ✅ Enable/disable system calls
- ✅ Reset the entire system
- ✅ View all users' logs

**Best for:** System administrators, instructors, project owners

**Test Account:**
- Email: `admin@syscall.local`
- Password: `admin123`

---

## How to Use the Application

### Logging In

1. **Open your browser** to `http://localhost:3000`
2. You'll see the login page
3. **Enter your credentials:**
   - For testing, use one of the accounts above
   - Example: `admin@syscall.local` / `admin123`
4. **Click "Sign In"**
5. You'll be redirected to the **Dashboard**

### Navigating the Interface

After logging in, you'll see a navigation bar at the top:

```
[SysCall Interface]  [Dashboard] [System Calls] [Logs] [Users] [Policies]  [🌙] [Sign Out]
```

**Navigation Items:**
- **Dashboard**: Overview with statistics and charts
- **System Calls**: Execute file/system operations
- **Logs**: View history of all actions
- **Users**: Manage user accounts (Admin only)
- **Policies**: Configure permissions (Admin only)
- **🌙/☀️**: Toggle dark/light mode
- **Sign Out**: Log out of your account

---

## System Calls Explained

### What is a System Call?

A **system call** is like a request to the operating system. Think of it as:
- Asking the OS to do something on your behalf
- A safe way to interact with files and processes
- A controlled interface to prevent mistakes

### Available System Calls

#### 1. 📁 **List Directory** (`listDirectory`)

**What it does:** Shows all files and folders in a directory

**Example Use:**
1. Go to **System Calls** page
2. Select "List Directory" from dropdown
3. Enter path: `./` (current folder)
4. Click **Execute**
5. See all files and folders!

**Parameters:**
- `path`: The folder you want to view

**Who can use it:** Everyone (Viewer, Power User, Admin)

---

#### 2. 📄 **Read File** (`readFile`)

**What it does:** Shows the contents of a text file

**Example Use:**
1. Select "Read File"
2. Enter path: `./README.md`
3. Click **Execute**
4. View the file contents!

**Parameters:**
- `path`: The file you want to read

**Who can use it:** Everyone (Viewer, Power User, Admin)

**⚠️ Note:** Binary files (images, videos) won't display properly

---

#### 3. ✏️ **Write File** (`writeFile`)

**What it does:** Creates a new file or modifies an existing one

**Example Use:**
1. Select "Write File"
2. Enter path: `./test.txt`
3. Enter content: `Hello, World!`
4. Click **Execute**
5. File is created!

**Parameters:**
- `path`: Where to save the file
- `content`: What to write in the file

**Who can use it:** Power User, Admin only

**⚠️ Security:** Files are created in a safe directory only

---

#### 4. 🗑️ **Delete File** (`deleteFile`)

**What it does:** Removes a file from the system

**Example Use:**
1. Select "Delete File"
2. Enter path: `./test.txt`
3. Click **Execute**
4. File is deleted!

**Parameters:**
- `path`: The file to delete

**Who can use it:** Power User, Admin only

**⚠️ Warning:** This action cannot be undone!

---

#### 5. 💻 **Get System Info** (`getSystemInfo`)

**What it does:** Shows details about your computer

**Information Provided:**
- Operating System (Windows, Mac, Linux)
- CPU Architecture (x64, arm64, etc.)
- Total Memory (RAM)
- Free Memory Available
- Number of CPU Cores
- Computer Hostname
- OS Version

**Example Use:**
1. Select "Get System Info"
2. Click **Execute** (no parameters needed!)
3. View your system details

**Who can use it:** Everyone

---

#### 6. 🔄 **List Processes** (`listProcesses`)

**What it does:** Shows all running programs on your computer

**Information Shown:**
- Process ID (PID)
- Process Name
- Memory Usage
- CPU Usage

**Example Use:**
1. Select "List Processes"
2. Click **Execute**
3. See what's running!

**Who can use it:** Power User, Admin only

---

#### 7. ⚙️ **Run Safe Command** (`runSafeCommand`)

**What it does:** Executes a whitelisted safe command

**Allowed Commands:**
- `dir` - List files (Windows)
- `echo` - Print a message
- `date` - Show current date
- `time` - Show current time

**Example Use:**
1. Select "Run Safe Command"
2. Enter command: `echo Hello!`
3. Click **Execute**
4. See the output!

**Parameters:**
- `command`: One of the safe commands above

**Who can use it:** Power User, Admin only

**⚠️ Security:** Only these 4 commands are allowed - no custom commands!

---

## Dashboard Guide

The **Dashboard** is your control center. Here's what you'll see:

### Statistics Cards (Top Row)

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Total Calls     │  │ Success Rate    │  │ Denied Calls    │  │ Errors          │
│     150         │  │     94.5%       │  │      5          │  │      3          │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

**What they mean:**
- **Total Calls**: How many system calls have been executed
- **Success Rate**: Percentage that completed successfully
- **Denied Calls**: Attempts blocked by permissions
- **Errors**: Failed executions

### Charts

**1. System Calls by Role**
- Bar chart showing which roles use the system most
- Helps admins understand usage patterns

**2. System Calls by Type**
- Shows which operations are most popular
- Example: "readFile" vs "writeFile"

### Recent Activity Table

Shows the last 10 system call executions:
- **User**: Who executed it
- **System Call**: Which operation
- **Status**: SUCCESS, DENIED, or ERROR
- **Time**: When it happened

---

## Managing Users (Admin Only)

If you're logged in as an Admin, you can manage all user accounts.

### Viewing Users

1. Click **Users** in the navigation bar
2. You'll see a table with all users:
   - Name
   - Email
   - Role
   - Status (Active/Inactive)
   - Number of system calls they've made
   - Last login time

### Creating a New User

Currently, users are created through the registration page or database seeding. In a future update, admins will be able to create users directly from this panel.

### Changing User Roles

To change a user's role:
1. Edit the database directly using Prisma Studio:
   ```bash
   npx prisma studio
   ```
2. Find the user
3. Change the `role` field to: `ADMIN`, `POWER_USER`, or `VIEWER`

### Resetting the Database

**⚠️ DANGER ZONE - This deletes everything!**

1. On the **Users** page, find the **Reset Database** button (top right)
2. Click it once - it will turn red and say "Click Again to Confirm"
3. Click again to confirm
4. **Everything will be reset:**
   - All logs deleted
   - All custom users deleted
   - Default test users restored
   - All policies reset to defaults

**Use this when:**
- You want to start fresh for a demo
- You need to clear test data
- Something went wrong and you want to reset

---

## Managing Policies (Admin Only)

Policies control who can do what. Think of them as permission rules.

### Understanding Policies

Each policy has:
- **Role**: Which user type (Admin, Power User, Viewer)
- **System Call**: Which operation
- **Allowed**: Yes or No
- **Rate Limit**: Maximum executions per hour (or unlimited)

### Viewing Policies

1. Click **Policies** in navigation
2. See all configured policies in a table

### Enabling/Disabling System Calls

To disable a system call for a specific role:
1. Find the policy in the table
2. Click the toggle switch
3. That role can no longer use that system call

### Setting Rate Limits

Rate limits prevent abuse:
- **Viewer**: Usually limited to 10 calls per hour
- **Power User**: Usually unlimited (null)
- **Admin**: Always unlimited

To change:
1. Use Prisma Studio: `npx prisma studio`
2. Edit the `maxExecutions` field
3. Set to a number (limit) or null (unlimited)

---

## Dark Mode

### Enabling Dark Mode

1. Look at the top-right corner of the navigation bar
2. You'll see a **Sun** ☀️ icon (light mode) or **Moon** 🌙 icon (dark mode)
3. Click it to toggle!

### Features

- **Smooth transitions** between themes
- **System preference detection** - automatically matches your OS theme
- **Persistent** - remembers your choice across sessions
- **Works everywhere** - all pages support dark mode

### Why Use Dark Mode?

- Reduces eye strain in low-light environments
- Saves battery on OLED screens
- Looks modern and professional
- Easier on your eyes during long sessions

---

## Troubleshooting

### Problem: Can't Log In

**Solution:**
1. Make sure you're using the correct email and password
2. Test accounts:
   - `admin@syscall.local` / `admin123`
   - `power@syscall.local` / `power123`
   - `viewer@syscall.local` / `viewer123`
3. Check for typos (email is case-sensitive)
4. Make sure the database is seeded: `npm run db:seed`

---

### Problem: "Access Denied" When Executing System Call

**Solution:**
1. Check your user role - you might not have permission
2. Try logging in as a Power User or Admin
3. Ask an admin to check the policies for your role

---

### Problem: Dark Mode Not Working

**Solution:**
1. Hard refresh the page: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Make sure JavaScript is enabled

---

### Problem: Server Won't Start

**Solution:**
1. Make sure port 3000 isn't already in use
2. Kill any existing Node processes
3. Try running: `npm run dev` again
4. Check for error messages in the terminal

---

### Problem: System Calls Return Errors

**Solution:**
1. Check the **Logs** page for detailed error messages
2. Verify your parameters are correct
3. For file operations, make sure the path exists
4. Check the `safe-root` directory exists

---

## Frequently Asked Questions

### Q: Is this safe to use?

**A:** Yes! The application has multiple security layers:
- Path traversal prevention
- Command whitelisting
- Role-based access control
- Input validation
- Complete audit logging

All operations are sandboxed and cannot harm your system.

---

### Q: Can I use this in production?

**A:** This is primarily an educational tool. For production use, you'd need:
- Switch from SQLite to PostgreSQL/MySQL
- Add HTTPS encryption
- Implement additional security measures
- Add backup and monitoring systems

---

### Q: How do I add more system calls?

**A:** To add custom system calls:
1. Define it in `prisma/schema.prisma`
2. Add the implementation in `src/lib/syscalls.ts`
3. Create policies in the database
4. Run migrations: `npx prisma migrate dev`

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed instructions.

---

### Q: Can multiple people use this at once?

**A:** Yes! Each user gets their own session. The database supports concurrent access.

---

### Q: How do I backup my data?

**A:** The database is stored in `prisma/dev.db`. Simply copy this file to backup all users, logs, and policies.

---

### Q: What happens if I delete a user with logs?

**A:** Their logs remain in the database but show as "deleted user". This preserves the audit trail.

---

### Q: Can I change the theme colors?

**A:** Yes! Edit the CSS variables in `src/app/globals.css`:
```css
:root {
  --primary: 221.2 83.2% 53.3%; /* Change this! */
}
```

---

## Getting Help

### Documentation Resources

- **README.md**: Quick overview and setup
- **SETUP.md**: Detailed installation guide
- **ARCHITECTURE.md**: Technical system design
- **API_REFERENCE.md**: Complete API documentation
- **CONTRIBUTING.md**: How to contribute code

### Community Support

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions and share ideas
- **Email Support**: Contact the maintainer

### Reporting Bugs

If you find a bug:
1. Check if it's already reported in GitHub Issues
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your OS and browser version

---

## Next Steps

Now that you understand the basics:

1. **Experiment**: Try different system calls with different roles
2. **Explore**: Check the logs to see what's being recorded
3. **Learn**: Read the code to understand how it works
4. **Contribute**: Add features or fix bugs (see CONTRIBUTING.md)
5. **Share**: Deploy your own instance and show others!

### Learning Resources

- **Operating Systems Concepts**: Read ARCHITECTURE.md
- **Web Development**: Explore the Next.js code
- **Security**: Review the security implementations
- **Databases**: Learn about Prisma and SQLite

---

## Conclusion

Congratulations! 🎉 You now know how to use the System Call Interface like a pro. Whether you're a student learning OS concepts, a developer exploring system programming, or an admin managing the system, this tool provides a safe and educational environment.

**Remember:**
- Start with Viewer role to learn safely
- Use Power User for hands-on practice
- Admin role for full system management
- Always check the logs to see what happened

**Happy exploring!** 🚀

---

*For technical questions, see [API_REFERENCE.md](./API_REFERENCE.md)*
*For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)*
*For contributing code, see [CONTRIBUTING.md](./CONTRIBUTING.md)*
