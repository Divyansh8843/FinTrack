"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import ExpensePieChart, { ExpenseBarChart } from "@/components/ExpensePieChart";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Goal,
  Calendar,
  List,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Loader from "@/components/Loader";
interface Expense {
  _id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  source: string;
  imageUrl?: string;
}
interface Goal {
  _id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  aiRecommendedMonthly?: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [insights, setInsights] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
    setLoading(true);
    Promise.all([
      apiGet<Expense[]>("/api/expenses"),
      apiGet<Goal[]>("/api/goals"),
    ])
      .then(([expenses, goals]) => {
        setExpenses(expenses);
        setGoals(goals);
        setError(null);
        // Fetch insights in background; do not fail page if AI is unavailable
        apiPost<{ suggestions: string }>("/api/insights", {})
          .then((insightsRes) => setInsights(insightsRes.suggestions))
          .catch(() => {
            // ignore AI errors on dashboard
          });
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));

    // Poll goals periodically to keep progress real-time
    const interval = setInterval(() => {
      apiGet<Goal[]>("/api/goals")
        .then(setGoals)
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [session, status, router]);

  // Prepare pie chart data
  const pieData = expenses.reduce<{ category: string; value: number }[]>(
    (acc, exp) => {
      const cat = exp.category || "Other";
      const found = acc.find((d) => d.category === cat);
      if (found) found.value += exp.amount;
      else acc.push({ category: cat, value: exp.amount });
      return acc;
    },
    []
  );

  // Prepare bar chart data (monthly spend trend)
  const barData = expenses.reduce<{ month: string; value: number }[]>(
    (acc, exp) => {
      const d = new Date(exp.date);
      const month = d.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      const found = acc.find((m) => m.month === month);
      if (found) found.value += exp.amount;
      else acc.push({ month, value: exp.amount });
      return acc;
    },
    []
  );

  // Calculate totals and progress
  const totalSpent = pieData.reduce((a, b) => a + b.value, 0);
  const topCategory =
    pieData.sort((a, b) => b.value - a.value)[0]?.category || "-";
  const monthlyBudget = 5000; // Replace with real user budget if available
  const budgetProgress = Math.min(
    100,
    Math.round((totalSpent / monthlyBudget) * 100)
  );
  const recentExpenses = expenses.slice(0, 5);

  if (status === "loading" || loading) {
    return (
      <main className="p-8">
        {" "}
        <Loader label="Loading Dashboard.." />.
      </main>
    );
  }
  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
      <div className="w-full max-w-[1600px] mx-auto px-2 md:px-8 py-2">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-indigo-700 dark:text-indigo-300 tracking-tight text-center animate-fade-in">
          Dashboard
        </h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 animate-fade-in-up">
          <Card className="flex flex-col items-center p-8 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center gap-2">
              <Wallet className="w-9 h-9 text-indigo-600" />
              <span className="text-lg font-semibold text-center">
                Total Spent
              </span>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                ₹{totalSpent}
              </span>
            </CardContent>
          </Card>
          <Card className="flex flex-col items-center p-8 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center  gap-2">
              <TrendingUp className="w-9 h-9 text-green-600" />
              <span className="text-lg font-semibold text-center">
                Top Category
              </span>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                {topCategory}
              </span>
            </CardContent>
          </Card>
          <Card className="flex flex-col items-center p-8 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center gap-2">
              <Goal className="text-yellow-600 w-9 h-9" />
              <span className="text-lg font-semibold text-center">Goals</span>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {goals.length}
              </span>
            </CardContent>
          </Card>
          <Card className="flex flex-col items-center p-8 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center gap-2">
              <Calendar className="w-9 h-9 text-red-600" />
              <span className="text-lg font-semibold text-center">
                Budget Progress
              </span>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-3 overflow-hidden mb-2">
                <div
                  className="bg-indigo-600 h-3 rounded"
                  style={{ width: budgetProgress + "%" }}
                />
              </div>
              <span className="text-sm text-zinc-500">
                {budgetProgress}% of ₹{monthlyBudget}
              </span>
            </CardContent>
          </Card>
        </div>
        <div className="border-b border-indigo-200 dark:border-zinc-700 mb-12" />
        {/* Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 animate-fade-in-up">
          <Card className="p-6 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex items-center gap-2">
              <List className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold text-lg">
                Spending by Category
              </span>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ExpensePieChart data={pieData} />
            </CardContent>
          </Card>
          <Card className="p-6 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold text-lg">Monthly Spend Trend</span>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ExpenseBarChart data={barData} />
            </CardContent>
          </Card>
        </div>
        <div className="border-b border-indigo-200 dark:border-zinc-700 mb-12" />
        {/* Recent Activity */}
        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">
            Recent Expenses
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-zinc-900 rounded-xl shadow">
              <thead>
                <tr className="text-left text-zinc-500 text-base">
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Category</th>
                  <th className="py-2 px-4">Amount</th>
                  <th className="py-2 px-4">Description</th>
                  <th className="py-2 px-4">Source</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((exp) => (
                  <tr
                    key={exp._id}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="py-2 px-4">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4">{exp.category}</td>
                    <td className="py-2 px-4">₹{exp.amount}</td>
                    <td className="py-2 px-4">{exp.description}</td>
                    <td className="py-2 px-4">{exp.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="border-b border-indigo-200 dark:border-zinc-700 mb-12" />
        {/* Goals Progress */}
        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">
            Goals Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {goals.map((goal) => {
              const percent = Math.min(
                100,
                Math.round((goal.savedAmount / goal.targetAmount) * 100)
              );
              return (
                <Card
                  key={goal._id}
                  className="p-6 flex flex-col gap-2 shadow-xl hover:scale-105 transition-transform"
                >
                  <CardHeader className="flex flex-col gap-1">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-200 text-lg">
                      {goal.title}
                    </span>
                    <span className="text-sm text-zinc-500">
                      Target: ₹{goal.targetAmount} | Deadline:{" "}
                      {dayjs(goal.deadline).format("DD MMM YYYY")}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-3 overflow-hidden mb-2">
                      <div
                        className="bg-green-500 h-3 rounded"
                        style={{ width: percent + "%" }}
                      />
                    </div>
                    <span className="text-xs  text-zinc-600">
                      {percent}% complete (Saved: ₹{goal.savedAmount})
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
