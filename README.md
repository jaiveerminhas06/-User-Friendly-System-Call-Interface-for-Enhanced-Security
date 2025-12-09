# User-Friendly System Call Interface for Enhanced Security

## 🎓 Operating Systems Course Project

A comprehensive web-based system that simulates a secure OS system call layer with authentication, role-based access control, and detailed logging. Built for educational purposes to demonstrate OS concepts including system calls, process management, security policies, and access control.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Security Model](#security-model)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [System Calls](#system-calls)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

This project implements a **secure, web-based interface** that acts as a controlled gateway to perform abstracted "system-call-like" operations. Unlike traditional OS kernel modifications, this system simulates realistic OS behaviors within a secure Node.js environment.

### Key Concepts Demonstrated

- **System Call Abstraction**: Safe implementation of file system, process, and system info operations
- **Authentication & Authorization**: Multi-role user management with NextAuth.js
- **Policy Engine**: Role-based access control (RBAC) for system call execution
- **Comprehensive Logging**: Every action is logged with detailed metadata
- **Security**: Input validation, path traversal prevention, command whitelisting, rate limiting

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Database** | SQLite with Prisma ORM |
| **Authentication** | NextAuth.js (Credentials) |
| **Security** | bcryptjs, Zod validation |
| **UI** | Tailwind CSS + ShadCN UI |
| **Charts** | Recharts |
| **System Ops** | Node.js fs, os, child_process |

---

## ✨ Features

### 1. Authentication System
- User registration with email validation
- Secure login with bcrypt password hashing
- JWT-based session management
- Role-based access (ADMIN, POWER_USER, VIEWER)

### 2. System Call Interface
- **File System Operations**
  - `listDirectory`: Browse directory contents
  - `readFile`: Read file contents
  - `writeFile`: Create/modify files
  - `deleteFile`: Remove files (admin only)

- **Process Operations**
  - `listProcesses`: View running processes
  - `runSafeCommand`: Execute whitelisted commands

- **System Information**
  - `getSystemInfo`: CPU, memory, OS details

### 3. Policy Management (Admin)
- Configure role-based permissions per system call
- Enable/disable system calls globally
- Set rate limits per role
- Manage allowed roles for each operation

### 4. User Management (Admin)
- Create, update, delete users
- Assign roles (ADMIN, POWER_USER, VIEWER)
- View user activity statistics
- Activate/deactivate accounts

### 5. Monitoring & Logging
- Real-time dashboard with statistics
- Detailed execution logs with filters
- Success/denied/error tracking
- Activity graphs by role and system call
- Client IP and user agent logging

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Login   │  │Dashboard │  │ Syscalls │  │   Admin    │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST API
┌────────────────────────┴────────────────────────────────────┐
│                    NEXT.JS SERVER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Middleware                          │  │
│  │    (Authentication, Authorization, Route Protection)  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ API Routes   │  │  Auth Logic  │  │  Policy Engine  │  │
│  │ - /syscall   │  │  (NextAuth)  │  │                 │  │
│  │ - /logs      │  │              │  │  - Role checks  │  │
│  │ - /admin/*   │  │              │  │  - Rate limits  │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             System Call Executor                      │  │
│  │  ┌────────────┐ ┌────────────┐ ┌─────────────────┐  │  │
│  │  │File System │ │  Process   │ │  System Info    │  │  │
│  │  │Operations  │ │  Mgmt      │ │  Retrieval      │  │  │
│  │  └────────────┘ └────────────┘ └─────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Logging & Audit System                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   SQLite DATABASE (Prisma)                   │
│  ┌─────────┐ ┌──────────────┐ ┌────────┐ ┌──────────────┐ │
│  │  Users  │ │ SystemCalls  │ │ Policy │ │    Logs      │ │
│  └─────────┘ └──────────────┘ └────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Model

### 1. Authentication Layer
- Password hashing with bcrypt (12 rounds)
- JWT sessions with HttpOnly cookies
- Automatic session expiration (24 hours)

### 2. Authorization Layer
- Role-Based Access Control (RBAC)
- Middleware-enforced route protection
- Server-side permission checks on every API call

### 3. Input Validation
- Zod schema validation for all inputs
- Path traversal prevention (`../` blocked)
- Command whitelisting for process execution
- File operations restricted to safe directory

### 4. Rate Limiting
- Failed login attempt tracking
- Configurable per-role syscall limits
- IP-based rate limiting

### 5. Audit Trail
- Every operation logged with:
  - User identity and role
  - Timestamp and execution time
  - Parameters (sanitized)
  - Result status
  - Client IP and user agent
  - Error messages

---

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Step 1: Clone & Install

```powershell
cd "C:\Users\Jaiveer Minhas\Desktop\SysCall Interface"
npm install
```

### Step 2: Configure Environment

Edit `.env` file:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
SAFE_ROOT_DIR="./safe-root"
MAX_LOGIN_ATTEMPTS=5
LOGIN_TIMEOUT_MINUTES=15
```

### Step 3: Initialize Database

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

### Step 4: Seed Database (Optional)

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
import { initializeDefaultPolicies } from '../src/lib/policies';
import { initializeSafeRoot } from '../src/lib/syscalls';

const prisma = new PrismaClient();

async function main() {
  // Initialize safe directory
  await initializeSafeRoot();
  
  // Create admin user
  const adminPassword = await hashPassword('admin123');
  await prisma.user.create({
    data: {
      email: 'admin@syscall.local',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create power user
  const powerPassword = await hashPassword('power123');
  await prisma.user.create({
    data: {
      email: 'power@syscall.local',
      name: 'Power User',
      password: powerPassword,
      role: 'POWER_USER',
    },
  });

  // Create viewer
  const viewerPassword = await hashPassword('viewer123');
  await prisma.user.create({
    data: {
      email: 'viewer@syscall.local',
      name: 'Viewer User',
      password: viewerPassword,
      role: 'VIEWER',
    },
  });

  // Initialize system calls and policies
  await initializeDefaultPolicies();
  
  console.log('✅ Database seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seed:
```powershell
npx prisma db seed
```

### Step 5: Start Development Server

```powershell
npm run dev
```

Visit: `http://localhost:3000`

**Default Credentials:**
- Admin: `admin@syscall.local` / `admin123`
- Power User: `power@syscall.local` / `power123`
- Viewer: `viewer@syscall.local` / `viewer123`

---

## 🚀 Usage

### For Regular Users

1. **Login**: Navigate to `/login` and authenticate
2. **Dashboard**: View your activity statistics and recent calls
3. **System Calls**: Execute available operations based on your role
4. **Logs**: View your execution history

### For Administrators

All regular features plus:
- **User Management**: Create, modify, delete users at `/admin/users`
- **Policy Management**: Configure permissions at `/admin/policies`
- **Enable/Disable Calls**: Toggle system call availability
- **View All Logs**: Monitor system-wide activity

---

## 📚 API Documentation

### Authentication

**POST** `/api/register`
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**POST** `/api/auth/signin` (NextAuth endpoint)

### System Calls

**GET** `/api/syscall`
- Returns available system calls for authenticated user

**POST** `/api/syscall`
```json
{
  "syscallName": "listDirectory",
  "parameters": {
    "path": "/example"
  }
}
```

### Logs

**GET** `/api/logs?status=SUCCESS&limit=50&offset=0`
- Query parameters: `status`, `syscallName`, `role`, `startDate`, `endDate`, `limit`, `offset`

### Admin

**GET** `/api/admin/users` (Admin only)
**POST** `/api/admin/users` (Admin only)
**PATCH** `/api/admin/users` (Admin only)
**DELETE** `/api/admin/users?id={userId}` (Admin only)

**GET** `/api/admin/policies` (Admin only)
**POST** `/api/admin/policies` (Admin only)
**PATCH** `/api/admin/policies` (Admin only)

---

## 🔧 System Calls

### File System

| Call | Description | Roles | Parameters |
|------|-------------|-------|------------|
| `listDirectory` | List directory contents | All | `path` |
| `readFile` | Read file contents | All | `path` |
| `writeFile` | Write to file | Admin, Power | `path`, `content` |
| `deleteFile` | Delete file | Admin | `path` |

### Process Operations

| Call | Description | Roles | Parameters |
|------|-------------|-------|------------|
| `listProcesses` | View running processes | Admin, Power | None |
| `runSafeCommand` | Execute whitelisted command | Admin | `command` |

### System Information

| Call | Description | Roles | Parameters |
|------|-------------|-------|------------|
| `getSystemInfo` | Get CPU, memory, OS info | All | None |

---

## 🗄 Database Schema

### Models

- **User**: Authentication and profile information
- **SystemCall**: Available system call definitions
- **Policy**: Role-to-syscall permission mappings
- **SystemCallLog**: Execution audit trail
- **LoginAttempt**: Authentication tracking
- **Configuration**: System settings

See `prisma/schema.prisma` for full schema.

---

## 📸 Screenshots

_[Add screenshots of your application here]_

### Login Page
![Login]()

### Dashboard
![Dashboard]()

### System Calls Interface
![System Calls]()

### Admin Panel
![Admin Panel]()

---

## 🎯 Learning Outcomes

This project demonstrates understanding of:

1. **Operating System Concepts**
   - System call interface and abstraction
   - Process management simulation
   - File system operations
   - Security and access control

2. **Software Engineering**
   - Full-stack web development
   - RESTful API design
   - Database modeling
   - Authentication/Authorization

3. **Security Principles**
   - Secure password storage
   - Input validation and sanitization
   - Principle of least privilege
   - Audit logging

---

## 🚀 Future Enhancements

- [ ] Real-time notifications using WebSockets
- [ ] Advanced process monitoring with `ps-node`
- [ ] File upload/download functionality
- [ ] Export logs as CSV/PDF
- [ ] Two-factor authentication (2FA)
- [ ] Dark mode theme
- [ ] Advanced analytics dashboard
- [ ] Docker containerization
- [ ] Multi-tenancy support
- [ ] Scheduled system call execution (cron-like)
- [ ] API rate limiting middleware
- [ ] Internationalization (i18n)

---

## 📝 Project Structure

```
SysCall Interface/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── admin/
│   │   │   ├── users/         # User management
│   │   │   └── policies/      # Policy management
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── syscall/       # System call API
│   │   │   ├── logs/          # Logs API
│   │   │   └── admin/         # Admin APIs
│   │   ├── dashboard/         # Dashboard page
│   │   ├── syscalls/          # System calls UI
│   │   ├── logs/              # Logs viewer
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home redirect
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # ShadCN components
│   │   ├── navigation.tsx     # Nav bar
│   │   └── providers.tsx      # Session provider
│   ├── lib/
│   │   ├── auth.ts            # Auth utilities
│   │   ├── policies.ts        # Policy engine
│   │   ├── syscalls.ts        # Syscall executor
│   │   ├── logging.ts         # Logging utilities
│   │   └── utils.ts           # Helper functions
│   ├── types/
│   │   └── next-auth.d.ts     # Type definitions
│   └── middleware.ts          # Route protection
├── .env                       # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## 🤝 Contributing

This is an educational project. Feel free to fork and extend for learning purposes.

---

## 📄 License

This project is created for educational purposes as part of an Operating Systems course.

---

## 👨‍💻 Author

**Jaiveer Minhas**
- Course: Operating Systems
- Project: User-Friendly System Call Interface for Enhanced Security
- Year: 2025

---

## 🙏 Acknowledgments

- Next.js and React documentation
- Prisma ORM documentation
- NextAuth.js for authentication patterns
- ShadCN UI for component library
- Operating Systems course materials

---

## 📞 Support

For questions or issues:
1. Check the documentation above
2. Review code comments in source files
3. Test with provided demo credentials
4. Verify environment configuration

---

**Built with ❤️ for learning Operating Systems concepts**
