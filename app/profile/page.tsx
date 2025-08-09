"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiGet, apiPost } from "@/lib/apiClient";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  UserCircle,
  Mail,
  GraduationCap,
  BarChart2,
  Edit3,
} from "lucide-react";
import Loader from "@/components/Loader";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSWR from "swr";

interface UserProfile {
  name: string;
  email: string;
  image?: string;
  studentType?: string;
  budget?: {
    monthly: number;
    categories: Record<string, number>;
  };
}

interface ExpenseSummary {
  total: number;
  categories: Record<string, number>;
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [monthly, setMonthly] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSettings, setEmailSettings] = useState({
    enabled: false,
    parentEmail: "",
    thresholdType: "never" as "monthly" | "weekly" | "never",
    thresholdAmount: 0,
  });

  const {
    data: expenseSummary,
    error: expenseSummaryError,
    isLoading: expenseSummaryLoading,
  } = useSWR<ExpenseSummary>(
    session ? "/api/expenses-summary" : null,
    fetcher,
    { refreshInterval: 0 }
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!session) return;
    setLoading(true);

    apiGet<UserProfile>("/api/profile")
      .then((data) => {
        setProfile({ ...data, image: session.user?.image || undefined });
        setMonthly(data.budget?.monthly || 0);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));

    fetch("/api/notifications/settings", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.emailSettings) setEmailSettings(d.emailSettings);
      })
      .catch(() => {});
  }, [session, status]);

  async function handleBudgetUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiPost<{ budget: UserProfile["budget"] }>("/api/budget", {
        monthly,
      });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              budget: {
                monthly,
                categories: prev.budget?.categories || {},
              },
            }
          : prev
      );
      toast.success("Budget updated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  if (status === "loading" || loading || expenseSummaryLoading) {
    return (
      <main className="p-8 text-center">
        <Loader label="Loading Profile.." />
      </main>
    );
  }
  if (!session) return null;
  if (expenseSummaryError) {
    return (
      <main className="p-8 text-red-500">
        Error: {expenseSummaryError.message}
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Centered Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
            Your Profile
          </h1>
        </div>

        {/* Profile Card */}
        {profile && (
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg hover:scale-[1.01] transition-transform duration-300">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 animate-gradient-x" />
            <div className="relative px-6 pb-6 -mt-16 flex flex-col md:flex-row md:items-center gap-6">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt="Profile"
                  width={110}
                  height={110}
                  className="rounded-full ring-4 ring-white dark:ring-zinc-900 shadow-xl"
                />
              ) : (
                <UserCircle className="w-28 h-28 rounded-full ring-4 ring-white dark:ring-zinc-900 text-indigo-200 bg-indigo-700 p-2 shadow-xl" />
              )}
              <div className="flex flex-col">
                <h2 className="text-2xl pb-4 font-bold text-zinc-900 dark:text-zinc-50">
                  {profile.name}
                </h2>
                <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <Mail className="w-4 h-4" /> {profile.email}
                </span>
                {profile.studentType && (
                  <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200 w-fit">
                    <GraduationCap className="w-4 h-4" /> {profile.studentType}
                  </span>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parent Notifications */}
          <Card className="p-6 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
            <CardHeader className="p-0 mb-4">
              <h3 className="text-lg font-semibold">Parent Details</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="text-sm">Parent Email</label>
              <input
                type="email"
                className="border rounded px-3 py-2 w-full"
                value={emailSettings.parentEmail}
                onChange={(e) =>
                  setEmailSettings((s) => ({
                    ...s,
                    parentEmail: e.target.value,
                  }))
                }
              />
              <label className="text-sm">Alert Threshold (₹)</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={emailSettings.thresholdAmount}
                onChange={(e) =>
                  setEmailSettings((s) => ({
                    ...s,
                    thresholdAmount: Number(e.target.value),
                  }))
                }
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={emailSettings.enabled}
                  onChange={(e) =>
                    setEmailSettings((s) => ({
                      ...s,
                      enabled: e.target.checked,
                    }))
                  }
                />
                Enable emails
              </label>
              <Button
                onClick={async () => {
                  await fetch("/api/notifications/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(emailSettings),
                  });
                  toast.success("Preferences saved");
                }}
                className="w-full"
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Budget */}
          <Card className="p-6 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
            <CardHeader className="p-0 mb-4">
              <h3 className="text-lg font-semibold">Monthly Budget</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBudgetUpdate} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    className="border rounded pl-7 pr-3 py-2 w-full"
                    value={monthly}
                    onChange={(e) => setMonthly(Number(e.target.value))}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Update Budget
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Expense Summary */}
        {expenseSummary && (
          <Card className="p-6 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
            <CardHeader className="flex items-center gap-2 p-0 mb-4">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Expense Summary</h3>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                Total Spent: ₹{expenseSummary.total}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(expenseSummary.categories).map(([cat, val]) => (
                  <div
                    key={cat}
                    className="bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    {cat}: ₹{val}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
