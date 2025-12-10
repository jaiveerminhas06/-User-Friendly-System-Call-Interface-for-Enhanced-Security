# 🏗️ System Architecture

## Table of Contents
- [Overview](#overview)
- [System Architecture Diagram](#system-architecture-diagram)
- [Component Architecture](#component-architecture)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [System Call Execution Flow](#system-call-execution-flow)
- [Technology Stack](#technology-stack)
- [Design Patterns](#design-patterns)
- [Security Architecture](#security-architecture)

---

## Overview

The System Call Interface is built as a modern full-stack web application using Next.js 14 with the App Router pattern. It follows a three-tier architecture with clear separation between presentation, business logic, and data layers.

### Architecture Principles

- **Separation of Concerns**: Clear boundaries between UI, API, and database layers
- **Type Safety**: Full TypeScript implementation for compile-time error detection
- **Security First**: Multiple security layers including RBAC, input validation, and audit logging
- **Scalability**: Modular design allowing easy feature additions and modifications
- **Maintainability**: Clean code structure with comprehensive documentation

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │   Browser    │  │   Browser    │          │
│  │  (Light Mode)│  │  (Dark Mode) │  │   (Mobile)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                    │
│         └─────────────────┴─────────────────┘                    │
│                           │                                      │
│                    HTTPS / HTTP                                  │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                  PRESENTATION LAYER (Next.js)                    │
├───────────────────────────┼──────────────────────────────────────┤
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────┐         │
│  │              React Components (RSC)                │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  • Navigation (with Dark Mode Toggle)              │         │
│  │  • Dashboard (Charts & Stats)                      │         │
│  │  • System Calls (Execution Interface)              │         │
│  │  • Logs (Audit Viewer)                             │         │
│  │  • Admin Panel (Users & Policies)                  │         │
│  │  • Auth Pages (Login & Register)                   │         │
│  └────────────────┬───────────────────────────────────┘         │
│                   │                                              │
│  ┌────────────────▼───────────────────────────────────┐         │
│  │              Middleware Layer                       │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  • Route Protection                                 │         │
│  │  • Role-based Access Control                        │         │
│  │  • Session Validation                               │         │
│  └────────────────┬───────────────────────────────────┘         │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
┌───────────────────┼──────────────────────────────────────────────┐
│                 API LAYER (Next.js API Routes)                   │
├───────────────────┼──────────────────────────────────────────────┤
│                   ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  API Endpoints                          │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  /api/auth/[...nextauth]  → Authentication             │    │
│  │  /api/register            → User Registration          │    │
│  │  /api/syscall             → System Call Execution      │    │
│  │  /api/logs                → Log Retrieval              │    │
│  │  /api/dashboard           → Dashboard Statistics       │    │
│  │  /api/admin/users         → User Management (CRUD)     │    │
│  │  /api/admin/policies      → Policy Management          │    │
│  │  /api/admin/reset         → Database Reset             │    │
│  │                                                         │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐    │
│  │              Business Logic Layer                       │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  • auth.ts      → Authentication & Authorization        │    │
│  │  • policies.ts  → Policy Engine & RBAC                  │    │
│  │  • syscalls.ts  → System Call Executor                  │    │
│  │  • logging.ts   → Audit Logging System                  │    │
│  │  • db.ts        → Database Client                       │    │
│  │  • utils.ts     → Helper Functions                      │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
┌───────────────────┼──────────────────────────────────────────────┐
│                 DATA LAYER (Prisma ORM)                          │
├───────────────────┼──────────────────────────────────────────────┤
│                   ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Prisma Client                           │    │
│  │  (Type-safe Database Access)                            │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐    │
│  │              SQLite Database                            │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  📊 Database Tables:                                    │    │
│  │  • users              → User accounts & roles           │    │
│  │  • system_calls       → Available syscall definitions   │    │
│  │  • policies           → Role-permission mappings        │    │
│  │  • system_call_logs   → Execution audit trail           │    │
│  │  • login_attempts     → Authentication history          │    │
│  │  • configurations     → System settings                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SYSTEMS                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Node.js 'fs' │  │ Node.js 'os' │  │ 'child_process'│         │
│  │ File System  │  │ System Info  │  │ Process Mgmt  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          → Login form with validation
│   │   └── register/page.tsx       → Registration form
│   ├── dashboard/page.tsx          → Main dashboard with charts
│   ├── syscalls/page.tsx           → System call execution UI
│   ├── logs/page.tsx               → Log viewer with filters
│   ├── admin/
│   │   ├── users/page.tsx          → User management interface
│   │   └── policies/page.tsx       → Policy configuration UI
│   ├── layout.tsx                  → Root layout with theme
│   ├── page.tsx                    → Home page (redirects)
│   └── globals.css                 → Global styles + dark mode
│
├── components/
│   ├── navigation.tsx              → Nav bar with theme toggle
│   ├── providers.tsx               → Session + Theme providers
│   └── ui/                         → ShadCN UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── table.tsx
│       └── textarea.tsx
│
└── lib/
    ├── auth.ts                     → NextAuth configuration
    ├── policies.ts                 → RBAC policy engine
    ├── syscalls.ts                 → System call executor
    ├── logging.ts                  → Audit logging
    ├── db.ts                       → Prisma client
    └── utils.ts                    → Utility functions
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **Navigation** | User menu, theme toggle, session display, route navigation |
| **Providers** | Wraps app with SessionProvider and ThemeProvider |
| **Dashboard** | Displays statistics, charts, and recent activity |
| **SystemCalls** | Interactive interface for executing system calls |
| **Logs** | Filterable table of all system call executions |
| **Admin/Users** | CRUD operations for user management + reset button |
| **Admin/Policies** | Configure role permissions and rate limits |

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id: String (PK)     │
│ email: String       │◄────────┐
│ name: String        │         │
│ password: String    │         │ 1:N
│ role: String        │         │
│ createdAt: DateTime │         │
│ updatedAt: DateTime │         │
│ lastLogin: DateTime?│         │
│ isActive: Boolean   │         │
└──────────┬──────────┘         │
           │                    │
           │ 1:N                │
           │                    │
    ┌──────▼──────────┐    ┌────┴──────────────┐
    │ SystemCallLog   │    │  LoginAttempt     │
    ├─────────────────┤    ├───────────────────┤
    │ id: String (PK) │    │ id: String (PK)   │
    │ userId: String  │    │ userId: String?   │
    │ role: String    │    │ email: String     │
    │ syscallName     │    │ successful: Bool  │
    │ syscallId       │    │ ipAddress: String │
    │ parameters      │    │ userAgent: String?│
    │ status: String  │    │ timestamp         │
    │ output          │    └───────────────────┘
    │ errorMessage    │
    │ clientIp        │
    │ userAgent       │
    │ executionTime   │
    │ timestamp       │
    └─────────────────┘
           ▲
           │ N:1
           │
    ┌──────┴──────────┐
    │   SystemCall    │
    ├─────────────────┤
    │ id: String (PK) │
    │ name: String    │◄────────┐
    │ description     │         │
    │ category        │         │ 1:N
    │ enabled: Bool   │         │
    │ allowedRoles    │         │
    │ requiresParams  │         │
    │ createdAt       │         │
    │ updatedAt       │         │
    └─────────────────┘         │
                         ┌──────┴────────┐
                         │    Policy     │
                         ├───────────────┤
                         │ id: String    │
                         │ role: String  │
                         │ systemCallId  │
                         │ allowed: Bool │
                         │ maxExecutions │
                         │ createdAt     │
                         │ updatedAt     │
                         └───────────────┘

    ┌───────────────────┐
    │  Configuration    │
    ├───────────────────┤
    │ id: String (PK)   │
    │ key: String       │
    │ value: String     │
    │ description       │
    │ updatedAt         │
    └───────────────────┘
```

### Table Descriptions

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| **users** | Store user accounts with roles and authentication | Parent to SystemCallLog and LoginAttempt |
| **system_calls** | Define available system calls and their properties | Parent to SystemCallLog and Policy |
| **policies** | Map roles to system calls with permissions | Child of SystemCall |
| **system_call_logs** | Complete audit trail of all executions | Child of User and SystemCall |
| **login_attempts** | Track authentication attempts for rate limiting | Child of User |
| **configurations** | Store system-wide settings | Standalone |

---

## Authentication Flow

```
┌──────────┐                                    ┌──────────────┐
│  Client  │                                    │   NextAuth   │
└─────┬────┘                                    └──────┬───────┘
      │                                                │
      │  1. POST /api/auth/callback/credentials       │
      │  { email, password }                          │
      ├──────────────────────────────────────────────►│
      │                                                │
      │                                         ┌──────▼──────┐
      │                                         │ Validate    │
      │                                         │ Credentials │
      │                                         └──────┬──────┘
      │                                                │
      │                                         ┌──────▼──────┐
      │                                         │ Check Rate  │
      │                                         │ Limiting    │
      │                                         └──────┬──────┘
      │                                                │
      │                                         ┌──────▼──────┐
      │                                         │ Query User  │
      │                                         │ from DB     │
      │                                         └──────┬──────┘
      │                                                │
      │                                         ┌──────▼──────┐
      │                                         │ Compare     │
      │                                         │ bcrypt Hash │
      │                                         └──────┬──────┘
      │                                                │
      │                                         ┌──────▼──────┐
      │                                         │ Create JWT  │
      │                                         │ Session     │
      │                                         └──────┬──────┘
      │                                                │
      │  2. Set-Cookie: next-auth.session-token       │
      │◄──────────────────────────────────────────────┤
      │                                                │
      │  3. Redirect to /dashboard                    │
      │◄──────────────────────────────────────────────┤
      │                                                │
      │  4. GET /dashboard (with cookie)              │
      ├──────────────────────────────────────────────►│
      │                                                │
      │                                         ┌──────▼──────┐
      │                                         │ Verify JWT  │
      │                                         │ Token       │
      │                                         └──────┬──────┘
      │                                                │
      │  5. Return protected page                     │
      │◄──────────────────────────────────────────────┤
      │                                                │
```

### Authentication Components

1. **NextAuth.js**: Handles session management and JWT creation
2. **Credentials Provider**: Custom authentication with email/password
3. **bcryptjs**: Secure password hashing (12 rounds)
4. **Middleware**: Protects routes and enforces RBAC
5. **Session Callbacks**: Add role information to JWT and session

---

## System Call Execution Flow

```
┌────────┐                                              ┌──────────┐
│ Client │                                              │   API    │
└───┬────┘                                              └────┬─────┘
    │                                                        │
    │  1. POST /api/syscall                                 │
    │  { syscallName: "readFile", parameters: {...} }       │
    ├──────────────────────────────────────────────────────►│
    │                                                        │
    │                                                 ┌──────▼──────┐
    │                                                 │ Check Auth  │
    │                                                 │ Session     │
    │                                                 └──────┬──────┘
    │                                                        │
    │                                                 ┌──────▼──────┐
    │                                                 │ Load Policy │
    │                                                 │ for Role    │
    │                                                 └──────┬──────┘
    │                                                        │
    │                                                 ┌──────▼──────┐
    │                                                 │ Check if    │
    │                                                 │ Allowed     │
    │                                                 └──────┬──────┘
    │                                                        │
    │                                                 ┌──────▼──────┐
    │                                                 │ Validate    │
    │                                                 │ Parameters  │
    │                                                 │ (Zod)       │
    │                                                 └──────┬──────┘
    │                                                        │
    │                                                 ┌──────▼──────┐
    │                                                 │ Sanitize    │
    │                                                 │ Inputs      │
    │                                                 └──────┬──────┘
    │                                                        │
    │                                                 ┌──────▼──────┐
    │                                                 │ Execute     │
    │                                                 │ System Call │
    │                                                 └──────┬──────┘
    │                                                        │
    │                                                 ┌──────▼──────┐
    │                                                 │ Log to      │
    │                                                 │ Database    │
    │                                                 └──────┬──────┘
    │                                                        │
    │  2. { success: true, data: {...} }                    │
    │◄──────────────────────────────────────────────────────┤
    │                                                        │
```

### Execution Layers

1. **Request Handler**: Receives syscall request
2. **Authentication Layer**: Verifies user session
3. **Authorization Layer**: Checks policy permissions
4. **Validation Layer**: Validates parameters with Zod schemas
5. **Sanitization Layer**: Prevents path traversal and injection
6. **Execution Layer**: Runs the actual system call
7. **Logging Layer**: Records execution details
8. **Response Layer**: Returns result to client

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.15 | React framework with App Router |
| **React** | 18.3.1 | UI component library |
| **TypeScript** | 5.6.3 | Type-safe JavaScript |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework |
| **ShadCN UI** | Latest | Pre-built component library |
| **Recharts** | 2.12.7 | Data visualization charts |
| **next-themes** | 0.4.4 | Dark mode support |
| **Lucide React** | 0.460.0 | Icon library |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 14.2.15 | Serverless API endpoints |
| **NextAuth.js** | 4.24.11 | Authentication framework |
| **Prisma** | 5.22.0 | ORM for database access |
| **SQLite** | - | Lightweight database |
| **Zod** | 3.23.8 | Runtime type validation |
| **bcryptjs** | 2.4.3 | Password hashing |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **TypeScript Compiler** | Type checking |
| **Prisma Studio** | Database GUI |
| **Git** | Version control |

---

## Design Patterns

### 1. **Repository Pattern**
- `src/lib/db.ts` - Single source of database connection
- Prevents multiple Prisma client instances
- Singleton pattern for DB access

### 2. **Provider Pattern**
- `src/components/providers.tsx` - Wraps app with context providers
- SessionProvider for authentication state
- ThemeProvider for dark mode

### 3. **Factory Pattern**
- `src/lib/syscalls.ts` - System call executor factory
- Different executors for different syscall types
- Centralized syscall creation logic

### 4. **Middleware Pattern**
- `src/middleware.ts` - Request interception
- Route protection based on authentication
- Role-based access control enforcement

### 5. **Strategy Pattern**
- `src/lib/policies.ts` - Different permission strategies
- Role-based permission checking
- Rate limiting strategies per role

---

## Security Architecture

### Multi-Layer Security Model

```
┌──────────────────────────────────────────────────────┐
│              Layer 1: Network Security               │
│  • HTTPS encryption (production)                     │
│  • CORS configuration                                │
│  • Environment variable isolation                    │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│         Layer 2: Authentication Security             │
│  • JWT session tokens (24-hour expiry)               │
│  • bcrypt password hashing (12 rounds)               │
│  • Login attempt tracking                            │
│  • IP-based rate limiting                            │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│         Layer 3: Authorization Security              │
│  • Role-based access control (RBAC)                  │
│  • Policy engine with fine-grained permissions       │
│  • Server-side permission checks                     │
│  • Middleware route protection                       │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│          Layer 4: Input Validation                   │
│  • Zod schema validation                             │
│  • Type-safe parameter checking                      │
│  • SQL injection prevention (Prisma ORM)             │
│  • XSS protection                                    │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│        Layer 5: System Call Safety                   │
│  • Path traversal prevention                         │
│  • Safe directory restrictions                       │
│  • Command whitelisting                              │
│  • No arbitrary command execution                    │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│          Layer 6: Audit & Monitoring                 │
│  • Complete execution logging                        │
│  • User action tracking                              │
│  • Failed attempt recording                          │
│  • Timestamp and IP capture                          │
└──────────────────────────────────────────────────────┘
```

### Security Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **Password Security** | bcrypt (12 rounds) | Prevent password cracking |
| **Session Management** | JWT with HttpOnly cookies | Prevent session hijacking |
| **CSRF Protection** | NextAuth built-in | Prevent cross-site attacks |
| **Path Traversal** | `../` removal & validation | Prevent directory escape |
| **Command Injection** | Whitelist only | Prevent arbitrary execution |
| **Rate Limiting** | Per-role limits | Prevent abuse |
| **Audit Trail** | Complete logging | Track all actions |

---

## Deployment Architecture

### Development Environment
```
┌────────────────────────────────────┐
│    Developer Machine (localhost)   │
├────────────────────────────────────┤
│  • Next.js Dev Server (Port 3000)  │
│  • SQLite Database (dev.db)        │
│  • Hot Module Replacement           │
│  • Source Maps Enabled              │
└────────────────────────────────────┘
```

### Production Environment (Recommended)
```
┌──────────────────────────────────────────────┐
│             Vercel / Cloud Platform          │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────┐      │
│  │     Edge Network (CDN)             │      │
│  └──────────────┬─────────────────────┘      │
│                 │                             │
│  ┌──────────────▼─────────────────────┐      │
│  │   Next.js Production Build         │      │
│  │  • Server-side Rendering            │      │
│  │  • API Routes                       │      │
│  │  • Static Assets                    │      │
│  └──────────────┬─────────────────────┘      │
│                 │                             │
│  ┌──────────────▼─────────────────────┐      │
│  │   Database (PostgreSQL/MySQL)       │      │
│  │  • Production-ready                 │      │
│  │  • Backup enabled                   │      │
│  │  • Connection pooling               │      │
│  └─────────────────────────────────────┘      │
└──────────────────────────────────────────────┘
```

---

## Performance Considerations

### Optimization Strategies

1. **Server-Side Rendering**: Fast initial page loads
2. **Static Generation**: Pre-rendered pages where possible
3. **Code Splitting**: Automatic with Next.js App Router
4. **Image Optimization**: Next.js Image component
5. **Database Indexing**: Indexed columns for fast queries
6. **Caching**: Session caching with NextAuth

### Scalability

- **Horizontal Scaling**: Stateless API design allows multiple instances
- **Database Scaling**: Can migrate from SQLite to PostgreSQL/MySQL
- **CDN Integration**: Static assets served from edge network
- **API Rate Limiting**: Prevents resource exhaustion

---

## Future Architecture Enhancements

### Potential Improvements

1. **Microservices**: Split system calls into separate services
2. **Message Queue**: Use Redis for async syscall execution
3. **Caching Layer**: Add Redis for session and data caching
4. **WebSockets**: Real-time log updates
5. **Docker**: Containerize application
6. **Kubernetes**: Orchestrate multi-instance deployments
7. **Monitoring**: Add Prometheus/Grafana for metrics
8. **CI/CD**: Automated testing and deployment pipelines

---

## Conclusion

This architecture provides a solid foundation for a secure, scalable system call interface. The modular design allows for easy maintenance and feature additions, while the multi-layer security model ensures safe operation even with direct system access.

For detailed API documentation, see [API_REFERENCE.md](./API_REFERENCE.md).
For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
