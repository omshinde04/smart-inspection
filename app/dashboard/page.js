"use client";

import { useEffect, useState } from "react";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    LogOut,
    Menu,
    Settings,
    ShieldCheck,
    X,
    XCircle,
} from "lucide-react";

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const response = await fetch("/api/auth/me");

                const data = await response.json();

                if (!response.ok) {
                    window.location.href = "/login";
                    return;
                }

                setUser(data.user);
            } catch (error) {
                console.error(
                    "❌ [DASHBOARD] Authentication check failed:",
                    error
                );

                window.location.href = "/login";
            } finally {
                setLoading(false);
            }
        };

        getCurrentUser();
    }, []);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);

            console.log("🚪 [UI] Logging out...");

            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Logout failed");
            }

            console.log("✅ [UI] Logout successful");

            window.location.href = "/login";
        } catch (error) {
            console.error("❌ [UI] Logout failed:", error);
            setLoggingOut(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                        <ClipboardCheck size={22} />
                    </div>

                    <p className="text-sm text-slate-500">
                        Loading dashboard...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">

            {/* Mobile Overlay */}

            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
                />
            )}

            <div className="flex min-h-screen">

                {/* =====================================================
                    SIDEBAR
                ===================================================== */}

                <aside
                    className={`
                        fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
                        bg-slate-950 text-white transition-transform duration-200
                        lg:static lg:translate-x-0
                        ${sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                        }
                    `}
                >

                    {/* Logo */}

                    <div className="flex h-20 items-center justify-between border-b border-white/[0.07] px-5">

                        <a
                            href="/dashboard"
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                                <ClipboardCheck
                                    size={20}
                                    strokeWidth={2.2}
                                />
                            </div>

                            <div>
                                <p className="font-[family-name:var(--font-sora)] text-sm font-semibold">
                                    Smart Inspection
                                </p>

                                <p className="text-[10px] text-slate-500">
                                    Inspection management
                                </p>
                            </div>
                        </a>

                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
                        >
                            <X size={18} />
                        </button>

                    </div>

                    {/* Navigation */}

                    <nav className="flex-1 px-3 py-5">

                        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                            Workspace
                        </p>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl bg-blue-600 px-3.5 py-3 text-sm font-medium text-white"
                        >
                            <BarChart3 size={18} />
                            Dashboard
                        </button>

                        <button
                            type="button"
                            className="mt-1.5 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <ClipboardCheck size={18} />
                            Inspections
                        </button>

                        <button
                            type="button"
                            className="mt-1.5 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <Activity size={18} />
                            Monitoring
                        </button>

                        <button
                            type="button"
                            className="mt-1.5 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <Settings size={18} />
                            Settings
                        </button>

                    </nav>

                    {/* User / Logout */}

                    <div className="border-t border-white/[0.07] p-3">

                        <div className="mb-2 rounded-xl bg-white/[0.04] px-3 py-3">

                            <p className="truncate text-sm font-medium text-white">
                                {user?.name}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                {user?.email}
                            </p>

                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-[10px] font-medium capitalize text-blue-400">
                                <ShieldCheck size={12} />
                                {user?.role}
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <LogOut size={18} />

                            {loggingOut
                                ? "Signing out..."
                                : "Sign out"}
                        </button>

                    </div>

                </aside>

                {/* =====================================================
                    MAIN CONTENT
                ===================================================== */}

                <section className="min-w-0 flex-1">

                    {/* Top Bar */}

                    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">

                        <div className="flex items-center gap-3">

                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
                            >
                                <Menu size={19} />
                            </button>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                                    Workspace
                                </p>

                                <h1 className="mt-0.5 font-[family-name:var(--font-sora)] text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                                    Dashboard
                                </h1>
                            </div>

                        </div>

                        <div className="hidden items-center gap-3 sm:flex">

                            <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                System operational
                            </div>

                        </div>

                    </header>

                    {/* Dashboard Content */}

                    <div className="p-4 sm:p-6 lg:p-8">

                        {/* Welcome */}

                        <div className="mb-7">

                            <p className="text-sm font-medium text-blue-600">
                                Overview
                            </p>

                            <h2 className="mt-1 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                Good to see you, {user?.name?.split(" ")[0]}.
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Here's what's happening with your inspections.
                            </p>

                        </div>

                        {/* Stats */}

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            <DashboardStat
                                label="Total inspections"
                                value="128"
                                icon={<ClipboardCheck size={19} />}
                                description="+12 this month"
                            />

                            <DashboardStat
                                label="Completed"
                                value="96"
                                icon={<CheckCircle2 size={19} />}
                                description="75% completion rate"
                            />

                            <DashboardStat
                                label="Pending"
                                value="21"
                                icon={<Clock3 size={19} />}
                                description="Requires attention"
                            />

                            <DashboardStat
                                label="Attention"
                                value="11"
                                icon={<AlertTriangle size={19} />}
                                description="Needs review"
                            />

                        </div>

                        {/* Main Grid */}

                        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

                            {/* Recent Inspections */}

                            <section className="rounded-2xl border border-slate-200 bg-white">

                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

                                    <div>
                                        <h3 className="font-[family-name:var(--font-sora)] text-sm font-semibold text-slate-950">
                                            Recent inspections
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Latest inspection activity
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        View all
                                    </button>

                                </div>

                                <div className="divide-y divide-slate-100">

                                    <InspectionRow
                                        asset="Machine A-01"
                                        inspector="Vivek Singh"
                                        time="10:24 AM"
                                        status="Passed"
                                    />

                                    <InspectionRow
                                        asset="Generator B-12"
                                        inspector="Krishanth"
                                        time="09:48 AM"
                                        status="Warning"
                                    />

                                    <InspectionRow
                                        asset="Panel C-07"
                                        inspector="Vinish G."
                                        time="09:15 AM"
                                        status="Failed"
                                    />

                                    <InspectionRow
                                        asset="Pump D-04"
                                        inspector="Samruddhi"
                                        time="08:52 AM"
                                        status="Passed"
                                    />

                                </div>

                            </section>

                            {/* System Status */}

                            <section className="rounded-2xl border border-slate-200 bg-white">

                                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

                                    <h3 className="font-[family-name:var(--font-sora)] text-sm font-semibold text-slate-950">
                                        System status
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Platform overview
                                    </p>

                                </div>

                                <div className="space-y-5 p-5 sm:p-6">

                                    <StatusItem
                                        label="Inspection service"
                                        status="Operational"
                                    />

                                    <StatusItem
                                        label="Database"
                                        status="Connected"
                                    />

                                    <StatusItem
                                        label="Automation engine"
                                        status="Ready"
                                    />

                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <div className="flex items-center gap-2">
                                            <Activity
                                                size={17}
                                                className="text-blue-600"
                                            />

                                            <span className="text-sm font-medium text-slate-700">
                                                Monitoring active
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xs leading-5 text-slate-500">
                                            Real-time inspection monitoring
                                            will appear here once live data
                                            is connected.
                                        </p>

                                    </div>

                                </div>

                            </section>

                        </div>

                        {/* Demo Notice */}

                        <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3.5">

                            <ShieldCheck
                                size={18}
                                className="mt-0.5 shrink-0 text-blue-600"
                            />

                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Demo dashboard
                                </p>

                                <p className="mt-0.5 text-xs leading-5 text-blue-700/80">
                                    These dashboard values are temporary demo
                                    data. They will be replaced with real
                                    inspection records from MongoDB.
                                </p>
                            </div>

                        </div>

                    </div>

                </section>

            </div>
        </main>
    );
}

/* =====================================================
   STAT CARD
===================================================== */

function DashboardStat({
    label,
    value,
    icon,
    description,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-xs font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight text-slate-950">
                        {value}
                    </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    {icon}
                </div>

            </div>

            <p className="mt-3 text-[11px] text-slate-400">
                {description}
            </p>

        </div>
    );
}

/* =====================================================
   INSPECTION ROW
===================================================== */

function InspectionRow({
    asset,
    inspector,
    time,
    status,
}) {
    const statusConfig = {
        Passed: {
            icon: CheckCircle2,
            className: "bg-green-50 text-green-700",
        },
        Warning: {
            icon: AlertTriangle,
            className: "bg-amber-50 text-amber-700",
        },
        Failed: {
            icon: XCircle,
            className: "bg-red-50 text-red-700",
        },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">

            <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <ClipboardCheck size={17} />
                </div>

                <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-slate-800">
                        {asset}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-400">
                        {inspector} · {time}
                    </p>

                </div>

            </div>

            <div
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${config.className}`}
            >
                <StatusIcon size={13} />
                {status}
            </div>

        </div>
    );
}

/* =====================================================
   STATUS ITEM
===================================================== */

function StatusItem({
    label,
    status,
}) {
    return (
        <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-2.5">

                <span className="h-2 w-2 rounded-full bg-green-500" />

                <span className="text-sm text-slate-600">
                    {label}
                </span>

            </div>

            <span className="text-xs font-medium text-green-600">
                {status}
            </span>

        </div>
    );
}