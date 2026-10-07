"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardSidebar from "../components/layout/DashboardSidebar";
import DashboardHeader from "../components/layout/DashboardHeader";
import MobileSidebar from "../components/layout/MobileSidebar";

import DashboardWelcome from "../components/dashboard/DashboardWelcome";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentInspections from "../components/dashboard/RecentInspections";

export default function DashboardPage() {
    const router = useRouter();

    // =========================================================
    // USER
    // =========================================================

    const [user, setUser] = useState(null);

    const [loadingUser, setLoadingUser] =
        useState(true);

    // =========================================================
    // STATS
    // =========================================================

    const [stats, setStats] = useState(null);

    const [loadingStats, setLoadingStats] =
        useState(true);

    const [statsError, setStatsError] =
        useState("");

    // =========================================================
    // RECENT INSPECTIONS
    // =========================================================

    const [recentInspections, setRecentInspections] =
        useState([]);

    const [loadingRecent, setLoadingRecent] =
        useState(true);

    const [recentError, setRecentError] =
        useState("");

    // =========================================================
    // MOBILE SIDEBAR
    // =========================================================

    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    // =========================================================
    // LOAD RECENT INSPECTIONS
    // =========================================================

    const loadRecentInspections = useCallback(
        async () => {
            try {
                setLoadingRecent(true);
                setRecentError("");

                const response = await fetch(
                    "/api/inspections/recent?limit=5",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                        "Failed to load recent inspections"
                    );
                }

                setRecentInspections(
                    Array.isArray(data.data)
                        ? data.data
                        : []
                );
            } catch (error) {
                console.error(
                    "❌ Recent inspections error:",
                    error
                );

                setRecentError(
                    error.message ||
                    "Unable to load recent inspections"
                );
            } finally {
                setLoadingRecent(false);
            }
        },
        []
    );

    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    useEffect(() => {
        let mounted = true;

        async function loadDashboard() {
            try {
                setLoadingUser(true);
                setLoadingStats(true);
                setStatsError("");

                // =============================================
                // 1. AUTHENTICATED USER
                // =============================================

                const userResponse = await fetch(
                    "/api/auth/me",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const userData =
                    await userResponse.json();

                if (
                    !userResponse.ok ||
                    !userData.success
                ) {
                    router.replace("/login");
                    return;
                }

                if (!mounted) {
                    return;
                }

                setUser(userData.user);
                setLoadingUser(false);

                // =============================================
                // 2. INSPECTION STATISTICS
                // =============================================

                const statsResponse = await fetch(
                    "/api/inspections/stats",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const statsData =
                    await statsResponse.json();

                if (
                    !statsResponse.ok ||
                    !statsData.success
                ) {
                    throw new Error(
                        statsData.message ||
                        "Failed to load statistics"
                    );
                }

                if (!mounted) {
                    return;
                }

                setStats(
                    statsData.data || {
                        total: 0,
                        completed: 0,
                        pending: 0,
                        passed: 0,
                        warning: 0,
                        failed: 0,
                    }
                );

                setLoadingStats(false);

                // =============================================
                // 3. RECENT INSPECTIONS
                // =============================================

                await loadRecentInspections();
            } catch (error) {
                console.error(
                    "❌ Dashboard loading error:",
                    error
                );

                if (!mounted) {
                    return;
                }

                setStatsError(
                    error.message ||
                    "Unable to load dashboard data"
                );

                setLoadingStats(false);
            } finally {
                if (mounted) {
                    setLoadingUser(false);
                }
            }
        }

        loadDashboard();

        return () => {
            mounted = false;
        };
    }, [router, loadRecentInspections]);

    // =========================================================
    // LOGOUT
    // =========================================================

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error(
                "❌ Logout error:",
                error
            );
        } finally {
            router.replace("/login");
        }
    }

    // =========================================================
    // INITIAL LOADING
    // =========================================================

    if (loadingUser) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                    <span>
                        Loading dashboard...
                    </span>
                </div>
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* =================================================
                DESKTOP SIDEBAR
            ================================================== */}

            <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
                <DashboardSidebar user={user} />
            </div>

            {/* =================================================
                MOBILE SIDEBAR
            ================================================== */}

            <MobileSidebar
                open={mobileSidebarOpen}
                onClose={() =>
                    setMobileSidebarOpen(false)
                }
                user={user}
            />

            {/* =================================================
                MAIN APPLICATION AREA
            ================================================== */}

            <div className="lg:pl-[272px]">
                {/* Header */}
                <DashboardHeader
                    user={user}
                    onMenuClick={() =>
                        setMobileSidebarOpen(true)
                    }
                    onLogout={handleLogout}
                />

                {/* =================================================
                    PAGE CONTENT
                ================================================== */}

                <main className="px-4 py-7 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1440px]">
                        {/* =========================================
                            WELCOME
                        ========================================== */}

                        <DashboardWelcome
                            total={
                                stats?.total || 0
                            }
                        />

                        {/* =========================================
                            STATS
                        ========================================== */}

                        <StatsGrid
                            stats={stats}
                            loading={loadingStats}
                        />

                        {/* =========================================
                            STATS ERROR
                        ========================================== */}

                        {statsError && (
                            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                                <p className="text-sm font-semibold text-red-700">
                                    Unable to load inspection
                                    statistics
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-600">
                                    {statsError}
                                </p>
                            </div>
                        )}

                        {/* =========================================
                            RECENT INSPECTIONS
                        ========================================== */}

                        <RecentInspections
                            inspections={
                                recentInspections
                            }
                            loading={
                                loadingRecent
                            }
                            error={
                                recentError
                            }
                            onRetry={
                                loadRecentInspections
                            }
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}