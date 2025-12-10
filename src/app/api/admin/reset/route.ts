import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Delete all logs
    await prisma.systemCallLog.deleteMany({});
    await prisma.loginAttempt.deleteMany({});

    // Delete all users except admin
    await prisma.user.deleteMany({
      where: {
        role: {
          not: "ADMIN",
        },
      },
    });

    // Reset admin password to default
    const hashedPassword = await hashPassword("admin123");
    await prisma.user.updateMany({
      where: { role: "ADMIN" },
      data: {
        password: hashedPassword,
        name: "Admin User",
      },
    });

    // Recreate default users
    const powerUserPassword = await hashPassword("power123");
    const viewerPassword = await hashPassword("viewer123");

    await prisma.user.createMany({
      data: [
        {
          email: "power@syscall.local",
          name: "Power User",
          password: powerUserPassword,
          role: "POWER_USER",
        },
        {
          email: "viewer@syscall.local",
          name: "Viewer User",
          password: viewerPassword,
          role: "VIEWER",
        },
      ],
    });

    // Reset policies to defaults
    await prisma.policy.deleteMany({});

    // Get all system calls
    const systemCalls = await prisma.systemCall.findMany();

    // Create default policies
    const policies = [];
    for (const syscall of systemCalls) {
      const allowedRoles = JSON.parse(syscall.allowedRoles);

      for (const role of ["ADMIN", "POWER_USER", "VIEWER"]) {
        policies.push({
          role,
          systemCallId: syscall.id,
          allowed: allowedRoles.includes(role),
          maxExecutions: role === "VIEWER" ? 10 : null,
        });
      }
    }

    await prisma.policy.createMany({
      data: policies,
    });

    return NextResponse.json({
      success: true,
      message: "Database reset successfully. All logs cleared, users reset to defaults.",
    });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset database" },
      { status: 500 }
    );
  }
}
