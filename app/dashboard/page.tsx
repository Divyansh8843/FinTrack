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
  PiggyBank,
  Target,
  AlertCircle,
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

interface Budget {
  monthly: number;
  categories: Record<string, number>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
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
      apiGet<{ budget: Budget }>("/api/budget")
        .then((res) => res.budget)
        .catch(() => null),
    ])
      .then(([expenses, goals, budget]) => {
        setExpenses(expenses);
        setGoals(goals);
        setBudget(budget);
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

  // Smart budget calculations with goals integration
  const monthlyBudget = budget?.monthly || 0;
  const budgetProgress = monthlyBudget
    ? Math.min(100, Math.round((totalSpent / monthlyBudget) * 100))
    : 0;

  // Calculate goals impact on budget
  const totalGoalTarget = goals.reduce(
    (sum, goal) => sum + goal.targetAmount,
    0
  );
  const totalGoalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const totalGoalRemaining = totalGoalTarget - totalGoalSaved;

  // Calculate monthly savings needed for goals
  const activeGoals = goals.filter((goal) => {
    const daysLeft = dayjs(goal.deadline).diff(dayjs(), "day");
    return daysLeft > 0 && goal.savedAmount < goal.targetAmount;
  });

  const monthlySavingsNeeded = activeGoals.reduce((sum, goal) => {
    const daysLeft = dayjs(goal.deadline).diff(dayjs(), "day");
    const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
    const remainingAmount = goal.targetAmount - goal.savedAmount;
    return sum + remainingAmount / monthsLeft;
  }, 0);

  // Calculate available budget after goals
  const availableForExpenses = monthlyBudget - monthlySavingsNeeded;
  const expensesProgress =
    availableForExpenses > 0
      ? Math.min(100, Math.round((totalSpent / availableForExpenses) * 100))
      : 0;

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
            <CardContent className="flex flex-col justify-center items-center">
              <span className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                ₹{totalSpent}
              </span>
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center p-8 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center gap-2">
              <Target className="w-9 h-9 text-green-600" />
              <span className="text-lg font-semibold text-center">
                Goals Progress
              </span>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center">
              <span className="text-3xl font-bold text-green-700 dark:text-green-300">
                ₹{totalGoalSaved}
              </span>
              <div className="text-sm text-zinc-500 mt-1 text-center">
                of ₹{totalGoalTarget}
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center p-8 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center gap-2">
              <PiggyBank className="text-yellow-600 w-9 h-9" />
              <span className="text-lg font-semibold text-center">
                Monthly Save
              </span>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center">
              <span className="text-3xl font-bold   text-yellow-700 dark:text-yellow-300">
                ₹{Math.round(monthlySavingsNeeded)}
              </span>
              <div className="text-sm text-zinc-500 mt-1 text-center">
                needed for goals
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center p-8 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center gap-2">
              <Calendar className="w-9 h-9 text-red-600" />
              <span className="text-lg font-semibold text-center">
                Budget Status
              </span>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center">
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-3 overflow-hidden mb-2">
                <div
                  className={`h-3 rounded ${
                    budgetProgress > 80 ? "bg-red-500" : "bg-indigo-600"
                  }`}
                  style={{ width: budgetProgress + "%" }}
                />
              </div>
              <span className="text-sm text-zinc-500 text-center">
                {budgetProgress}% of ₹{monthlyBudget}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Smart Budget-Goals Integration Card */}
        {budget && monthlyBudget > 0 && (
          <Card className="mb-12 p-6 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-zinc-800 dark:to-zinc-700 animate-fade-in-up">
            <CardHeader className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  Smart Budget Planning
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  How your goals affect your monthly spending
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Budget */}
                <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                    ₹{monthlyBudget}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Total Monthly Budget
                  </div>
                </div>

                {/* Goals Savings */}
                <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{Math.round(monthlySavingsNeeded)}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Reserved for Goals
                  </div>
                </div>

                {/* Available for Expenses */}
                <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                  <div
                    className={`text-2xl font-bold ${
                      availableForExpenses > 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    ₹{Math.max(0, Math.round(availableForExpenses))}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Available for Expenses
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Expenses Progress</span>
                    <span>{expensesProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded transition-all duration-500 ${
                        expensesProgress > 80
                          ? "bg-red-500"
                          : expensesProgress > 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: expensesProgress + "%" }}
                    />
                  </div>
                </div>

                {monthlySavingsNeeded > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Goals Savings Progress</span>
                      <span>
                        {Math.round((totalGoalSaved / totalGoalTarget) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-3 overflow-hidden">
                      <div
                        className="h-3 rounded bg-green-500 transition-all duration-500"
                        style={{
                          width:
                            Math.round(
                              (totalGoalSaved / totalGoalTarget) * 100
                            ) + "%",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Alerts */}
              {availableForExpenses < 0 && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 dark:text-red-300 text-sm">
                    Warning: Your goals require more than your monthly budget.
                    Consider adjusting goals or increasing budget.
                  </span>
                </div>
              )}

              {expensesProgress > 80 && (
                <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-700 dark:text-yellow-300 text-sm">
                    You're approaching your expense limit. Consider reducing
                    spending this month.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
          <div className="overflow-x-auto w-full max-w-full">
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
              const isAchieved = percent >= 100;
              const daysLeft = dayjs(goal.deadline).diff(dayjs(), "day");
              const monthlyNeeded =
                daysLeft > 0
                  ? (goal.targetAmount - goal.savedAmount) /
                    Math.max(1, Math.ceil(daysLeft / 30))
                  : 0;

              return (
                <Card
                  key={goal._id}
                  className={`p-6 flex flex-col gap-2 shadow-xl hover:scale-105 transition-transform ${
                    isAchieved
                      ? "ring-2 ring-green-200 dark:ring-green-800"
                      : ""
                  }`}
                >
                  <CardHeader className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-700 dark:text-indigo-200 text-lg">
                        {goal.title}
                      </span>
                      {isAchieved && (
                        <span className="text-green-600 font-bold text-sm bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          Achieved!
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-zinc-500">
                      Target: ₹{goal.targetAmount} | Deadline:{" "}
                      {dayjs(goal.deadline).format("DD MMM YYYY")}
                    </span>
                    {!isAchieved && monthlyNeeded > 0 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full w-fit">
                        Monthly Save: ₹{Math.round(monthlyNeeded)}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-3 overflow-hidden mb-2">
                      <div
                        className={`h-3 rounded transition-all duration-700 ${
                          isAchieved ? "bg-green-500" : "bg-blue-400"
                        }`}
                        style={{ width: percent + "%" }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-600">
                        {percent}% complete (Saved: ₹{goal.savedAmount})
                      </span>
                      {!isAchieved && daysLeft > 0 && (
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          {daysLeft} days left
                        </span>
                      )}
                    </div>
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
