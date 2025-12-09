# 🔐 User-Friendly System Call Interface for Enhanced Security

A modern, secure web-based system call interface built with Next.js that demonstrates operating system concepts through practical implementation. This project provides a controlled environment for executing system calls with role-based access control, comprehensive logging, and real-time monitoring.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## 📋 Table of Contents

- [Features](#-features)
- [System Calls](#-system-calls)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Security Features](#-security-features)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 **Authentication & Authorization**
- Secure user authentication with NextAuth.js
- Role-based access control (RBAC) with three permission levels
- JWT session management with secure token handling
- Login attempt tracking and rate limiting

### 🖥️ **System Call Interface**
- **7 System Calls** across 3 categories:
  - File System Operations (list, read, write, delete)
  - Process Management (list processes, execute commands)
  - System Information (CPU, memory, OS details)
- Real-time execution with parameter validation
- Sandboxed environment with path traversal prevention
- Command whitelisting for safe execution

### 📊 **Monitoring & Logging**
- Comprehensive audit trail for all operations
- Real-time dashboard with statistics and charts
- Log filtering by user, role, status, and date range
- Performance metrics (execution time tracking)

### 👥 **Admin Panel**
- User management (Create, Read, Update, Delete)
- Role assignment and permission control
- Policy configuration per role and system call
- Rate limit customization

### 🎨 **Modern UI/UX**
- Clean, responsive design with Tailwind CSS
- ShadCN UI component library
- Interactive charts with Recharts
- Mobile-friendly interface

---

## 🚀 System Calls

| Category | System Call | Description | Parameters |
|----------|------------|-------------|------------|
| **File System** | `listDirectory` | List contents of a directory | `path` |
| | `readFile` | Read file contents | `path` |
| | `writeFile` | Create or modify a file | `path`, `content` |
| | `deleteFile` | Remove a file | `path` |
| **Process** | `listProcesses` | View running processes | - |
| | `runSafeCommand` | Execute whitelisted commands | `command` |
| **System Info** | `getSystemInfo` | Get CPU, memory, OS info | - |

---

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Beautiful component library
- **Recharts** - Data visualization

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication solution
- **Prisma ORM** - Type-safe database client
- **SQLite** - Lightweight database
- **Zod** - Schema validation

### **Security**
- **bcryptjs** - Password hashing
- **Node.js crypto** - Secret key generation
- Input sanitization and validation
- Path traversal prevention
- Rate limiting

---

## 📦 Prerequisites

Before installation, ensure you have:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 10.x or higher (comes with Node.js)
- **Git** (for cloning) ([Download](https://git-scm.com/))

Verify installations:
```bash
node --version  # Should show v20.x or higher
npm --version   # Should show 10.x or higher
```

---

## 🚀 Installation

### **1. Clone the Repository**
```bash
git clone https://github.com/jaiveerminhas06/-User-Friendly-System-Call-Interface-for-Enhanced-Security.git
cd -User-Friendly-System-Call-Interface-for-Enhanced-Security
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
The `.env` file is pre-configured. For production, generate a new `NEXTAUTH_SECRET`:

**Windows PowerShell:**
```powershell
$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

Then update `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

### **4. Database Setup**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations and create database
npx prisma migrate dev --name init

# Seed with test data
npm run db:seed
```

### **5. Start Development Server**
```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 🔑 Usage

### **Test Credentials**

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@syscall.local` | `admin123` | Full access to all features |
| **Power User** | `power@syscall.local` | `power123` | Most system calls enabled |
| **Viewer** | `viewer@syscall.local` | `viewer123` | Limited read-only access |

### **Quick Start Guide**

1. **Login** with any test account at http://localhost:3000
2. **Dashboard** - View system statistics and activity
3. **System Calls** - Execute operations based on your role
4. **Logs** - Review audit trail of all actions
5. **Admin Panel** (Admin only) - Manage users and policies

### **Example: Execute a System Call**
```typescript
// Navigate to /syscalls
// Select "getSystemInfo" from dropdown
// Click "Execute"
// View results with CPU, memory, and OS details
```

---

## 📁 Project Structure

```
SysCall Interface/
├── prisma/
│   ├── schema.prisma          # Database schema (6 models)
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Database migration files
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/             # Admin panel
│   │   │   ├── users/         # User management
│   │   │   └── policies/      # Policy management
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── syscall/       # System call execution
│   │   │   ├── logs/          # Log retrieval
│   │   │   ├── dashboard/     # Dashboard stats
│   │   │   └── admin/         # Admin operations
│   │   ├── dashboard/         # Main dashboard
│   │   ├── syscalls/          # System call interface
│   │   ├── logs/              # Log viewer
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # ShadCN UI components
│   │   ├── navigation.tsx     # Navigation bar
│   │   └── providers.tsx      # Session provider
│   ├── lib/
│   │   ├── auth.ts            # Auth utilities & config
│   │   ├── policies.ts        # Policy engine
│   │   ├── syscalls.ts        # System call executor
│   │   ├── logging.ts         # Logging system
│   │   └── utils.ts           # Helper functions
│   └── types/
│       └── next-auth.d.ts     # NextAuth type definitions
├── .env                       # Environment variables
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── README.md                  # This file
```

---

## 🔒 Security Features

### **1. Authentication Security**
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT session tokens with expiration (24 hours)
- ✅ Secure session storage
- ✅ CSRF protection via NextAuth

### **2. Authorization Controls**
- ✅ Role-based access control (RBAC)
- ✅ Policy engine for fine-grained permissions
- ✅ Server-side authorization checks
- ✅ Middleware route protection

### **3. Input Validation**
- ✅ Zod schema validation for all inputs
- ✅ Type-safe parameter checking
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection

### **4. System Call Safety**
- ✅ Path traversal prevention (`../` sanitization)
- ✅ Safe directory restrictions
- ✅ Command whitelisting (only: dir, echo, date, time)
- ✅ No arbitrary command execution

### **5. Rate Limiting**
- ✅ Login attempt tracking (5 attempts max)
- ✅ Per-role execution limits
- ✅ IP-based restrictions
- ✅ Configurable thresholds

### **6. Audit & Monitoring**
- ✅ Complete audit trail for all actions
- ✅ User action logging with timestamps
- ✅ Failed attempt tracking
- ✅ IP address and user agent capture

---

## 📡 API Documentation

### **Authentication**
```typescript
POST /api/auth/callback/credentials
Body: { email: string, password: string }
Response: { user: { id, email, name, role } }
```

### **System Calls**
```typescript
// List available system calls
GET /api/syscall
Response: SystemCall[]

// Execute a system call
POST /api/syscall
Body: { 
  syscallName: string, 
  parameters?: { path?: string, content?: string, command?: string } 
}
Response: { 
  success: boolean, 
  data?: any, 
  error?: string 
}
```

### **Logs**
```typescript
GET /api/logs?limit=50&status=SUCCESS&userId=xxx&startDate=xxx&endDate=xxx
Response: { 
  logs: SystemCallLog[], 
  total: number 
}
```

### **Dashboard**
```typescript
GET /api/dashboard
Response: {
  totalCalls: number,
  successRate: number,
  deniedCalls: number,
  recentLogs: SystemCallLog[],
  byRole: { role: string, count: number }[],
  bySyscall: { name: string, count: number }[]
}
```

### **Admin - Users**
```typescript
GET /api/admin/users          // List all users
POST /api/admin/users         // Create user
PATCH /api/admin/users        // Update user
DELETE /api/admin/users       // Delete user
```

### **Admin - Policies**
```typescript
GET /api/admin/policies       // List all policies
POST /api/admin/policies      // Create/update policy
PATCH /api/admin/policies     // Toggle syscall status
```

---

## 📊 Database Schema

### **Models (6 total)**
1. **User** - User accounts with roles and authentication
2. **SystemCall** - Available system call definitions
3. **Policy** - Role-permission mappings with rate limits
4. **SystemCallLog** - Complete execution audit trail
5. **LoginAttempt** - Authentication history for rate limiting
6. **Configuration** - System-wide settings

### **Entity Relationships**
- User → SystemCallLog (one-to-many)
- User → LoginAttempt (one-to-many)
- SystemCall → Policy (one-to-many)
- SystemCall → SystemCallLog (one-to-many)

---

## 🎓 Educational Value

This project demonstrates understanding of:

1. **Operating System Concepts**
   - System call interface design
   - Process management fundamentals
   - File system operations
   - Security and access control

2. **Software Engineering**
   - Full-stack application architecture
   - RESTful API design
   - Database modeling and relationships
   - Authentication and authorization

3. **Security Practices**
   - RBAC implementation
   - Input validation and sanitization
   - Audit logging
   - Rate limiting strategies

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Prisma** - For the excellent ORM
- **ShadCN** - For beautiful UI components
- **Vercel** - For hosting and deployment

---

## 📧 Contact

**Jaiveer Minhas**
- GitHub: [@jaiveerminhas06](https://github.com/jaiveerminhas06)
- Project Link: [User-Friendly System Call Interface](https://github.com/jaiveerminhas06/-User-Friendly-System-Call-Interface-for-Enhanced-Security)

---

## 🚀 Deployment

### **Deploy to Vercel**

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jaiveerminhas06/-User-Friendly-System-Call-Interface-for-Enhanced-Security)

---

**⭐ If you found this project helpful, please give it a star!**

Built with ❤️ for Operating Systems Course Project
