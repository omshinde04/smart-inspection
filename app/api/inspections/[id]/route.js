import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Inspection from "@/models/Inspection";

export async function GET(request, { params }) {
    try {
        console.log("🔎 [INSPECTION DETAILS] Request received");

        // --------------------------------------------------
        // 1. Get authentication token
        // --------------------------------------------------

        const cookieStore = await cookies();

        const token = cookieStore.get(
            "smart_inspection_token"
        )?.value;

        if (!token) {
            console.log(
                "❌ [INSPECTION DETAILS] Authentication token missing"
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
                "❌ [INSPECTION DETAILS] Invalid or expired token"
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired authentication token",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 3. Get dynamic route parameter
        // Next.js 16: params is a Promise
        // --------------------------------------------------

        const { id: inspectionId } = await params;

        // --------------------------------------------------
        // 4. Validate inspection ID
        // --------------------------------------------------

        if (
            !inspectionId ||
            !mongoose.Types.ObjectId.isValid(inspectionId)
        ) {
            console.log(
                `❌ [INSPECTION DETAILS] Invalid inspection ID: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid inspection ID",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 5. Connect to database
        // --------------------------------------------------

        await connectDB();

        // --------------------------------------------------
        // 6. Verify authenticated user
        // --------------------------------------------------

        const user = await User.findById(decoded.userId).select(
            "_id name email role"
        );

        if (!user) {
            console.log(
                "❌ [INSPECTION DETAILS] User account not found"
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
        // 7. Verify inspector role
        // --------------------------------------------------

        if (user.role !== "inspector") {
            console.log(
                `🚫 [INSPECTION DETAILS] Unauthorized role: ${user.role}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only inspectors can access this inspection",
                },
                { status: 403 }
            );
        }

        // --------------------------------------------------
        // 8. Find inspection
        // Ownership protection is applied here.
        // Inspector can only access their own inspection.
        // --------------------------------------------------

        const inspection = await Inspection.findOne({
            _id: inspectionId,
            inspector: user._id,
        })
            .populate("inspector", "name email role")
            .lean();

        // --------------------------------------------------
        // 9. Inspection not found / not owned
        // --------------------------------------------------

        if (!inspection) {
            console.log(
                `❌ [INSPECTION DETAILS] Inspection not found or not owned: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Inspection not found",
                },
                { status: 404 }
            );
        }

        // --------------------------------------------------
        // 10. Return inspection details
        // --------------------------------------------------

        console.log(
            `✅ [INSPECTION DETAILS] Inspection found: ${inspectionId}`
        );

        return NextResponse.json(
            {
                success: true,

                inspection: {
                    id: inspection._id.toString(),

                    assetName: inspection.assetName,

                    location: inspection.location,

                    inspectionType:
                        inspection.inspectionType,

                    inspectedAt:
                        inspection.inspectedAt,

                    submittedAt:
                        inspection.submittedAt,

                    status:
                        inspection.status,

                    result:
                        inspection.result,

                    inspector: inspection.inspector,

                    checklist:
                        inspection.checklist || [],

                    evidence:
                        inspection.evidence || [],

                    remarks:
                        inspection.remarks || "",

                    createdAt:
                        inspection.createdAt,

                    updatedAt:
                        inspection.updatedAt,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "❌ [INSPECTION DETAILS] Failed"
        );

        console.error(
            "   └─",
            error.message
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch inspection details",
            },
            { status: 500 }
        );
    }
}


//Production-ready PATCH API

export async function PATCH(request, { params }) {
    try {
        console.log("✏️ [INSPECTION UPDATE] Request received");

        // --------------------------------------------------
        // 1. Get authentication token
        // --------------------------------------------------

        const cookieStore = await cookies();

        const token = cookieStore.get(
            "smart_inspection_token"
        )?.value;

        if (!token) {
            console.log(
                "❌ [INSPECTION UPDATE] Authentication token missing"
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
                "❌ [INSPECTION UPDATE] Invalid or expired token"
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired authentication token",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 3. Get inspection ID
        // Next.js 16: params is a Promise
        // --------------------------------------------------

        const { id: inspectionId } = await params;

        // --------------------------------------------------
        // 4. Validate inspection ID
        // --------------------------------------------------

        if (
            !inspectionId ||
            !mongoose.Types.ObjectId.isValid(inspectionId)
        ) {
            console.log(
                `❌ [INSPECTION UPDATE] Invalid inspection ID: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid inspection ID",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 5. Connect to database
        // --------------------------------------------------

        await connectDB();

        // --------------------------------------------------
        // 6. Verify authenticated user
        // --------------------------------------------------

        const user = await User.findById(decoded.userId).select(
            "_id name email role"
        );

        if (!user) {
            console.log(
                "❌ [INSPECTION UPDATE] User account not found"
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
        // 7. Verify inspector role
        // --------------------------------------------------

        if (user.role !== "inspector") {
            console.log(
                `🚫 [INSPECTION UPDATE] Unauthorized role: ${user.role}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only inspectors can update inspections",
                },
                { status: 403 }
            );
        }

        // --------------------------------------------------
        // 8. Find inspection with ownership protection
        // --------------------------------------------------

        const inspection = await Inspection.findOne({
            _id: inspectionId,
            inspector: user._id,
        });

        if (!inspection) {
            console.log(
                `❌ [INSPECTION UPDATE] Inspection not found or not owned: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Inspection not found",
                },
                { status: 404 }
            );
        }

        // --------------------------------------------------
        // 9. Prevent modification after submission
        // --------------------------------------------------

        if (inspection.status !== "draft") {
            console.log(
                `🚫 [INSPECTION UPDATE] Inspection is already submitted: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Submitted inspections cannot be modified",
                },
                { status: 409 }
            );
        }

        // --------------------------------------------------
        // 10. Parse request body
        // --------------------------------------------------

        let body;

        try {
            body = await request.json();
        } catch (error) {
            console.log(
                "❌ [INSPECTION UPDATE] Invalid JSON body"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request body",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 11. Reject unknown fields
        // --------------------------------------------------

        const allowedFields = [
            "assetName",
            "location",
            "inspectionType",
            "inspectedAt",
            "remarks",
        ];

        const receivedFields = Object.keys(body);

        const unknownFields = receivedFields.filter(
            (field) => !allowedFields.includes(field)
        );

        if (unknownFields.length > 0) {
            console.log(
                `❌ [INSPECTION UPDATE] Unsupported fields: ${unknownFields.join(
                    ", "
                )}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Request contains unsupported fields",
                    fields: unknownFields,
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 12. Prevent empty update
        // --------------------------------------------------

        if (receivedFields.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "At least one field is required to update",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 13. Validate asset name
        // --------------------------------------------------

        if (body.assetName !== undefined) {
            if (
                typeof body.assetName !== "string" ||
                body.assetName.trim().length < 2
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Asset name must be at least 2 characters",
                    },
                    { status: 400 }
                );
            }

            if (body.assetName.trim().length > 150) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Asset name cannot exceed 150 characters",
                    },
                    { status: 400 }
                );
            }
        }

        // --------------------------------------------------
        // 14. Validate inspection type
        // --------------------------------------------------

        if (body.inspectionType !== undefined) {
            if (
                typeof body.inspectionType !== "string" ||
                body.inspectionType.trim().length < 2
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Inspection type must be at least 2 characters",
                    },
                    { status: 400 }
                );
            }

            if (body.inspectionType.trim().length > 100) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Inspection type cannot exceed 100 characters",
                    },
                    { status: 400 }
                );
            }
        }

        // --------------------------------------------------
        // 15. Validate remarks
        // --------------------------------------------------

        if (body.remarks !== undefined) {
            if (typeof body.remarks !== "string") {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Remarks must be text",
                    },
                    { status: 400 }
                );
            }

            if (body.remarks.length > 1000) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Remarks cannot exceed 1000 characters",
                    },
                    { status: 400 }
                );
            }
        }

        // --------------------------------------------------
        // 16. Validate location
        // --------------------------------------------------

        if (body.location !== undefined) {
            if (
                !body.location ||
                typeof body.location !== "object" ||
                Array.isArray(body.location)
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid location",
                    },
                    { status: 400 }
                );
            }

            const latitude = Number(
                body.location.latitude
            );

            const longitude = Number(
                body.location.longitude
            );

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
        }

        // --------------------------------------------------
        // 17. Validate inspection time
        // --------------------------------------------------

        if (body.inspectedAt !== undefined) {
            const inspectionDate = new Date(
                body.inspectedAt
            );

            if (
                Number.isNaN(
                    inspectionDate.getTime()
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid inspection date",
                    },
                    { status: 400 }
                );
            }

            const now = Date.now();
            const allowedFutureTime =
                5 * 60 * 1000;

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
        // 18. Build safe update
        // --------------------------------------------------

        const updateData = {};

        if (body.assetName !== undefined) {
            updateData.assetName =
                body.assetName.trim();
        }

        if (body.inspectionType !== undefined) {
            updateData.inspectionType =
                body.inspectionType.trim();
        }

        if (body.remarks !== undefined) {
            updateData.remarks =
                body.remarks.trim();
        }

        if (body.location !== undefined) {
            updateData.location = {
                latitude: Number(
                    body.location.latitude
                ),
                longitude: Number(
                    body.location.longitude
                ),
            };
        }

        if (body.inspectedAt !== undefined) {
            updateData.inspectedAt = new Date(
                body.inspectedAt
            );
        }

        // --------------------------------------------------
        // 19. Update inspection
        // --------------------------------------------------

        Object.assign(
            inspection,
            updateData
        );

        await inspection.save();

        // --------------------------------------------------
        // 20. Return updated inspection
        // --------------------------------------------------

        console.log(
            `✅ [INSPECTION UPDATE] Inspection updated: ${inspectionId}`
        );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Inspection updated successfully",

                inspection: {
                    id: inspection._id.toString(),

                    assetName:
                        inspection.assetName,

                    location:
                        inspection.location,

                    inspectionType:
                        inspection.inspectionType,

                    inspectedAt:
                        inspection.inspectedAt,

                    submittedAt:
                        inspection.submittedAt,

                    status:
                        inspection.status,

                    result:
                        inspection.result,

                    inspector: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                    },

                    checklist:
                        inspection.checklist || [],

                    evidence:
                        inspection.evidence || [],

                    remarks:
                        inspection.remarks || "",

                    createdAt:
                        inspection.createdAt,

                    updatedAt:
                        inspection.updatedAt,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "❌ [INSPECTION UPDATE] Failed"
        );

        console.error(
            "   └─",
            error.message
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update inspection",
            },
            { status: 500 }
        );
    }
}