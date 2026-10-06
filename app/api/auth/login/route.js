import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { createToken } from "@/lib/auth";

export async function POST(request) {
    try {
        console.log("🔐 [LOGIN] Login request received");

        const body = await request.json();

        const { email, password } = body;

        // Validate fields
        if (!email || !password) {
            console.log("❌ [LOGIN] Missing email or password");

            return NextResponse.json(
                {
                    success: false,
                    message: "Email and password are required",
                },
                { status: 400 }
            );
        }

        await connectDB();

        const normalizedEmail = email.toLowerCase().trim();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            console.log(
                `❌ [LOGIN] User not found: ${normalizedEmail}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 }
            );
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            console.log(
                `❌ [LOGIN] Invalid password: ${normalizedEmail}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 }
            );
        }

        // Create JWT
        const token = createToken(user);

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 200 }
        );

        // Store JWT in HTTP-only cookie
        response.cookies.set("smart_inspection_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        console.log(
            `✅ [LOGIN] Login successful: ${user.email}`
        );

        return response;
    } catch (error) {
        console.error("❌ [LOGIN] Login failed");
        console.error("   └─", error.message);

        return NextResponse.json(
            {
                success: false,
                message: "Login failed",
            },
            { status: 500 }
        );
    }
}