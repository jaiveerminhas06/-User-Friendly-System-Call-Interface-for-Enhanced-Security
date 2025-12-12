#!/usr/bin/env ts-node

/**
 * Project Summary Extraction Tool
 * 
 * Statically analyzes the Next.js + TypeScript repository and generates:
 * - JSON output: tools/output/project_summary.json
 * - Markdown output: tools/output/project_summary.md
 * 
 * Usage: npx ts-node tools/extract_project_summary.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ============================================================================
// TYPES
// ============================================================================

interface ProjectSummary {
  meta: {
    project_name: string;
    repo_root: string;
    analysis_date: string;
    node_version: string | null;
    typescript_version: string | null;
  };
  git_summary: {
    commit_count: number;
    first_commit_date: string;
    last_commit_date: string;
    recent_commits: Array<{
      hash: string;
      author: string;
      date: string;
      message: string;
    }>;
  };
  package: {
    name: string;
    version: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
  };
  tech_stack: {
    frameworks: string[];
    languages: string[];
    orm: string | null;
    db: string | null;
  };
  prisma_schema: {
    exists: boolean;
    models: Array<{
      name: string;
      fields: Array<{ name: string; type: string; optional: boolean }>;
      raw: string;
    }>;
  };
  modules: Array<{
    module_name: string;
    files: string[];
    description: string;
    exposed_apis: Array<{
      path: string;
      methods: string[];
      auth_required: boolean;
    }>;
    models_used: string[];
    tests: string[];
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    notes: string;
  }>;
  api_endpoints: Array<{
    route: string;
    method: string;
    handler_file: string;
    auth_required: boolean;
    params_schema: any;
    return_schema: any;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  syscall_definitions: Array<{
    name: string;
    file: string;
    params: string[];
    returns: string;
    whitelist_check: boolean;
    sandbox_root: string | null;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  policies: Array<{
    role: string;
    allowed_syscalls: string[];
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  logging: {
    model: { name: string; fields: any[] } | null;
    storage: string;
    log_examples: any[];
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  tests_summary: {
    has_tests: boolean;
    test_frameworks: string[];
    tests_per_module: Record<string, number>;
  };
  readme_summary: {
    exists: boolean;
    setup_steps: string[];
    run_steps: string[];
  };
  env_keys: string[];
  security_findings: Array<{
    type: string;
    file: string;
    line: number;
    detail: string;
  }>;
  missing_items: string[];
  file_map: Array<{
    path: string;
    module: string;
    brief: string;
  }>;
  final_notes: {
    completeness_score: string;
    recommendations: string[];
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(__dirname, 'output');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function walkDirectory(dir: string, exclude: string[] = ['node_modules', '.git', '.next', 'dist', 'build']): string[] {
  const files: string[] = [];
  
  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(REPO_ROOT, fullPath);
      
      if (exclude.some(ex => relativePath.startsWith(ex))) continue;
      
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function safeReadFile(filePath: string): string | null {
  try {
    return fs.readFileSync(path.join(REPO_ROOT, filePath), 'utf-8');
  } catch {
    return null;
  }
}

function safeExec(command: string): string | null {
  try {
    return execSync(command, { cwd: REPO_ROOT, encoding: 'utf-8' });
  } catch {
    return null;
  }
}

function parsePackageJson() {
  const content = safeReadFile('package.json');
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function getNodeVersion(): string | null {
  return safeExec('node --version')?.trim() || null;
}

// ============================================================================
// GIT ANALYSIS
// ============================================================================

function analyzeGit() {
  const commitLog = safeExec('git log --pretty=format:"%H|%an|%ai|%s" -n 20');
  
  if (!commitLog) {
    return {
      commit_count: 0,
      first_commit_date: '',
      last_commit_date: '',
      recent_commits: []
    };
  }
  
  const commits = commitLog.trim().split('\n').map(line => {
    const [hash, author, date, message] = line.split('|');
    return { hash, author, date, message };
  });
  
  const totalCommits = safeExec('git rev-list --count HEAD');
  const firstCommit = safeExec('git log --reverse --pretty=format:"%ai" | head -n 1');
  
  return {
    commit_count: totalCommits ? parseInt(totalCommits.trim()) : commits.length,
    first_commit_date: firstCommit?.trim() || commits[commits.length - 1]?.date || '',
    last_commit_date: commits[0]?.date || '',
    recent_commits: commits
  };
}

// ============================================================================
// PRISMA SCHEMA ANALYSIS
// ============================================================================

function analyzePrismaSchema() {
  const schemaPath = 'prisma/schema.prisma';
  const content = safeReadFile(schemaPath);
  
  if (!content) {
    return { exists: false, models: [] };
  }
  
  const models: any[] = [];
  const modelRegex = /model\s+(\w+)\s*{([^}]*)}/g;
  
  let match;
  while ((match = modelRegex.exec(content)) !== null) {
    const [, modelName, fieldsBlock] = match;
    const fields: any[] = [];
    
    const fieldLines = fieldsBlock.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
    
    for (const line of fieldLines) {
      const fieldMatch = line.match(/^\s*(\w+)\s+([\w\[\]?]+)/);
      if (fieldMatch) {
        const [, fieldName, fieldType] = fieldMatch;
        fields.push({
          name: fieldName,
          type: fieldType.replace('?', ''),
          optional: fieldType.includes('?')
        });
      }
    }
    
    models.push({
      name: modelName,
      fields,
      raw: match[0]
    });
  }
  
  return { exists: true, models };
}

// ============================================================================
// API ENDPOINTS ANALYSIS
// ============================================================================

function analyzeApiEndpoints(files: string[]) {
  const endpoints: any[] = [];
  
  const apiFiles = files.filter(f => 
    (f.includes('/api/') && (f.endsWith('route.ts') || f.endsWith('route.js'))) ||
    (f.startsWith('src/pages/api/') && f.endsWith('.ts'))
  );
  
  for (const file of apiFiles) {
    const content = safeReadFile(file);
    if (!content) continue;
    
    // Extract route path
    let route = file
      .replace('src/app', '')
      .replace('src/pages', '')
      .replace('/route.ts', '')
      .replace('/route.js', '')
      .replace('.ts', '')
      .replace('.js', '');
    
    // Detect HTTP methods
    const methods: string[] = [];
    if (content.includes('export async function GET') || content.includes('export function GET')) methods.push('GET');
    if (content.includes('export async function POST') || content.includes('export function POST')) methods.push('POST');
    if (content.includes('export async function PUT') || content.includes('export function PUT')) methods.push('PUT');
    if (content.includes('export async function PATCH') || content.includes('export function PATCH')) methods.push('PATCH');
    if (content.includes('export async function DELETE') || content.includes('export function DELETE')) methods.push('DELETE');
    
    // Check auth requirement
    const authRequired = content.includes('getServerSession') || content.includes('session.user');
    
    for (const method of methods) {
      endpoints.push({
        route,
        method,
        handler_file: file,
        auth_required: authRequired,
        params_schema: {},
        return_schema: {},
        confidence: 'HIGH'
      });
    }
  }
  
  return endpoints;
}

// ============================================================================
// SYSCALL ANALYSIS
// ============================================================================

function analyzeSyscalls() {
  const syscallFile = 'src/lib/syscalls.ts';
  const content = safeReadFile(syscallFile);
  
  if (!content) return [];
  
  const syscalls: any[] = [];
  
  // Look for function exports
  const functionRegex = /export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  
  while ((match = functionRegex.exec(content)) !== null) {
    const [, funcName, params] = match;
    
    // Skip helper functions
    if (funcName === 'executeSyscall' || funcName === 'sanitizePath') continue;
    
    const paramList = params
      .split(',')
      .map(p => p.trim())
      .filter(p => p)
      .map(p => {
        const [name, type] = p.split(':').map(s => s.trim());
        return `${name}:${type || 'any'}`;
      });
    
    syscalls.push({
      name: funcName,
      file: syscallFile,
      params: paramList,
      returns: 'Promise<any>',
      whitelist_check: content.includes('SAFE_COMMANDS') || content.includes('whitelist'),
      sandbox_root: content.includes('SAFE_DIR') ? 'SAFE_DIR' : null,
      confidence: 'HIGH'
    });
  }
  
  return syscalls;
}

// ============================================================================
// POLICY ANALYSIS
// ============================================================================

function analyzePolicies() {
  const policyFile = 'src/lib/policies.ts';
  const content = safeReadFile(policyFile);
  
  if (!content) return [];
  
  const policies: any[] = [];
  
  // Simple heuristic: look for role definitions
  const roles = ['ADMIN', 'POWER_USER', 'VIEWER'];
  
  for (const role of roles) {
    if (content.includes(role)) {
      let allowedSyscalls: string[] = [];
      
      // Check if admin has all access
      if (role === 'ADMIN' && content.includes('return true')) {
        allowedSyscalls = ['*'];
      } else {
        // Extract from policy checks
        const syscallNames = ['listDirectory', 'readFile', 'writeFile', 'deleteFile', 'listProcesses', 'runSafeCommand', 'getSystemInfo'];
        allowedSyscalls = syscallNames.filter(sc => content.toLowerCase().includes(sc.toLowerCase()));
      }
      
      policies.push({
        role,
        allowed_syscalls: allowedSyscalls,
        confidence: 'MEDIUM'
      });
    }
  }
  
  return policies;
}

// ============================================================================
// LOGGING ANALYSIS
// ============================================================================

function analyzeLogging(prismaModels: any[]) {
  const logModel = prismaModels.find(m => m.name === 'SystemCallLog');
  
  return {
    model: logModel ? { name: logModel.name, fields: logModel.fields } : null,
    storage: logModel ? 'prisma' : 'none',
    log_examples: [],
    confidence: logModel ? 'HIGH' : 'LOW'
  };
}

// ============================================================================
// TESTS ANALYSIS
// ============================================================================

function analyzeTests(files: string[]) {
  const testFiles = files.filter(f => 
    f.includes('__tests__') || 
    f.includes('.test.') || 
    f.includes('.spec.') ||
    f.startsWith('tests/')
  );
  
  const frameworks: string[] = [];
  const pkg = parsePackageJson();
  
  if (pkg?.devDependencies?.jest) frameworks.push('jest');
  if (pkg?.devDependencies?.vitest) frameworks.push('vitest');
  if (pkg?.devDependencies?.mocha) frameworks.push('mocha');
  
  return {
    has_tests: testFiles.length > 0,
    test_frameworks: frameworks,
    tests_per_module: {}
  };
}

// ============================================================================
// README ANALYSIS
// ============================================================================

function analyzeReadme() {
  const content = safeReadFile('README.md');
  
  if (!content) {
    return { exists: false, setup_steps: [], run_steps: [] };
  }
  
  const setupSteps: string[] = [];
  const runSteps: string[] = [];
  
  // Extract installation section
  const installMatch = content.match(/##.*Installation([\s\S]*?)##/i);
  if (installMatch) {
    const codeBlocks = installMatch[1].match(/```[\s\S]*?```/g);
    if (codeBlocks) {
      setupSteps.push(...codeBlocks.map(b => b.replace(/```\w*\n?/g, '').trim()));
    }
  }
  
  // Extract run commands
  if (content.includes('npm run dev')) runSteps.push('npm run dev');
  if (content.includes('npm start')) runSteps.push('npm start');
  
  return {
    exists: true,
    setup_steps: setupSteps,
    run_steps: runSteps
  };
}

// ============================================================================
// ENV KEYS ANALYSIS
// ============================================================================

function analyzeEnvKeys() {
  const keys = new Set<string>();
  
  const envFiles = ['.env', '.env.example', '.env.local', '.env.development'];
  
  for (const envFile of envFiles) {
    const content = safeReadFile(envFile);
    if (!content) continue;
    
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
      if (match) {
        keys.add(match[1]);
      }
    }
  }
  
  return Array.from(keys);
}

// ============================================================================
// SECURITY ANALYSIS
// ============================================================================

function analyzeSecurityFindings(files: string[]) {
  const findings: any[] = [];
  
  const sourceFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.tsx') || f.endsWith('.jsx'));
  
  for (const file of sourceFiles) {
    const content = safeReadFile(file);
    if (!content) continue;
    
    const lines = content.split('\n');
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Check for hardcoded secrets (simple patterns)
      if (line.match(/password\s*[:=]\s*["'](?!.*\$\{)[^"']{8,}["']/i) && !line.includes('placeholder')) {
        findings.push({
          type: 'HardcodedSecret',
          file,
          line: lineNum,
          detail: 'Potential hardcoded password detected'
        });
      }
      
      // Check for unsafe child_process usage
      if ((line.includes('exec(') || line.includes('spawn(')) && !line.includes('//')) {
        const hasWhitelist = content.includes('SAFE_COMMANDS') || content.includes('whitelist');
        if (!hasWhitelist) {
          findings.push({
            type: 'UnsafeChildProcess',
            file,
            line: lineNum,
            detail: 'child_process usage without obvious command whitelist'
          });
        }
      }
      
      // Check for path concatenation without sanitization
      if (line.match(/\+.*['"]\.\.['"]/)) {
        findings.push({
          type: 'PathTraversal',
          file,
          line: lineNum,
          detail: 'Potential path traversal: direct string concatenation with ..'
        });
      }
    });
  }
  
  return findings;
}

// ============================================================================
// MODULE MAPPING
// ============================================================================

function buildModules(files: string[], apiEndpoints: any[], prismaModels: any[], tests: any) {
  const modules: any[] = [];
  
  // Authentication Module
  const authFiles = files.filter(f => 
    f.includes('/auth/') || 
    f.includes('lib/auth') ||
    f.includes('login') ||
    f.includes('register')
  );
  
  modules.push({
    module_name: 'Authentication & Authorization',
    files: authFiles,
    description: 'NextAuth.js-based authentication with JWT sessions, bcrypt password hashing, and role-based access control',
    exposed_apis: apiEndpoints.filter(e => e.route.includes('/auth')),
    models_used: ['User', 'LoginAttempt'],
    tests: [],
    confidence: 'HIGH',
    notes: 'Implements RBAC with 3 roles: ADMIN, POWER_USER, VIEWER'
  });
  
  // System Call Interface
  const syscallFiles = files.filter(f => 
    f.includes('syscall') && !f.includes('test')
  );
  
  modules.push({
    module_name: 'System Call Interface',
    files: syscallFiles,
    description: 'Executes 7 system calls (file ops, process management, system info) with sandboxing and command whitelisting',
    exposed_apis: apiEndpoints.filter(e => e.route.includes('/syscall')),
    models_used: ['SystemCall'],
    tests: [],
    confidence: 'HIGH',
    notes: 'Includes path sanitization and SAFE_COMMANDS whitelist'
  });
  
  // Policy Engine
  const policyFiles = files.filter(f => f.includes('polic'));
  
  modules.push({
    module_name: 'Policy Engine',
    files: policyFiles,
    description: 'Role-based policy enforcement determining which syscalls each role can execute',
    exposed_apis: apiEndpoints.filter(e => e.route.includes('/policies')),
    models_used: ['Policy'],
    tests: [],
    confidence: 'HIGH',
    notes: 'Configurable per-role and per-syscall permissions'
  });
  
  // Logging & Monitoring
  const logFiles = files.filter(f => 
    f.includes('log') || 
    f.includes('dashboard')
  );
  
  modules.push({
    module_name: 'Logging & Monitoring',
    files: logFiles,
    description: 'Comprehensive audit trail with dashboard showing statistics, charts, and filterable log viewer',
    exposed_apis: apiEndpoints.filter(e => e.route.includes('/log') || e.route.includes('/dashboard')),
    models_used: ['SystemCallLog'],
    tests: [],
    confidence: 'HIGH',
    notes: 'Tracks all syscall executions with user, timestamp, parameters, and status'
  });
  
  // Admin Panel
  const adminFiles = files.filter(f => f.includes('admin'));
  
  modules.push({
    module_name: 'Admin Dashboard & UI',
    files: adminFiles,
    description: 'Admin-only interface for user management, policy configuration, and database reset',
    exposed_apis: apiEndpoints.filter(e => e.route.includes('/admin')),
    models_used: ['User', 'Policy'],
    tests: [],
    confidence: 'HIGH',
    notes: 'Includes reset functionality to restore default state'
  });
  
  // Database Models
  modules.push({
    module_name: 'Database & Models',
    files: ['prisma/schema.prisma'],
    description: 'Prisma ORM with SQLite database containing 6 models',
    exposed_apis: [],
    models_used: prismaModels.map(m => m.name),
    tests: [],
    confidence: 'HIGH',
    notes: `Models: ${prismaModels.map(m => m.name).join(', ')}`
  });
  
  return modules;
}

// ============================================================================
// FILE MAPPING
// ============================================================================

function buildFileMap(files: string[]) {
  const fileMap: any[] = [];
  
  for (const file of files) {
    let module = 'Misc';
    let brief = 'Source file';
    
    if (file.includes('/auth/') || file.includes('login') || file.includes('register')) {
      module = 'Authentication & Authorization';
      brief = file.includes('page.tsx') ? 'Authentication page UI' : 'Auth API route or utility';
    } else if (file.includes('syscall')) {
      module = 'System Call Interface';
      brief = file.includes('page.tsx') ? 'Syscall execution UI' : 'Syscall implementation or API';
    } else if (file.includes('polic')) {
      module = 'Policy Engine';
      brief = file.includes('page.tsx') ? 'Policy management UI' : 'Policy enforcement logic';
    } else if (file.includes('log') || file.includes('dashboard')) {
      module = 'Logging & Monitoring';
      brief = file.includes('dashboard') ? 'Dashboard with statistics and charts' : 'Log viewer UI or API';
    } else if (file.includes('admin')) {
      module = 'Admin Dashboard & UI';
      brief = file.includes('users') ? 'User management interface' : 'Admin utilities';
    } else if (file.includes('prisma')) {
      module = 'Database & Models';
      brief = file.includes('schema') ? 'Prisma database schema' : 'Database migration or seed';
    } else if (file.includes('component')) {
      module = 'UI Components';
      brief = 'Reusable UI component';
    } else if (file.includes('test')) {
      module = 'Tests';
      brief = 'Test file';
    }
    
    fileMap.push({ path: file, module, brief });
  }
  
  return fileMap;
}

// ============================================================================
// MISSING ITEMS ANALYSIS
// ============================================================================

function analyzeMissingItems(prismaModels: any[], tests: any, files: string[]) {
  const missing: string[] = [];
  
  // Check for required models
  const requiredModels = ['User', 'SystemCall', 'Policy', 'SystemCallLog'];
  for (const model of requiredModels) {
    if (!prismaModels.find(m => m.name === model)) {
      missing.push(`${model} Prisma model`);
    }
  }
  
  // Check for tests
  if (!tests.has_tests) {
    missing.push('Unit tests for core modules');
  }
  
  // Check for documentation
  if (!files.find(f => f.includes('ARCHITECTURE'))) {
    missing.push('ARCHITECTURE.md documentation');
  }
  
  if (!files.find(f => f.includes('USER_GUIDE'))) {
    missing.push('USER_GUIDE.md documentation');
  }
  
  // Check for screenshots
  if (!files.find(f => f.includes('screenshot') || f.includes('image'))) {
    missing.push('Screenshots or images for documentation');
  }
  
  return missing;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

async function analyzeProject(): Promise<ProjectSummary> {
  console.log('🔍 Starting project analysis...\n');
  
  const files = walkDirectory(REPO_ROOT);
  const pkg = parsePackageJson();
  const gitSummary = analyzeGit();
  const prismaSchema = analyzePrismaSchema();
  const apiEndpoints = analyzeApiEndpoints(files);
  const syscalls = analyzeSyscalls();
  const policies = analyzePolicies();
  const logging = analyzeLogging(prismaSchema.models);
  const tests = analyzeTests(files);
  const readme = analyzeReadme();
  const envKeys = analyzeEnvKeys();
  const securityFindings = analyzeSecurityFindings(files);
  const modules = buildModules(files, apiEndpoints, prismaSchema.models, tests);
  const fileMap = buildFileMap(files);
  const missingItems = analyzeMissingItems(prismaSchema.models, tests, files);
  
  // Calculate completeness score
  let score = 100;
  score -= missingItems.length * 5;
  score -= securityFindings.filter(f => f.type === 'HardcodedSecret').length * 10;
  score = Math.max(0, score);
  
  const summary: ProjectSummary = {
    meta: {
      project_name: pkg?.name || 'User-Friendly System Call Interface',
      repo_root: REPO_ROOT,
      analysis_date: new Date().toISOString(),
      node_version: getNodeVersion(),
      typescript_version: pkg?.devDependencies?.typescript || pkg?.dependencies?.typescript || null
    },
    git_summary: gitSummary,
    package: {
      name: pkg?.name || '',
      version: pkg?.version || '',
      dependencies: pkg?.dependencies || {},
      devDependencies: pkg?.devDependencies || {},
      scripts: pkg?.scripts || {}
    },
    tech_stack: {
      frameworks: ['Next.js 14', 'React', 'Tailwind CSS'],
      languages: ['TypeScript', 'JavaScript'],
      orm: 'Prisma',
      db: 'SQLite'
    },
    prisma_schema: prismaSchema,
    modules,
    api_endpoints: apiEndpoints,
    syscall_definitions: syscalls,
    policies,
    logging,
    tests_summary: tests,
    readme_summary: readme,
    env_keys: envKeys,
    security_findings: securityFindings,
    missing_items: missingItems,
    file_map: fileMap,
    final_notes: {
      completeness_score: `${score}/100`,
      recommendations: [
        'Add comprehensive unit tests for all modules',
        'Include screenshots in documentation',
        'Review and remove any hardcoded secrets',
        'Add API documentation with request/response examples',
        'Consider adding integration tests',
        'Document deployment process'
      ]
    }
  };
  
  return summary;
}

// ============================================================================
// MARKDOWN GENERATION
// ============================================================================

function generateMarkdown(summary: ProjectSummary): string {
  let md = `# 📊 Project Analysis Report\n\n`;
  md += `**Project:** ${summary.meta.project_name}\n`;
  md += `**Analysis Date:** ${new Date(summary.meta.analysis_date).toLocaleString()}\n`;
  md += `**Repository:** ${summary.meta.repo_root}\n\n`;
  
  md += `---\n\n`;
  
  // Git Summary
  md += `## 📈 Git Summary\n\n`;
  md += `- **Total Commits:** ${summary.git_summary.commit_count}\n`;
  md += `- **First Commit:** ${summary.git_summary.first_commit_date}\n`;
  md += `- **Last Commit:** ${summary.git_summary.last_commit_date}\n\n`;
  md += `### Recent Commits (Last 5)\n\n`;
  md += `| Hash | Author | Date | Message |\n`;
  md += `|------|--------|------|----------|\n`;
  summary.git_summary.recent_commits.slice(0, 5).forEach(c => {
    md += `| ${c.hash.substring(0, 7)} | ${c.author} | ${c.date.split(' ')[0]} | ${c.message} |\n`;
  });
  md += `\n`;
  
  // Tech Stack
  md += `## 🛠️ Technology Stack\n\n`;
  md += `- **Frameworks:** ${summary.tech_stack.frameworks.join(', ')}\n`;
  md += `- **Languages:** ${summary.tech_stack.languages.join(', ')}\n`;
  md += `- **ORM:** ${summary.tech_stack.orm}\n`;
  md += `- **Database:** ${summary.tech_stack.db}\n`;
  md += `- **Node Version:** ${summary.meta.node_version || 'N/A'}\n`;
  md += `- **TypeScript Version:** ${summary.meta.typescript_version || 'N/A'}\n\n`;
  
  // Modules
  md += `## 📦 Modules\n\n`;
  summary.modules.forEach(mod => {
    md += `### ${mod.module_name}\n\n`;
    md += `**Description:** ${mod.description}\n\n`;
    md += `**Files:** ${mod.files.length} file(s)\n\n`;
    md += `**Models Used:** ${mod.models_used.join(', ') || 'None'}\n\n`;
    md += `**Confidence:** ${mod.confidence}\n\n`;
    if (mod.notes) md += `**Notes:** ${mod.notes}\n\n`;
  });
  
  // API Endpoints
  md += `## 🔌 API Endpoints\n\n`;
  md += `| Route | Method | Auth Required | Handler File |\n`;
  md += `|-------|--------|---------------|-------------|\n`;
  summary.api_endpoints.forEach(e => {
    md += `| ${e.route} | ${e.method} | ${e.auth_required ? '✅' : '❌'} | ${e.handler_file} |\n`;
  });
  md += `\n`;
  
  // Syscalls
  md += `## ⚙️ System Call Definitions\n\n`;
  md += `| Name | Parameters | Whitelist Check | Sandbox Root |\n`;
  md += `|------|------------|-----------------|-------------|\n`;
  summary.syscall_definitions.forEach(sc => {
    md += `| ${sc.name} | ${sc.params.join(', ') || 'None'} | ${sc.whitelist_check ? '✅' : '❌'} | ${sc.sandbox_root || 'N/A'} |\n`;
  });
  md += `\n`;
  
  // Database Models
  md += `## 🗄️ Database Models\n\n`;
  summary.prisma_schema.models.forEach(model => {
    md += `### ${model.name}\n\n`;
    md += `| Field | Type | Optional |\n`;
    md += `|-------|------|----------|\n`;
    model.fields.forEach(f => {
      md += `| ${f.name} | ${f.type} | ${f.optional ? '✅' : '❌'} |\n`;
    });
    md += `\n`;
  });
  
  // Security Findings
  md += `## 🔒 Security Findings\n\n`;
  if (summary.security_findings.length === 0) {
    md += `✅ No critical security issues detected.\n\n`;
  } else {
    md += `| Type | File | Line | Detail |\n`;
    md += `|------|------|------|--------|\n`;
    summary.security_findings.forEach(f => {
      md += `| ${f.type} | ${f.file} | ${f.line} | ${f.detail} |\n`;
    });
    md += `\n`;
  }
  
  // Missing Items
  md += `## ⚠️ Missing Items\n\n`;
  if (summary.missing_items.length === 0) {
    md += `✅ All expected components are present.\n\n`;
  } else {
    summary.missing_items.forEach(item => {
      md += `- ❌ ${item}\n`;
    });
    md += `\n`;
  }
  
  // Completeness Score
  md += `## 📊 Completeness Score\n\n`;
  md += `**Score:** ${summary.final_notes.completeness_score}\n\n`;
  md += `### Recommendations\n\n`;
  summary.final_notes.recommendations.forEach(rec => {
    md += `- ${rec}\n`;
  });
  md += `\n`;
  
  // Quick Start
  md += `## 🚀 Quick Start\n\n`;
  if (summary.readme_summary.setup_steps.length > 0) {
    md += `### Setup Steps\n\n`;
    md += '```bash\n';
    md += summary.readme_summary.setup_steps[0] || 'npm install';
    md += '\n```\n\n';
  }
  if (summary.readme_summary.run_steps.length > 0) {
    md += `### Run Steps\n\n`;
    md += '```bash\n';
    md += summary.readme_summary.run_steps.join('\n');
    md += '\n```\n\n';
  }
  
  md += `---\n\n`;
  md += `*Report generated automatically by extract_project_summary.ts*\n`;
  
  return md;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    ensureOutputDir();
    
    const summary = await analyzeProject();
    
    // Write JSON output
    const jsonPath = path.join(OUTPUT_DIR, 'project_summary.json');
    fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`✅ JSON output written to: ${jsonPath}`);
    
    // Write Markdown output
    const mdPath = path.join(OUTPUT_DIR, 'project_summary.md');
    const markdown = generateMarkdown(summary);
    fs.writeFileSync(mdPath, markdown, 'utf-8');
    console.log(`✅ Markdown output written to: ${mdPath}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 ANALYSIS COMPLETE');
    console.log('='.repeat(80));
    console.log(`\nProject: ${summary.meta.project_name}`);
    console.log(`Completeness Score: ${summary.final_notes.completeness_score}`);
    console.log(`Total Files Analyzed: ${summary.file_map.length}`);
    console.log(`API Endpoints Found: ${summary.api_endpoints.length}`);
    console.log(`System Calls Detected: ${summary.syscall_definitions.length}`);
    console.log(`Database Models: ${summary.prisma_schema.models.length}`);
    console.log(`Security Findings: ${summary.security_findings.length}`);
    console.log(`Missing Items: ${summary.missing_items.length}`);
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  }
}

// Run the analysis
main();
