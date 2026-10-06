"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ClipboardCheck,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Connect your registration API here later.
        console.log("Registration submitted");
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="grid min-h-screen lg:grid-cols-2">

                {/* =====================================================
                    LEFT — BRAND / PRODUCT SIDE
                ===================================================== */}

                <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
                    {/* Subtle background */}
                    <div className="absolute inset-0">
                        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-blue-600/[0.08] blur-[120px]" />

                        <div className="absolute bottom-[-150px] right-[-100px] h-[420px] w-[420px] rounded-full bg-blue-500/[0.06] blur-[120px]" />

                        <div
                            className="absolute inset-0 opacity-[0.025]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                                backgroundSize: "48px 48px",
                            }}
                        />
                    </div>

                    <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

                        {/* Logo */}
                        <Link
                            href="/"
                            className="inline-flex w-fit items-center gap-3"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <ClipboardCheck size={20} />
                            </div>

                            <div>
                                <p className="font-[family-name:var(--font-sora)] text-sm font-semibold text-white">
                                    Smart Inspection
                                </p>

                                <p className="text-[10px] text-slate-400">
                                    Inspection management
                                </p>
                            </div>
                        </Link>

                        {/* Main Message */}
                        <div className="max-w-xl">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                                Get Started
                            </p>

                            <h1 className="font-[family-name:var(--font-sora)] text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                                Build a smarter
                                <span className="block text-blue-500">
                                    inspection workflow.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                                Create your Smart Inspection account and
                                bring inspection records, evidence,
                                monitoring, and automated results into
                                one organized platform.
                            </p>

                            {/* Highlights */}
                            <div className="mt-8 space-y-3">
                                <RegisterHighlight>
                                    Create digital inspection records
                                </RegisterHighlight>

                                <RegisterHighlight>
                                    Capture evidence and location data
                                </RegisterHighlight>

                                <RegisterHighlight>
                                    Monitor inspection activity
                                </RegisterHighlight>

                                <RegisterHighlight>
                                    Get automated inspection results
                                </RegisterHighlight>
                            </div>
                        </div>

                        {/* Bottom */}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <ShieldCheck size={14} />

                            Secure inspection management
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    RIGHT — REGISTER
                ===================================================== */}

                <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">

                        {/* Mobile Logo */}
                        <Link
                            href="/"
                            className="mb-8 flex items-center gap-3 lg:hidden"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <ClipboardCheck size={20} />
                            </div>

                            <div>
                                <p className="font-[family-name:var(--font-sora)] text-sm font-semibold text-slate-900">
                                    Smart Inspection
                                </p>

                                <p className="text-[10px] text-slate-400">
                                    Inspection management
                                </p>
                            </div>
                        </Link>

                        {/* Header */}
                        <div>
                            <p className="text-sm font-medium text-blue-600">
                                Get started
                            </p>

                            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-tight text-slate-950">
                                Create your account
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Set up your account to start managing
                                inspections.
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="mt-7"
                        >
                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Full name
                                </label>

                                <div className="relative">
                                    <User
                                        size={17}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Enter your full name"
                                        required
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="mt-4">
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={17}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        required
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mt-4">
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <Lock
                                        size={17}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="new-password"
                                        placeholder="Create a password"
                                        required
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="mt-4">
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Confirm password
                                </label>

                                <div className="relative">
                                    <Lock
                                        size={17}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="new-password"
                                        placeholder="Confirm your password"
                                        required
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="mt-5">
                                <label className="flex cursor-pointer items-start gap-2.5">
                                    <input
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) =>
                                            setAgreeTerms(
                                                e.target.checked
                                            )
                                        }
                                        required
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                                    />

                                    <span className="text-xs leading-5 text-slate-500">
                                        I agree to the{" "}
                                        <Link
                                            href="/terms"
                                            className="font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link
                                            href="/privacy"
                                            className="font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            Privacy Policy
                                        </Link>
                                        .
                                    </span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.15)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_10px_28px_rgba(37,99,235,0.2)]"
                            >
                                Create Account

                                <ArrowRight
                                    size={16}
                                    className="transition-transform duration-200 group-hover:translate-x-1"
                                />
                            </button>
                        </form>

                        {/* Login */}
                        <div className="mt-7 text-center">
                            <p className="text-sm text-slate-500">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* Footer */}
                        <p className="mt-7 text-center text-xs text-slate-400">
                            © {new Date().getFullYear()} Smart Inspection.
                            All rights reserved.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

/* =====================================================
   REGISTER HIGHLIGHT
===================================================== */

function RegisterHighlight({ children }) {
    return (
        <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <CheckCircle2
                size={16}
                className="shrink-0 text-blue-500"
            />

            {children}
        </div>
    );
}