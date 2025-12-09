import { promises as fs } from "fs";
import * as path from "path";
import * as os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";

const execAsync = promisify(exec);

// Safe root directory for file operations
const SAFE_ROOT = process.env.SAFE_ROOT_DIR || "./safe-root";

// Whitelisted commands for runSafeCommand
const WHITELISTED_COMMANDS = ["dir", "echo", "date", "time"];

/**
 * Initialize safe root directory
 */
export async function initializeSafeRoot() {
  try {
    await fs.mkdir(SAFE_ROOT, { recursive: true });
    console.log(`Safe root directory initialized at: ${SAFE_ROOT}`);
  } catch (error) {
    console.error("Failed to initialize safe root:", error);
  }
}

/**
 * Validate and sanitize file paths to prevent directory traversal
 */
export function sanitizePath(userPath: string): string {
  // Remove any directory traversal attempts
  const cleaned = userPath.replace(/\.\./g, "").replace(/\\/g, "/");
  
  // Resolve to absolute path within safe root
  const safePath = path.resolve(SAFE_ROOT, cleaned);
  const safeRootResolved = path.resolve(SAFE_ROOT);
  
  // Ensure the path is within safe root
  if (!safePath.startsWith(safeRootResolved)) {
    throw new Error("Invalid path: Access denied outside safe directory");
  }
  
  return safePath;
}

/**
 * Validation schemas for system call parameters
 */
export const syscallSchemas = {
  listDirectory: z.object({
    path: z.string().min(1, "Path is required"),
  }),
  
  readFile: z.object({
    path: z.string().min(1, "Path is required"),
  }),
  
  writeFile: z.object({
    path: z.string().min(1, "Path is required"),
    content: z.string(),
  }),
  
  deleteFile: z.object({
    path: z.string().min(1, "Path is required"),
  }),
  
  runSafeCommand: z.object({
    command: z.string().min(1, "Command is required"),
  }),
};

/**
 * System Call Implementations
 */

export async function listDirectory(userPath: string = "/"): Promise<any> {
  const safePath = sanitizePath(userPath);
  
  try {
    // Check if path exists
    await fs.access(safePath);
    
    // Read directory
    const entries = await fs.readdir(safePath, { withFileTypes: true });
    
    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(safePath, entry.name);
        const stats = await fs.stat(fullPath);
        
        return {
          name: entry.name,
          type: entry.isDirectory() ? "directory" : "file",
          size: stats.size,
          modified: stats.mtime,
          permissions: stats.mode,
        };
      })
    );
    
    return {
      path: userPath,
      items,
      count: items.length,
    };
  } catch (error: any) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }
}

export async function readFile(userPath: string): Promise<any> {
  const safePath = sanitizePath(userPath);
  
  try {
    const content = await fs.readFile(safePath, "utf-8");
    const stats = await fs.stat(safePath);
    
    return {
      path: userPath,
      content,
      size: stats.size,
      modified: stats.mtime,
    };
  } catch (error: any) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

export async function writeFile(userPath: string, content: string): Promise<any> {
  const safePath = sanitizePath(userPath);
  
  try {
    // Ensure parent directory exists
    await fs.mkdir(path.dirname(safePath), { recursive: true });
    
    // Write file
    await fs.writeFile(safePath, content, "utf-8");
    const stats = await fs.stat(safePath);
    
    return {
      path: userPath,
      size: stats.size,
      message: "File written successfully",
    };
  } catch (error: any) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

export async function deleteFile(userPath: string): Promise<any> {
  const safePath = sanitizePath(userPath);
  
  try {
    const stats = await fs.stat(safePath);
    
    if (stats.isDirectory()) {
      throw new Error("Cannot delete directories with deleteFile");
    }
    
    await fs.unlink(safePath);
    
    return {
      path: userPath,
      message: "File deleted successfully",
    };
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

export async function getSystemInfo(): Promise<any> {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    return {
      platform: os.platform(),
      architecture: os.arch(),
      hostname: os.hostname(),
      osType: os.type(),
      osRelease: os.release(),
      cpuCount: cpus.length,
      cpuModel: cpus[0]?.model || "Unknown",
      totalMemory: totalMem,
      freeMemory: freeMem,
      usedMemory: totalMem - freeMem,
      memoryUsagePercent: ((totalMem - freeMem) / totalMem * 100).toFixed(2),
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
    };
  } catch (error: any) {
    throw new Error(`Failed to get system info: ${error.message}`);
  }
}

export async function listProcesses(): Promise<any> {
  try {
    let command: string;
    
    if (os.platform() === "win32") {
      command = 'tasklist /fo csv /nh';
    } else {
      command = 'ps aux';
    }
    
    const { stdout } = await execAsync(command);
    
    // Parse output (simplified)
    const lines = stdout.trim().split("\n").slice(0, 20); // Limit to 20 processes
    
    return {
      platform: os.platform(),
      processCount: lines.length,
      processes: lines.map((line, index) => ({
        id: index + 1,
        info: line.substring(0, 100), // Truncate for safety
      })),
      message: "Process list retrieved (limited to 20 entries)",
    };
  } catch (error: any) {
    throw new Error(`Failed to list processes: ${error.message}`);
  }
}

export async function runSafeCommand(command: string): Promise<any> {
  try {
    // Extract command name (first word)
    const cmdName = command.trim().split(" ")[0].toLowerCase();
    
    // Check if command is whitelisted
    if (!WHITELISTED_COMMANDS.includes(cmdName)) {
      throw new Error(
        `Command not whitelisted. Allowed commands: ${WHITELISTED_COMMANDS.join(", ")}`
      );
    }
    
    // Execute command with timeout
    const { stdout, stderr } = await execAsync(command, {
      timeout: 5000, // 5 second timeout
      maxBuffer: 1024 * 100, // 100KB max output
    });
    
    return {
      command,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      message: "Command executed successfully",
    };
  } catch (error: any) {
    throw new Error(`Command execution failed: ${error.message}`);
  }
}

/**
 * Main system call executor
 */
export async function executeSyscall(
  syscallName: string,
  params: any
): Promise<any> {
  const startTime = Date.now();
  
  try {
    let result: any;
    
    switch (syscallName) {
      case "listDirectory":
        result = await listDirectory(params.path);
        break;
      
      case "readFile":
        result = await readFile(params.path);
        break;
      
      case "writeFile":
        result = await writeFile(params.path, params.content);
        break;
      
      case "deleteFile":
        result = await deleteFile(params.path);
        break;
      
      case "getSystemInfo":
        result = await getSystemInfo();
        break;
      
      case "listProcesses":
        result = await listProcesses();
        break;
      
      case "runSafeCommand":
        result = await runSafeCommand(params.command);
        break;
      
      default:
        throw new Error(`Unknown system call: ${syscallName}`);
    }
    
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      data: result,
      executionTime,
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error.message,
      executionTime,
    };
  }
}
