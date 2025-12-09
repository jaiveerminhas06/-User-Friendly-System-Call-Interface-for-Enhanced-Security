# 🚀 Quick Commands Cheat Sheet

## Essential Commands (Copy & Paste Ready)

### Initial Setup (Run Once)
```powershell
# 1. Install all dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Create database and run migrations
npx prisma migrate dev --name init

# 4. Seed database with test data
npm run db:seed

# 5. Start development server
npm run dev
```

### Daily Development
```powershell
# Start dev server
npm run dev

# Open Prisma Studio (database GUI)
npx prisma studio

# View logs in real-time
# (check terminal where dev server is running)
```

### Database Management
```powershell
# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npm run db:seed

# Open Prisma Studio
npx prisma studio
```

### Build & Production
```powershell
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Troubleshooting
```powershell
# Clean install (if node_modules is corrupted)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate

# Reset database completely
npx prisma migrate reset
npm run db:seed

# Check for port conflicts
netstat -ano | findstr :3000
```

---

## 🔑 Default Login Credentials

After running `npm run db:seed`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@syscall.local` | `admin123` |
| **Power User** | `power@syscall.local` | `power123` |
| **Viewer** | `viewer@syscall.local` | `viewer123` |

---

## 🌐 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost:3000 | Main web interface |
| **Prisma Studio** | http://localhost:5555 | Database GUI (run `npx prisma studio`) |
| **Login** | http://localhost:3000/login | Login page |
| **Dashboard** | http://localhost:3000/dashboard | Main dashboard |
| **System Calls** | http://localhost:3000/syscalls | Execute system calls |
| **Logs** | http://localhost:3000/logs | View execution logs |
| **Admin Users** | http://localhost:3000/admin/users | User management |
| **Admin Policies** | http://localhost:3000/admin/policies | Policy management |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.) |
| `prisma/schema.prisma` | Database schema definition |
| `prisma/seed.ts` | Database seeding script |
| `src/lib/auth.ts` | Authentication utilities |
| `src/lib/policies.ts` | Policy engine |
| `src/lib/syscalls.ts` | System call executor |
| `src/lib/logging.ts` | Logging utilities |
| `src/middleware.ts` | Route protection |

---

## 🔧 Git Commands (Optional)

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: System Call Interface project"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/syscall-interface.git

# Push to GitHub
git push -u origin main
```

---

## 📊 Database Commands

```powershell
# View current database schema
npx prisma db pull

# Format Prisma schema
npx prisma format

# Validate Prisma schema
npx prisma validate

# Show migration status
npx prisma migrate status

# Create migration without applying
npx prisma migrate dev --create-only
```

---

## 🧪 Testing Different Roles

### Quick Test Script

1. **Login as Viewer** (`viewer@syscall.local` / `viewer123`)
   - Try: listDirectory, readFile, getSystemInfo
   - Verify: Cannot access writeFile, admin pages

2. **Login as Power User** (`power@syscall.local` / `power123`)
   - Try: All Viewer features + writeFile, listProcesses
   - Verify: Cannot access admin pages

3. **Login as Admin** (`admin@syscall.local` / `admin123`)
   - Try: All features including admin panel
   - Verify: Can manage users and policies

---

## 🐛 Common Errors & Fixes

### Error: "Cannot find module '@prisma/client'"
```powershell
npx prisma generate
```

### Error: "Port 3000 already in use"
```powershell
# Find and kill process
netstat -ano | findstr :3000
# Note the PID and kill it
taskkill /PID <PID> /F

# Or use different port
$env:PORT=3001; npm run dev
```

### Error: "NEXTAUTH_SECRET is not set"
```powershell
# Make sure .env file exists and contains:
# NEXTAUTH_SECRET="your-secret-key-min-32-characters"
```

### Error: Database connection issues
```powershell
# Reset database
npx prisma migrate reset
npm run db:seed
```

### Error: TypeScript errors after fresh install
```powershell
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in VS Code
# Press: Ctrl+Shift+P
# Type: "TypeScript: Restart TS Server"
```

---

## 📦 Package Information

### Core Dependencies
- `next@14.2.15` - React framework
- `@prisma/client@^5.22.0` - Database ORM
- `next-auth@^4.24.10` - Authentication
- `bcryptjs@^2.4.3` - Password hashing
- `zod@^3.23.8` - Schema validation
- `tailwindcss@^3.4.15` - CSS framework
- `recharts@^2.13.3` - Charts

### Dev Dependencies
- `typescript@^5.6.3` - TypeScript compiler
- `@types/node@^22.10.1` - Node types
- `prisma@^5.22.0` - Prisma CLI
- `ts-node@^10.9.2` - TypeScript execution

---

## 🎯 Performance Tips

```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Clear Prisma cache
Remove-Item -Recurse -Force node_modules/.prisma

# Full clean rebuild
Remove-Item -Recurse -Force .next, node_modules/.prisma
npm run dev
```

---

## 📝 Quick Code Snippets

### Create New System Call
```typescript
// Add to prisma/seed.ts
{
  name: 'myNewSyscall',
  description: 'Description of what it does',
  category: 'FILE_SYSTEM', // or PROCESS, SYSTEM_INFO
  allowedRoles: JSON.stringify(['ADMIN', 'POWER_USER']),
  requiresParams: true,
  enabled: true,
}
```

### Add New API Endpoint
```typescript
// src/app/api/myendpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return NextResponse.json({ message: "Success" });
}
```

---

## ⚡ Keyboard Shortcuts (VS Code)

| Shortcut | Action |
|----------|--------|
| `Ctrl + `` | Toggle terminal |
| `Ctrl + Shift + P` | Command palette |
| `Ctrl + P` | Quick file open |
| `Ctrl + B` | Toggle sidebar |
| `F5` | Start debugging |
| `Ctrl + /` | Toggle comment |

---

## 💡 Pro Tips

1. **Keep Prisma Studio open** while developing to see database changes in real-time
2. **Use TypeScript autocomplete** - it knows your database schema!
3. **Check terminal logs** for detailed error messages
4. **Browser DevTools Console** shows frontend errors
5. **Restart dev server** after changing environment variables

---

**Save this file for quick reference! 📌**

**Last Updated: December 9, 2025**
