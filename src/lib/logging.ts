import { PrismaClient, Role, CallStatus } from "@prisma/client";

const prisma = new PrismaClient();

export interface LogEntry {
  userId: string;
  role: Role;
  syscallName: string;
  syscallId?: string;
  parameters?: any;
  status: CallStatus;
  output?: string;
  errorMessage?: string;
  clientIp?: string;
  userAgent?: string;
  executionTime?: number;
}

/**
 * Log a system call execution
 */
export async function logSystemCall(entry: LogEntry) {
  try {
    // Sanitize sensitive parameters before logging
    const sanitizedParams = entry.parameters
      ? JSON.stringify(sanitizeParameters(entry.parameters))
      : null;

    // Truncate output if too long
    const truncatedOutput = entry.output
      ? entry.output.substring(0, 5000)
      : null;

    await prisma.systemCallLog.create({
      data: {
        userId: entry.userId,
        role: entry.role,
        syscallName: entry.syscallName,
        syscallId: entry.syscallId,
        parameters: sanitizedParams,
        status: entry.status,
        output: truncatedOutput,
        errorMessage: entry.errorMessage,
        clientIp: entry.clientIp,
        userAgent: entry.userAgent,
        executionTime: entry.executionTime,
      },
    });
  } catch (error) {
    console.error("Failed to log system call:", error);
    // Don't throw - logging failures shouldn't break the application
  }
}

/**
 * Log a login attempt
 */
export async function logLoginAttempt(
  email: string,
  successful: boolean,
  ipAddress: string,
  userAgent?: string,
  userId?: string
) {
  try {
    await prisma.loginAttempt.create({
      data: {
        email,
        successful,
        ipAddress,
        userAgent,
        userId,
      },
    });
  } catch (error) {
    console.error("Failed to log login attempt:", error);
  }
}

/**
 * Check if IP is rate-limited for login attempts
 */
export async function checkLoginRateLimit(
  email: string,
  ipAddress: string
): Promise<{ allowed: boolean; reason?: string }> {
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5");
  const timeoutMinutes = parseInt(process.env.LOGIN_TIMEOUT_MINUTES || "15");
  
  const timeThreshold = new Date(Date.now() - timeoutMinutes * 60 * 1000);
  
  // Check failed attempts by email
  const emailAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      successful: false,
      timestamp: { gte: timeThreshold },
    },
  });
  
  if (emailAttempts >= maxAttempts) {
    return {
      allowed: false,
      reason: `Too many failed login attempts. Please try again in ${timeoutMinutes} minutes.`,
    };
  }
  
  // Check failed attempts by IP
  const ipAttempts = await prisma.loginAttempt.count({
    where: {
      ipAddress,
      successful: false,
      timestamp: { gte: timeThreshold },
    },
  });
  
  if (ipAttempts >= maxAttempts * 2) {
    return {
      allowed: false,
      reason: `Too many failed login attempts from this IP. Please try again in ${timeoutMinutes} minutes.`,
    };
  }
  
  return { allowed: true };
}

/**
 * Get system call logs with filters
 */
export async function getSystemCallLogs(filters: {
  userId?: string;
  syscallName?: string;
  role?: Role;
  status?: CallStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  
  if (filters.userId) where.userId = filters.userId;
  if (filters.syscallName) where.syscallName = filters.syscallName;
  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;
  
  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = filters.startDate;
    if (filters.endDate) where.timestamp.lte = filters.endDate;
  }
  
  const [logs, total] = await Promise.all([
    prisma.systemCallLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    prisma.systemCallLog.count({ where }),
  ]);
  
  return { logs, total };
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(userId?: string) {
  const where = userId ? { userId } : {};
  
  const [
    totalCalls,
    successfulCalls,
    deniedCalls,
    errorCalls,
    callsByRole,
    callsBySyscall,
    recentLogs,
  ] = await Promise.all([
    prisma.systemCallLog.count({ where }),
    prisma.systemCallLog.count({ where: { ...where, status: "SUCCESS" } }),
    prisma.systemCallLog.count({ where: { ...where, status: "DENIED" } }),
    prisma.systemCallLog.count({ where: { ...where, status: "ERROR" } }),
    
    prisma.systemCallLog.groupBy({
      by: ["role"],
      where,
      _count: { role: true },
    }),
    
    prisma.systemCallLog.groupBy({
      by: ["syscallName"],
      where,
      _count: { syscallName: true },
      orderBy: { _count: { syscallName: "desc" } },
      take: 10,
    }),
    
    prisma.systemCallLog.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    }),
  ]);
  
  return {
    totalCalls,
    successfulCalls,
    deniedCalls,
    errorCalls,
    callsByRole: callsByRole.map((r) => ({
      role: r.role,
      count: r._count.role,
    })),
    callsBySyscall: callsBySyscall.map((s) => ({
      syscall: s.syscallName,
      count: s._count.syscallName,
    })),
    recentLogs,
  };
}

/**
 * Sanitize parameters to remove sensitive data before logging
 */
function sanitizeParameters(params: any): any {
  if (!params || typeof params !== "object") {
    return params;
  }
  
  const sanitized = { ...params };
  
  // Remove sensitive fields
  const sensitiveFields = ["password", "token", "secret", "key", "apiKey"];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }
  
  // Truncate long content
  if (sanitized.content && sanitized.content.length > 500) {
    sanitized.content = sanitized.content.substring(0, 500) + "... [truncated]";
  }
  
  return sanitized;
}

/**
 * Clean up old logs (optional maintenance function)
 */
export async function cleanupOldLogs(daysToKeep: number = 90) {
  const threshold = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  const deleted = await prisma.systemCallLog.deleteMany({
    where: {
      timestamp: { lt: threshold },
    },
  });
  
  return { deletedCount: deleted.count };
}
