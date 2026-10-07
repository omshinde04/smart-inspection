import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Inspection from "@/models/Inspection";

export async function GET() {
    try {
        // 1. Authentication
        const cookieStore = await cookies();
        const token = cookieStore.get("smart_inspection_token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                { status: 401 }
            );
        }

        // 2. Verify JWT
        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        // 3. Inspector only
        if (decoded.role !== "inspector") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only inspectors can access inspector statistics",
                },
                { status: 403 }
            );
        }

        // 4. Connect database
        await connectDB();

        // 5. Get statistics for logged-in inspector only
        const stats = await Inspection.aggregate([
            {
                $match: {
                    inspector: decoded.userId,
                },
            },
            {
                $group: {
                    _id: null,

                    total: {
                        $sum: 1,
                    },

                    completed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "submitted",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    pending: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "draft",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    passed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$result",
                                        "passed",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    warning: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$result",
                                        "warning",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    failed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$result",
                                        "failed",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    total: 1,
                    completed: 1,
                    pending: 1,
                    passed: 1,
                    warning: 1,
                    failed: 1,
                },
            },
        ]);

        // 6. Return zero values when inspector has no inspections
        const result = stats[0] || {
            total: 0,
            completed: 0,
            pending: 0,
            passed: 0,
            warning: 0,
            failed: 0,
        };

        return NextResponse.json(
            {
                success: true,
                data: result,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ [Inspection Stats] Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch inspection statistics",
            },
            { status: 500 }
        );
    }
}