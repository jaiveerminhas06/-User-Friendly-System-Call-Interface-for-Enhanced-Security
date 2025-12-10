# 🤝 Contributing to System Call Interface

First off, thank you for considering contributing to the System Call Interface! It's people like you that make this project such a great learning tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Adding New Features](#adding-new-features)
- [Testing Guidelines](#testing-guidelines)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**Use this template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 11]
 - Browser [e.g. Chrome 120]
 - Node Version [e.g. 20.10.0]
 - Project Version [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List some examples** of how it would be used
- **Include mockups or diagrams** if applicable

### 📝 Your First Code Contribution

Unsure where to begin? You can start by looking through these issues:

- **Beginner issues** - issues which should only require a few lines of code
- **Help wanted issues** - issues which should be a bit more involved than beginner issues

### 🔨 Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Follow the [coding standards](#coding-standards)
- Include screenshots and animated GIFs in your pull request whenever possible
- Document new code based on the project's documentation style
- End all files with a newline

---

## Development Setup

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Git**
- **Code editor** (VS Code recommended)

### Step 1: Fork the Repository

1. Fork the repo on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/-User-Friendly-System-Call-Interface-for-Enhanced-Security.git
cd -User-Friendly-System-Call-Interface-for-Enhanced-Security
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Generate a new NextAuth secret
# PowerShell:
$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)

# Linux/Mac:
openssl rand -base64 32

# Update .env with the generated secret
```

### Step 4: Initialize Database

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your local instance!

### Step 6: Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

---

## Project Structure

```
SysCall Interface/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Database seeding
│   └── migrations/         # Migration history
├── src/
│   ├── app/
│   │   ├── (auth)/         # Authentication pages
│   │   ├── admin/          # Admin panel
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── syscalls/       # System calls page
│   │   ├── logs/           # Logs page
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── ui/             # ShadCN components
│   │   ├── navigation.tsx  # Nav component
│   │   └── providers.tsx   # Context providers
│   ├── lib/
│   │   ├── auth.ts         # Auth logic
│   │   ├── policies.ts     # Policy engine
│   │   ├── syscalls.ts     # Syscall executor
│   │   ├── logging.ts      # Logging system
│   │   └── db.ts           # Database client
│   └── types/              # TypeScript types
├── public/                 # Static assets
├── .env                    # Environment variables
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── tailwind.config.ts      # Tailwind config
```

### Key Files to Know

| File | Purpose |
|------|---------|
| `src/lib/syscalls.ts` | Add new system call implementations here |
| `src/app/api/syscall/route.ts` | Main API endpoint for syscalls |
| `prisma/schema.prisma` | Define database models |
| `src/components/navigation.tsx` | Modify navigation bar |
| `src/app/globals.css` | Update global styles and dark mode |

---

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Avoid `any`** - use proper types
- **Export types** when they're reused
- **Use interfaces** for object shapes

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: "ADMIN" | "POWER_USER" | "VIEWER";
}

function getUser(id: string): Promise<User> {
  // implementation
}

// ❌ Bad
function getUser(id: any): any {
  // implementation
}
```

### React Components

- **Use functional components** with hooks
- **Use TypeScript** for props
- **Export default** for page components
- **Named exports** for reusable components

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ Bad
export function Button(props: any) {
  return <button>{props.label}</button>;
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `UserProfile`, `SystemCallTable` |
| **Functions** | camelCase | `getUserById`, `executeSyscall` |
| **Variables** | camelCase | `userId`, `isAuthenticated` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS`, `DEFAULT_ROLE` |
| **Files** | kebab-case | `user-profile.tsx`, `syscall-executor.ts` |
| **Types/Interfaces** | PascalCase | `User`, `SystemCall`, `LogEntry` |

### Code Formatting

We use **ESLint** and **Prettier** for consistent code formatting.

```bash
# Format code
npm run lint

# Auto-fix issues
npm run lint --fix
```

**Key rules:**
- **2 spaces** for indentation
- **Semicolons** required
- **Single quotes** for strings
- **Trailing commas** in multiline

---

## Commit Guidelines

We follow the **Conventional Commits** specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding missing tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```bash
# Adding a feature
git commit -m "feat(syscalls): add file upload system call"

# Fixing a bug
git commit -m "fix(auth): prevent login with expired tokens"

# Updating docs
git commit -m "docs(readme): add deployment instructions"

# Refactoring
git commit -m "refactor(policies): simplify permission checking logic"
```

### Multi-line Commits

For more complex changes:

```
feat(dashboard): add real-time chart updates

- Implemented WebSocket connection for live data
- Added chart animation on data update
- Optimized re-rendering performance

Closes #123
```

---

## Pull Request Process

### 1. Update Your Branch

Before submitting, make sure your branch is up to date:

```bash
git checkout main
git pull upstream main
git checkout your-feature-branch
git rebase main
```

### 2. Test Your Changes

```bash
# Run the dev server
npm run dev

# Test in browser
# - Try different user roles
# - Test dark mode
# - Check mobile responsiveness
# - Verify error handling
```

### 3. Update Documentation

If you:
- Added a new feature → Update USER_GUIDE.md
- Changed APIs → Update API_REFERENCE.md
- Modified architecture → Update ARCHITECTURE.md
- Fixed a bug → Update CHANGELOG.md

### 4. Create Pull Request

1. Push your branch to your fork:
```bash
git push origin your-feature-branch
```

2. Go to GitHub and create a Pull Request

3. Fill in the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested on multiple browsers
- [ ] I have tested dark mode
```

### 5. Code Review

- Address reviewer feedback
- Make requested changes
- Push updates to the same branch
- PR will update automatically

### 6. Merge

Once approved:
- Squash commits if multiple small commits
- Use merge commit for feature branches
- Delete branch after merge

---

## Adding New Features

### Adding a New System Call

**Step 1: Define the System Call**

Edit `src/lib/syscalls.ts`:

```typescript
// Add to SyscallExecutor class
async executeCustomCall(params: { myParam: string }): Promise<string> {
  // Implement your logic here
  return `Result: ${params.myParam}`;
}
```

**Step 2: Add to Executor Map**

```typescript
const executors: Record<string, SyscallExecutor> = {
  // ... existing
  myCustomCall: (params) => executor.executeCustomCall(params),
};
```

**Step 3: Add Validation Schema**

```typescript
const schemas: Record<string, z.ZodSchema> = {
  // ... existing
  myCustomCall: z.object({
    myParam: z.string().min(1),
  }),
};
```

**Step 4: Seed Database**

Edit `prisma/seed.ts`:

```typescript
await prisma.systemCall.create({
  data: {
    name: "myCustomCall",
    description: "Does something custom",
    category: "CUSTOM",
    enabled: true,
    allowedRoles: JSON.stringify(["ADMIN", "POWER_USER"]),
    requiresParams: true,
  },
});
```

**Step 5: Run Migration**

```bash
npm run db:seed
```

**Step 6: Test It**

1. Go to `/syscalls`
2. Select your new system call
3. Enter parameters
4. Execute!

### Adding a New Page

**Step 1: Create Page File**

```typescript
// src/app/my-page/page.tsx
"use client";

import { Navigation } from "@/components/navigation";

export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">My New Page</h1>
      </div>
    </div>
  );
}
```

**Step 2: Add to Navigation**

Edit `src/components/navigation.tsx`:

```typescript
const navItems = [
  // ... existing items
  { href: "/my-page", label: "My Page", icon: YourIcon },
];
```

**Step 3: Protect Route (if needed)**

Edit `src/middleware.ts`:

```typescript
// Add to protected routes
if (pathname.startsWith("/my-page") && !session) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

---

## Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] **Authentication**
  - Login with each role
  - Logout works
  - Session persists on refresh

- [ ] **System Calls**
  - Execute each syscall
  - Test with invalid parameters
  - Verify error handling
  - Check permissions work

- [ ] **Dark Mode**
  - Toggle works on all pages
  - No visual glitches
  - Smooth transitions

- [ ] **Responsive Design**
  - Test on mobile (375px)
  - Test on tablet (768px)
  - Test on desktop (1920px)

- [ ] **Browser Compatibility**
  - Chrome
  - Firefox
  - Safari
  - Edge

### Testing User Roles

```bash
# Login as different users
Viewer:     viewer@syscall.local / viewer123
Power User: power@syscall.local / power123
Admin:      admin@syscall.local / admin123
```

Test that:
- Viewers can't write files
- Power users can't access admin panel
- Admins can do everything

---

## Questions?

If you have questions:

1. **Check the docs** - Read USER_GUIDE.md, ARCHITECTURE.md
2. **Search issues** - Someone might have asked before
3. **Ask in discussions** - GitHub Discussions tab
4. **Contact maintainer** - Email or GitHub

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in commit history

Thank you for making this project better! 🎉

---

**Happy Contributing!** 🚀
