"use client";

import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import {
  LogOut,
  LogIn,
  Menu,
  X,
  Home,
  BarChart2,
  PlusCircle,
  Target,
  MessageCircle,
  FileText,
  UserCircle,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  return (
    <nav className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-1">
          <Image
            src="/logo.png"
            alt="FinTrack Logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="font-bold text-xl text-indigo-700 dark:text-indigo-300 tracking-tight">
            FinTrack
          </span>
        </Link>
      </div>
      {/* Desktop nav */}
      <div className="hidden md:flex gap-4 items-center">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-indigo-600"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-indigo-600"
        >
          Dashboard
        </Link>
        <Link
          href="/add-expense"
          className="flex items-center gap-1 hover:text-indigo-600"
        >
          Add Expense
        </Link>
        <Link
          href="/goals"
          className="flex items-center gap-1 hover:text-indigo-600"
        >
          Goals
        </Link>
        <Link
          href="/insights"
          className="flex items-center gap-1 hover:text-indigo-600"
        >
          Insights
        </Link>
        <Link
          href="/reports"
          className="flex items-center gap-1 hover:text-indigo-600"
        >
          Reports
        </Link>
        <Link
          href="/chat"
          className="flex items-center gap-1 hover:text-indigo-600"
        >
          Chat
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-1 hover:text-indigo-600"
        >
          Profile
        </Link>
      </div>
      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <ThemeToggle />
        <NotificationBell />
        {session && (
          <Link href="/profile" className="hidden md:block">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "Profile"}
                width={34}
                height={34}
                className="rounded-full ring-2 ring-indigo-500/40 hover:ring-indigo-500 transition"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-200 text-indigo-900 flex items-center justify-center font-semibold">
                {(session.user?.name || session.user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </Link>
        )}
        {session ? (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        )}
      </div>

      {/* Mobile full-screen menu */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 md:hidden bg-white dark:bg-zinc-900 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <Image
                src="/logo.png"
                alt="FinTrack Logo"
                width={28}
                height={28}
                className="rounded"
              />
              <span className="font-bold text-lg">FinTrack</span>
            </Link>
            <button
              aria-label="Close menu"
              className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full max-w-xs justify-center"
              onClick={() => setOpen(false)}
            >
              <Home className="w-5 h-5" /> Home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full max-w-xs justify-center"
              onClick={() => setOpen(false)}
            >
              <BarChart2 className="w-5 h-5" /> Dashboard
            </Link>
            <Link
              href="/add-expense"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full max-w-xs justify-center"
              onClick={() => setOpen(false)}
            >
              <PlusCircle className="w-5 h-5" /> Add Expense
            </Link>
            <Link
              href="/goals"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full max-w-xs justify-center"
              onClick={() => setOpen(false)}
            >
              <Target className="w-5 h-5" /> Goals
            </Link>
            <Link
              href="/insights"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full max-w-xs justify-center"
              onClick={() => setOpen(false)}
            >
              <Lightbulb className="w-5 h-5" /> Insights
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full max-w-xs justify-center"
              onClick={() => setOpen(false)}
            >
              <FileText className="w-5 h-5" /> Reports
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full max-w-xs justify-center"
              onClick={() => setOpen(false)}
            >
              <MessageCircle className="w-5 h-5" /> Chat
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full max-w-xs justify-center"
              onClick={() => setOpen(false)}
            >
              <UserCircle className="w-5 h-5" /> Profile
            </Link>
          </nav>
          <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
            {session ? (
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  signIn("google", { callbackUrl: "/dashboard" });
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}
            <div className="mt-2 text-center text-xs text-zinc-500">
              <p className="text-base text-center text-zinc-400">
                &copy; {new Date().getFullYear()} FinTrack. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
