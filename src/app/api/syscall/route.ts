import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { checkPolicy } from "@/lib/policies";
import { executeSyscall, syscallSchemas } from "@/lib/syscalls";
import { logSystemCall } from "@/lib/logging";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { syscallName, parameters } = body;

    if (!syscallName) {
      return NextResponse.json(
        { error: "System call name is required" },
        { status: 400 }
      );
    }

    // Get system call details
    const systemCall = await prisma.systemCall.findUnique({
      where: { name: syscallName },
    });

    if (!systemCall) {
      await logSystemCall({
        userId: session.user.id,
        role: session.user.role as any,
        syscallName,
        status: "ERROR",
        errorMessage: "System call not found",
        clientIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || undefined,
      });

      return NextResponse.json(
        { error: "System call not found" },
        { status: 404 }
      );
    }

    // Check policy
    const policyCheck = await checkPolicy(session.user.role as any, syscallName);
    
    if (!policyCheck.allowed) {
      await logSystemCall({
        userId: session.user.id,
        role: session.user.role as any,
        syscallName,
        syscallId: systemCall.id,
        parameters,
        status: "DENIED",
        errorMessage: policyCheck.reason,
        clientIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || undefined,
      });

      return NextResponse.json(
        { error: policyCheck.reason || "Access denied" },
        { status: 403 }
      );
    }

    // Validate parameters
    const schema = syscallSchemas[syscallName as keyof typeof syscallSchemas];
    if (schema) {
      const validation = schema.safeParse(parameters);
      if (!validation.success) {
        await logSystemCall({
          userId: session.user.id,
          role: session.user.role as any,
          syscallName,
          syscallId: systemCall.id,
          parameters,
          status: "ERROR",
          errorMessage: `Validation error: ${validation.error.message}`,
          clientIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          userAgent: req.headers.get("user-agent") || undefined,
        });

        return NextResponse.json(
          { error: "Invalid parameters", details: validation.error.errors },
          { status: 400 }
        );
      }
    }

    // Execute system call
    const startTime = Date.now();
    const result = await executeSyscall(syscallName, parameters || {});
    const executionTime = Date.now() - startTime;

    // Log the execution
    await logSystemCall({
      userId: session.user.id,
      role: session.user.role as any,
      syscallName,
      syscallId: systemCall.id,
      parameters,
      status: result.success ? "SUCCESS" : "ERROR",
      output: result.success ? JSON.stringify(result.data) : undefined,
      errorMessage: result.success ? undefined : result.error,
      clientIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || undefined,
      executionTime,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        executionTime,
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("System call API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all available system calls for user's role
    const systemCalls = await prisma.systemCall.findMany({
      where: { enabled: true },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        requiresParams: true,
        allowedRoles: true,
      },
    });

    // Filter by user's role
    const availableCalls = systemCalls.filter((call) => {
      try {
        const allowedRoles = JSON.parse(call.allowedRoles);
        return allowedRoles.includes(session.user.role);
      } catch {
        return false;
      }
    });

    return NextResponse.json({ syscalls: availableCalls });
  } catch (error: any) {
    console.error("Get system calls error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
