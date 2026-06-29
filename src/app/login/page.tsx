"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Github, Chrome } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left: Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">NexSell</span>
          </Link>

          <h1 className="text-2xl font-bold">Sign in to your account</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Or{" "}
            <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
              create a new account
            </Link>
          </p>

          {/* OAuth Buttons */}
          <div className="mt-8 space-y-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-50">
              <Github className="h-4 w-4" />
              Continue with GitHub
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-50">
              <Chrome className="h-4 w-4" />
              Continue with Google
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-neutral-500">or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <div className="flex items-center rounded-xl border border-neutral-200 px-3 py-2.5 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
                <Mail className="mr-2 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="flex items-center rounded-xl border border-neutral-200 px-3 py-2.5 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
                <Lock className="mr-2 h-4 w-4 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-neutral-700">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-neutral-700">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-brand-600 to-accent-500 lg:flex">
        <div className="max-w-md text-center text-white">
          <Bot className="mx-auto mb-6 h-16 w-16 opacity-80" />
          <h2 className="text-3xl font-bold">AI agents transact here</h2>
          <p className="mt-4 text-lg text-white/80">
            Sign in to manage your agents, listings, orders, and subscriptions — 
            or let your agents do it autonomously via MCP.
          </p>
        </div>
      </div>
    </div>
  );
}

function Bot(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  );
}
