import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Inspection from "@/models/Inspection";

export async function GET(request) {
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
                        "Only inspectors can access recent inspections",
                },
                { status: 403 }
            );
        }

        // 4. Read limit
        const { searchParams } = new URL(request.url);

        const requestedLimit = Number(
            searchParams.get("limit") || 5
        );

        const limit = Math.min(
            Math.max(
                Number.isInteger(requestedLimit)
                    ? requestedLimit
                    : 5,
                1
            ),
            20
        );

        // 5. Connect database
        await connectDB();

        // 6. Fetch latest inspections belonging to inspector
        const inspections = await Inspection.find({
            inspector: decoded.userId,
        })
            .sort({
                inspectedAt: -1,
            })
            .limit(limit)
            .select(
                "assetName inspectionType status result inspectedAt submittedAt createdAt"
            )
            .lean();

        // 7. Format response
        const formattedInspections = inspections.map(
            (inspection) => ({
                id: inspection._id,
                assetName: inspection.assetName,
                inspectionType: inspection.inspectionType,
                status: inspection.status,
                result: inspection.result,
                inspectedAt: inspection.inspectedAt,
                submittedAt: inspection.submittedAt,
                createdAt: inspection.createdAt,
            })
        );

        return NextResponse.json(
            {
                success: true,
                data: formattedInspections,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ [Recent Inspections] Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch recent inspections",
            },
            { status: 500 }
        );
    }
}