import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET() {
    try {
        console.log("👤 [ME] Checking authenticated user");

        // Get cookies
        const cookieStore = await cookies();

        const token = cookieStore.get(
            "smart_inspection_token"
        )?.value;

        // No token
        if (!token) {
            console.log("❌ [ME] No authentication token found");

            return NextResponse.json(
                {
                    success: false,
                    message: "Not authenticated",
                },
                { status: 401 }
            );
        }

        // Verify JWT
        const decoded = verifyToken(token);

        if (!decoded) {
            console.log("❌ [ME] Invalid or expired token");

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        await connectDB();

        // Find user
        const user = await User.findById(decoded.userId).select(
            "-password"
        );

        if (!user) {
            console.log("❌ [ME] User not found");

            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        console.log(
            `✅ [ME] Authenticated user: ${user.email}`
        );

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ [ME] Authentication check failed");
        console.error("   └─", error.message);

        return NextResponse.json(
            {
                success: false,
                message: "Authentication check failed",
            },
            { status: 500 }
        );
    }
}