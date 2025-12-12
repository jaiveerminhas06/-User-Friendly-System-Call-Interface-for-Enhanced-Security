# Project Analysis Tools

This directory contains automated tools for analyzing and documenting the project.

## Extract Project Summary

The `extract_project_summary.ts` script performs comprehensive static analysis of the repository and generates:

1. **JSON Output**: `tools/output/project_summary.json` - Machine-readable project metadata
2. **Markdown Output**: `tools/output/project_summary.md` - Human-readable analysis report

### Features

- **Git Analysis**: Commit history, timeline, and statistics
- **Code Analysis**: Modules, components, API endpoints, system calls
- **Database Schema**: Prisma models with fields and relationships
- **Security Scanning**: Detects potential security issues
- **Completeness Check**: Identifies missing components
- **File Mapping**: Maps each file to its module and purpose

### Usage

#### Option 1: Using npx (Recommended)

```bash
npx ts-node tools/extract_project_summary.ts
```

#### Option 2: Install dependencies first

```bash
cd tools
npm install
npm run analyze
```

#### Option 3: From project root

```bash
npx ts-node tools/extract_project_summary.ts
```

### Output Files

After running the script, you'll find:

- `tools/output/project_summary.json` - Complete analysis in JSON format
- `tools/output/project_summary.md` - Formatted report in Markdown

### What It Analyzes

- ✅ Package.json dependencies and scripts
- ✅ Git commit history and timeline
- ✅ Prisma database schema and models
- ✅ Next.js API routes and endpoints
- ✅ System call implementations
- ✅ Policy definitions and RBAC rules
- ✅ Authentication setup (NextAuth.js)
- ✅ Logging infrastructure
- ✅ UI pages and components
- ✅ Test files and coverage
- ✅ Environment variables
- ✅ Security vulnerabilities (hardcoded secrets, unsafe code)
- ✅ Documentation completeness

### Sample Output

The script will display a summary like:

```
📊 ANALYSIS COMPLETE
================================================================================

Project: User-Friendly System Call Interface
Completeness Score: 85/100
Total Files Analyzed: 67
API Endpoints Found: 12
System Calls Detected: 7
Database Models: 6
Security Findings: 1
Missing Items: 2

================================================================================
```

### Requirements

- Node.js 20.x or higher
- TypeScript 5.x
- ts-node (installed automatically if using npx)

### Notes

- The script only reads files; it does not modify your codebase
- Secrets found in code are flagged but values are redacted in output
- Analysis is purely static (no code execution)
- Git commands are used for commit history only
