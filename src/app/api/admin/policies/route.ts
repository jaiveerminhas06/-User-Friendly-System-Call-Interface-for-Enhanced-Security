import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  getAllSystemCallsWithPolicies, 
  upsertPolicy, 
  toggleSystemCall 
} from "@/lib/policies";
import { Role } from "@prisma/client";
import { z } from "zod";

const policySchema = z.object({
  role: z.enum(["ADMIN", "POWER_USER", "VIEWER"]),
  systemCallId: z.string(),
  allowed: z.boolean(),
  maxExecutions: z.number().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get all system calls with policies
    const systemCalls = await getAllSystemCallsWithPolicies();

    return NextResponse.json({ systemCalls });
  } catch (error: any) {
    console.error("Get policies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validation = policySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { role, systemCallId, allowed, maxExecutions } = validation.data;

    // Create or update policy
    const policy = await upsertPolicy(
      role as Role,
      systemCallId,
      allowed,
      maxExecutions
    );

    return NextResponse.json({ policy });
  } catch (error: any) {
    console.error("Create/update policy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { systemCallId, enabled } = body;

    if (!systemCallId || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "systemCallId and enabled status are required" },
        { status: 400 }
      );
    }

    // Toggle system call
    const systemCall = await toggleSystemCall(systemCallId, enabled);

    return NextResponse.json({ systemCall });
  } catch (error: any) {
    console.error("Toggle system call error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
