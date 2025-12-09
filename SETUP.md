# Quick Setup Guide

## 🚀 Getting Started

Follow these steps to set up and run the project:

### 1. Install Dependencies

```powershell
npm install
```

This will install all required packages including:
- Next.js 14
- Prisma & SQLite
- NextAuth.js
- Tailwind CSS
- ShadCN UI components
- And more...

### 2. Generate Prisma Client

```powershell
npx prisma generate
```

### 3. Initialize Database

```powershell
npx prisma migrate dev --name init
```

This creates the SQLite database with all tables.

### 4. Seed Database with Test Data

```powershell
npm run db:seed
```

This creates:
- 3 test users (Admin, Power User, Viewer)
- All system calls
- Default policies

**Test Credentials:**
- Admin: `admin@syscall.local` / `admin123`
- Power User: `power@syscall.local` / `power123`
- Viewer: `viewer@syscall.local` / `viewer123`

### 5. Start Development Server

```powershell
npm run dev
```

The application will be available at: **http://localhost:3000**

### 6. First Login

1. Open http://localhost:3000
2. You'll be redirected to the login page
3. Use one of the test credentials above
4. Explore the dashboard and features!

---

## 📂 Safe Directory

The system automatically creates a `safe-root` directory for file operations. This is the only directory where file system operations are allowed (for security).

---

## 🔧 Common Commands

```powershell
# Development
npm run dev          # Start development server

# Database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev --name <name>  # Create new migration
npm run db:seed      # Seed database with test data

# Build
npm run build        # Build for production
npm start            # Start production server

# Lint
npm run lint         # Run ESLint
```

---

## 🎯 Project Features to Test

### As Viewer
- ✅ Login/Logout
- ✅ View Dashboard
- ✅ Execute: listDirectory, readFile, getSystemInfo
- ✅ View your own logs
- ❌ Cannot access admin pages

### As Power User
- ✅ All Viewer features
- ✅ Execute: writeFile, listProcesses
- ✅ More dashboard access

### As Admin
- ✅ All Power User features
- ✅ Execute: deleteFile, runSafeCommand
- ✅ Manage users
- ✅ Configure policies
- ✅ Enable/disable system calls
- ✅ View all system logs

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@prisma/client'"
**Solution:** Run `npx prisma generate`

### Issue: "Database does not exist"
**Solution:** Run `npx prisma migrate dev --name init`

### Issue: "NEXTAUTH_SECRET not set"
**Solution:** Check your `.env` file has `NEXTAUTH_SECRET` set

### Issue: Port 3000 already in use
**Solution:** Kill the process using port 3000 or change the port:
```powershell
$env:PORT=3001; npm run dev
```

---

## 📊 Database Schema Visualization

You can view and edit your database using Prisma Studio:

```powershell
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- Edit records
- Run queries
- See relationships

---

## 🔐 Security Notes

1. **Change default passwords** before deployment
2. **Update NEXTAUTH_SECRET** in `.env` (use a strong random string)
3. **Safe directory** limits file operations to `./safe-root` only
4. **Whitelisted commands** only allow: dir, echo, date, time
5. **Rate limiting** prevents abuse (configurable in policies)

---

## 📚 Next Steps

1. **Explore the code**: Check `src/lib/` for core logic
2. **Test system calls**: Try different operations in the UI
3. **Read logs**: See how every action is logged
4. **Configure policies**: Experiment with role permissions
5. **Add users**: Create new test accounts with different roles

---

## 🎓 For Presentation/Viva

**Key Points to Explain:**

1. **Architecture**: Show the flow from UI → API → Syscall Executor → Database
2. **Security**: Explain RBAC, input validation, path traversal prevention
3. **Logging**: Demonstrate comprehensive audit trail
4. **Policies**: Show how permissions are enforced
5. **OS Concepts**: Relate to real OS system calls, but in userspace

**Demo Flow:**
1. Login as Viewer → Show limited access
2. Login as Power User → Show more capabilities
3. Login as Admin → Show full control + management
4. Show logs for all activities
5. Explain security measures in code

---

## 💡 Tips

- Use **Prisma Studio** to inspect database during development
- Check **browser console** for any frontend errors
- Check **terminal** for backend errors
- Use **VS Code** extensions: Prisma, ESLint, Tailwind IntelliSense
- Test with **different roles** to see permission differences

---

**You're all set! Happy coding! 🚀**
