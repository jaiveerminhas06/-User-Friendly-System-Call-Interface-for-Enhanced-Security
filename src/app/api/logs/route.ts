import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemCallLogs } from "@/lib/logging";
import { CallStatus, Role } from "@prisma/client";

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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    
    const filters: any = {
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    // Non-admin users can only see their own logs
    if (session.user.role !== "ADMIN") {
      filters.userId = session.user.id;
    } else {
      // Admin can filter by user
      if (searchParams.get("userId")) {
        filters.userId = searchParams.get("userId")!;
      }
    }

    if (searchParams.get("syscallName")) {
      filters.syscallName = searchParams.get("syscallName")!;
    }

    if (searchParams.get("role")) {
      filters.role = searchParams.get("role") as Role;
    }

    if (searchParams.get("status")) {
      filters.status = searchParams.get("status") as CallStatus;
    }

    if (searchParams.get("startDate")) {
      filters.startDate = new Date(searchParams.get("startDate")!);
    }

    if (searchParams.get("endDate")) {
      filters.endDate = new Date(searchParams.get("endDate")!);
    }

    // Get logs
    const result = await getSystemCallLogs(filters);

    return NextResponse.json({
      logs: result.logs,
      total: result.total,
      page: Math.floor(filters.offset / filters.limit) + 1,
      totalPages: Math.ceil(result.total / filters.limit),
    });
  } catch (error: any) {
    console.error("Get logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
