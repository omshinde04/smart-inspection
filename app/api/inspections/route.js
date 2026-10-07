import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Inspection from "@/models/Inspection";

export async function POST(request) {
    try {
        console.log("📝 [INSPECTION CREATE] Request received");

        // --------------------------------------------------
        // 1. Get authentication token
        // --------------------------------------------------

        const cookieStore = await cookies();

        const token = cookieStore.get(
            "smart_inspection_token"
        )?.value;

        if (!token) {
            console.log(
                "❌ [INSPECTION CREATE] Authentication token missing"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 2. Verify JWT
        // --------------------------------------------------

        const decoded = verifyToken(token);

        if (!decoded) {
            console.log(
                "❌ [INSPECTION CREATE] Invalid or expired token"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired authentication token",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 3. Connect to database
        // --------------------------------------------------

        await connectDB();

        // --------------------------------------------------
        // 4. Verify user exists
        // --------------------------------------------------

        const user = await User.findById(decoded.userId).select(
            "_id name email role"
        );

        if (!user) {
            console.log(
                "❌ [INSPECTION CREATE] Authenticated user not found"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "User account not found",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 5. Verify inspector role
        // --------------------------------------------------

        if (user.role !== "inspector") {
            console.log(
                `🚫 [INSPECTION CREATE] Unauthorized role: ${user.role}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Only inspectors can create inspections",
                },
                { status: 403 }
            );
        }

        // --------------------------------------------------
        // 6. Read request body
        // --------------------------------------------------

        let body;

        try {
            body = await request.json();
        } catch (error) {
            console.log(
                "❌ [INSPECTION CREATE] Invalid JSON body"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request body",
                },
                { status: 400 }
            );
        }

        const {
            assetName,
            location,
            inspectionType,
            inspectedAt,
        } = body;

        // --------------------------------------------------
        // 7. Validate asset name
        // --------------------------------------------------

        if (
            typeof assetName !== "string" ||
            assetName.trim().length < 2
        ) {
            console.log(
                "❌ [INSPECTION CREATE] Invalid asset name"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Asset name must be at least 2 characters",
                },
                { status: 400 }
            );
        }

        if (assetName.trim().length > 150) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Asset name cannot exceed 150 characters",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 8. Validate inspection type
        // --------------------------------------------------

        if (
            typeof inspectionType !== "string" ||
            inspectionType.trim().length < 2
        ) {
            console.log(
                "❌ [INSPECTION CREATE] Invalid inspection type"
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Inspection type must be at least 2 characters",
                },
                { status: 400 }
            );
        }

        if (inspectionType.trim().length > 100) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Inspection type cannot exceed 100 characters",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 9. Validate location
        // --------------------------------------------------

        if (!location || typeof location !== "object") {
            console.log(
                "❌ [INSPECTION CREATE] Location missing"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Location is required",
                },
                { status: 400 }
            );
        }

        const latitude = Number(location.latitude);
        const longitude = Number(location.longitude);

        if (
            !Number.isFinite(latitude) ||
            latitude < -90 ||
            latitude > 90
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid latitude",
                },
                { status: 400 }
            );
        }

        if (
            !Number.isFinite(longitude) ||
            longitude < -180 ||
            longitude > 180
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid longitude",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 10. Validate inspection time
        // --------------------------------------------------

        let inspectionDate;

        if (inspectedAt === undefined || inspectedAt === null) {
            inspectionDate = new Date();
        } else {
            inspectionDate = new Date(inspectedAt);

            if (Number.isNaN(inspectionDate.getTime())) {
                console.log(
                    "❌ [INSPECTION CREATE] Invalid inspection date"
                );

                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid inspection date",
                    },
                    { status: 400 }
                );
            }

            // Prevent obviously future inspection timestamps.
            const now = Date.now();
            const allowedFutureTime = 5 * 60 * 1000;

            if (
                inspectionDate.getTime() >
                now + allowedFutureTime
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Inspection time cannot be in the future",
                    },
                    { status: 400 }
                );
            }
        }

        // --------------------------------------------------
        // 11. Create inspection
        // --------------------------------------------------

        const inspection = await Inspection.create({
            assetName: assetName.trim(),

            location: {
                latitude,
                longitude,
            },

            inspectionType: inspectionType.trim(),

            inspectedAt: inspectionDate,

            inspector: user._id,

            status: "draft",

            result: "pending",

            checklist: [],

            evidence: [],

            remarks: "",
        });

        console.log(
            `✅ [INSPECTION CREATE] Inspection created: ${inspection._id}`
        );

        // --------------------------------------------------
        // 12. Response
        // --------------------------------------------------

        return NextResponse.json(
            {
                success: true,
                message: "Inspection created successfully",

                inspection: {
                    id: inspection._id,
                    assetName: inspection.assetName,
                    location: inspection.location,
                    inspectionType: inspection.inspectionType,
                    inspectedAt: inspection.inspectedAt,
                    status: inspection.status,
                    result: inspection.result,
                    inspector: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                    },
                    createdAt: inspection.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "❌ [INSPECTION CREATE] Failed"
        );
        console.error("   └─", error.message);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create inspection",
            },
            { status: 500 }
        );
    }
}

//get inspsections Api

export async function GET(request) {
    try {
        console.log("📋 [INSPECTION LIST] Request received");

        // --------------------------------------------------
        // 1. Get authentication token
        // --------------------------------------------------

        const cookieStore = await cookies();

        const token = cookieStore.get(
            "smart_inspection_token"
        )?.value;

        if (!token) {
            console.log(
                "❌ [INSPECTION LIST] Authentication token missing"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 2. Verify JWT
        // --------------------------------------------------

        const decoded = verifyToken(token);

        if (!decoded) {
            console.log(
                "❌ [INSPECTION LIST] Invalid or expired token"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired authentication token",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 3. Connect to database
        // --------------------------------------------------

        await connectDB();

        // --------------------------------------------------
        // 4. Verify user
        // --------------------------------------------------

        const user = await User.findById(decoded.userId).select(
            "_id name email role"
        );

        if (!user) {
            console.log(
                "❌ [INSPECTION LIST] User not found"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "User account not found",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 5. Verify inspector role
        // --------------------------------------------------

        if (user.role !== "inspector") {
            console.log(
                `🚫 [INSPECTION LIST] Unauthorized role: ${user.role}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only inspectors can access their inspections",
                },
                { status: 403 }
            );
        }

        // --------------------------------------------------
        // 6. Read query parameters
        // --------------------------------------------------

        const { searchParams } = new URL(request.url);

        const pageParam = searchParams.get("page");
        const limitParam = searchParams.get("limit");

        const search = searchParams.get("search")?.trim();
        const status = searchParams.get("status");
        const result = searchParams.get("result");

        const from = searchParams.get("from");
        const to = searchParams.get("to");

        // --------------------------------------------------
        // 7. Pagination validation
        // --------------------------------------------------

        let page = Number.parseInt(pageParam || "1", 10);
        let limit = Number.parseInt(limitParam || "10", 10);

        if (!Number.isInteger(page) || page < 1) {
            page = 1;
        }

        if (!Number.isInteger(limit) || limit < 1) {
            limit = 10;
        }

        // Production safety limit
        if (limit > 50) {
            limit = 50;
        }

        const skip = (page - 1) * limit;

        // --------------------------------------------------
        // 8. Build secure query
        // --------------------------------------------------

        const query = {
            // Critical ownership protection
            inspector: user._id,
        };

        // --------------------------------------------------
        // 9. Status filter
        // --------------------------------------------------

        if (status) {
            const allowedStatuses = [
                "draft",
                "submitted",
            ];

            if (!allowedStatuses.includes(status)) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Invalid status filter",
                    },
                    { status: 400 }
                );
            }

            query.status = status;
        }

        // --------------------------------------------------
        // 10. Result filter
        // --------------------------------------------------

        if (result) {
            const allowedResults = [
                "pending",
                "passed",
                "warning",
                "failed",
            ];

            if (!allowedResults.includes(result)) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Invalid result filter",
                    },
                    { status: 400 }
                );
            }

            query.result = result;
        }

        // --------------------------------------------------
        // 11. Search filter
        // --------------------------------------------------

        if (search) {
            if (search.length > 100) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Search query is too long",
                    },
                    { status: 400 }
                );
            }

            // Escape regex special characters
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            query.assetName = {
                $regex: escapedSearch,
                $options: "i",
            };
        }

        // --------------------------------------------------
        // 12. Date filter
        // --------------------------------------------------

        if (from || to) {
            query.inspectedAt = {};

            if (from) {
                const fromDate = new Date(`${from}T00:00:00.000Z`);

                if (Number.isNaN(fromDate.getTime())) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Invalid from date",
                        },
                        { status: 400 }
                    );
                }

                query.inspectedAt.$gte = fromDate;
            }

            if (to) {
                const toDate = new Date(`${to}T23:59:59.999Z`);

                if (Number.isNaN(toDate.getTime())) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Invalid to date",
                        },
                        { status: 400 }
                    );
                }

                query.inspectedAt.$lte = toDate;
            }

            if (
                query.inspectedAt.$gte &&
                query.inspectedAt.$lte &&
                query.inspectedAt.$gte >
                query.inspectedAt.$lte
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "From date cannot be after to date",
                    },
                    { status: 400 }
                );
            }
        }

        // --------------------------------------------------
        // 13. Get total count + paginated data
        // --------------------------------------------------

        const [total, inspections] = await Promise.all([
            Inspection.countDocuments(query),

            Inspection.find(query)
                .select(
                    "assetName location inspectionType inspectedAt submittedAt status result evidence createdAt updatedAt"
                )
                .sort({
                    inspectedAt: -1,
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);

        // --------------------------------------------------
        // 14. Pagination calculations
        // --------------------------------------------------

        const totalPages =
            total === 0
                ? 0
                : Math.ceil(total / limit);

        // --------------------------------------------------
        // 15. Response
        // --------------------------------------------------

        console.log(
            `✅ [INSPECTION LIST] Returned ${inspections.length} inspections`
        );

        return NextResponse.json(
            {
                success: true,

                inspections,

                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage:
                        totalPages > 0 &&
                        page < totalPages,
                    hasPreviousPage:
                        page > 1 && totalPages > 0,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "❌ [INSPECTION LIST] Failed"
        );
        console.error("   └─", error.message);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch inspections",
            },
            { status: 500 }
        );
    }
}

//API #3 — Get Single Inspection