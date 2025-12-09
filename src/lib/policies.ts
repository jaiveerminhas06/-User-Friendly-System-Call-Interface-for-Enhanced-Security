import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Check if a user's role is allowed to execute a specific system call
 */
export async function checkPolicy(
  role: Role,
  syscallName: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Find the system call
    const systemCall = await prisma.systemCall.findUnique({
      where: { name: syscallName },
      include: { policies: true },
    });

    if (!systemCall) {
      return { allowed: false, reason: "System call not found" };
    }

    if (!systemCall.enabled) {
      return { allowed: false, reason: "System call is disabled" };
    }

    // Check if role is in allowedRoles
    let allowedRoles: string[] = [];
    try {
      allowedRoles = JSON.parse(systemCall.allowedRoles);
    } catch (e) {
      allowedRoles = [];
    }

    if (!allowedRoles.includes(role)) {
      return { allowed: false, reason: "Insufficient permissions for this system call" };
    }

    // Check specific policy
    const policy = systemCall.policies.find((p) => p.role === role);
    
    if (policy && !policy.allowed) {
      return { allowed: false, reason: "Policy denies access" };
    }

    // Check rate limiting if policy has maxExecutions
    if (policy?.maxExecutions) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentExecutions = await prisma.systemCallLog.count({
        where: {
          role,
          syscallName,
          timestamp: { gte: oneHourAgo },
          status: "SUCCESS",
        },
      });

      if (recentExecutions >= policy.maxExecutions) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${policy.maxExecutions} executions per hour`,
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error("Policy check error:", error);
    return { allowed: false, reason: "Policy check failed" };
  }
}

/**
 * Get all policies for a specific role
 */
export async function getPoliciesForRole(role: Role) {
  return await prisma.policy.findMany({
    where: { role },
    include: { systemCall: true },
  });
}

/**
 * Create or update a policy
 */
export async function upsertPolicy(
  role: Role,
  systemCallId: string,
  allowed: boolean,
  maxExecutions?: number | null
) {
  return await prisma.policy.upsert({
    where: {
      role_systemCallId: {
        role,
        systemCallId,
      },
    },
    create: {
      role,
      systemCallId,
      allowed,
      maxExecutions,
    },
    update: {
      allowed,
      maxExecutions,
    },
  });
}

/**
 * Delete a policy
 */
export async function deletePolicy(role: Role, systemCallId: string) {
  return await prisma.policy.delete({
    where: {
      role_systemCallId: {
        role,
        systemCallId,
      },
    },
  });
}

/**
 * Get all available system calls with their policies
 */
export async function getAllSystemCallsWithPolicies() {
  return await prisma.systemCall.findMany({
    include: {
      policies: true,
      _count: {
        select: { logs: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Toggle system call enabled status
 */
export async function toggleSystemCall(id: string, enabled: boolean) {
  return await prisma.systemCall.update({
    where: { id },
    data: { enabled },
  });
}

/**
 * Initialize default system calls and policies
 */
export async function initializeDefaultPolicies() {
  const systemCalls = [
    {
      name: "listDirectory",
      description: "List contents of a directory",
      category: "FILE_SYSTEM",
      allowedRoles: JSON.stringify(["ADMIN", "POWER_USER", "VIEWER"]),
      requiresParams: true,
    },
    {
      name: "readFile",
      description: "Read contents of a file",
      category: "FILE_SYSTEM",
      allowedRoles: JSON.stringify(["ADMIN", "POWER_USER", "VIEWER"]),
      requiresParams: true,
    },
    {
      name: "writeFile",
      description: "Write data to a file",
      category: "FILE_SYSTEM",
      allowedRoles: JSON.stringify(["ADMIN", "POWER_USER"]),
      requiresParams: true,
    },
    {
      name: "deleteFile",
      description: "Delete a file",
      category: "FILE_SYSTEM",
      allowedRoles: JSON.stringify(["ADMIN"]),
      requiresParams: true,
    },
    {
      name: "getSystemInfo",
      description: "Get system information (CPU, memory, OS)",
      category: "SYSTEM_INFO",
      allowedRoles: JSON.stringify(["ADMIN", "POWER_USER", "VIEWER"]),
      requiresParams: false,
    },
    {
      name: "listProcesses",
      description: "List running processes",
      category: "PROCESS",
      allowedRoles: JSON.stringify(["ADMIN", "POWER_USER"]),
      requiresParams: false,
    },
    {
      name: "runSafeCommand",
      description: "Run a whitelisted system command",
      category: "PROCESS",
      allowedRoles: JSON.stringify(["ADMIN"]),
      requiresParams: true,
    },
  ];

  for (const syscall of systemCalls) {
    await prisma.systemCall.upsert({
      where: { name: syscall.name },
      create: syscall,
      update: syscall,
    });
  }

  console.log("Default system calls initialized");
}
