"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import ProductionImage from "@/components/ProductionImage";
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/apiClient";
import { toast } from "react-toastify";
import {
  Calendar,
  PiggyBank,
  Trash2,
  PlusCircle,
  Goal,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

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

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [addAmounts, setAddAmounts] = useState<Record<string, number>>({});
  const [showCompletedGoals, setShowCompletedGoals] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<Goal[]>("/api/goals"),
      apiGet<{ budget: Budget }>("/api/budget")
        .then((res) => res.budget)
        .catch(() => null),
    ])
      .then(([goals, budget]) => {
        setGoals(goals);
        setBudget(budget);
        setError(null);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e))
      )
      .finally(() => setLoading(false));

    // Poll for real-time updates
    const interval = setInterval(() => {
      apiGet<Goal[]>("/api/goals")
        .then(setGoals)
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault();
    try {
      const newGoal = await apiPost<Goal>("/api/goals", {
        title,
        targetAmount,
        savedAmount: 0,
        deadline,
      });
      setGoals((prev) => [...prev, newGoal]);
      setTitle("");
      setTargetAmount(0);
      setDeadline("");
      toast.success("Goal added successfully!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleDeleteGoal(id: string) {
    try {
      await apiDelete<{ success: boolean }>("/api/goals", { id });
      setGoals((prev) => prev.filter((g) => g._id !== id));
      toast.success("Goal deleted!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleAddSavings(goalId: string) {
    const amount = addAmounts[goalId];
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const goal = goals.find((g) => g._id === goalId);
      if (!goal) return;

      const newSavedAmount = goal.savedAmount + amount;
      await apiPut<Goal>("/api/goals", {
        id: goalId,
        savedAmount: newSavedAmount,
      });

      setGoals((prev) =>
        prev.map((g) =>
          g._id === goalId ? { ...g, savedAmount: newSavedAmount } : g
        )
      );
      setAddAmounts((prev) => ({ ...prev, [goalId]: 0 }));
      toast.success(`Added ₹${amount} to ${goal.title}!`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  // Calculate smart insights
  const activeGoals = goals.filter((goal) => {
    const daysLeft = dayjs(goal.deadline).diff(dayjs(), "day");
    return daysLeft > 0 && goal.savedAmount < goal.targetAmount;
  });

  const completedGoals = goals.filter(
    (goal) => goal.savedAmount >= goal.targetAmount
  );

  const totalGoalTarget = goals.reduce(
    (sum, goal) => sum + goal.targetAmount,
    0
  );
  const totalGoalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const overallProgress =
    totalGoalTarget > 0
      ? Math.round((totalGoalSaved / totalGoalTarget) * 100)
      : 0;

  // Calculate monthly savings needed
  const monthlySavingsNeeded = activeGoals.reduce((sum, goal) => {
    const daysLeft = dayjs(goal.deadline).diff(dayjs(), "day");
    const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
    const remainingAmount = goal.targetAmount - goal.savedAmount;
    return sum + remainingAmount / monthsLeft;
  }, 0);

  // Budget integration insights
  const budgetAvailable = budget?.monthly || 0;
  const budgetForGoals = budgetAvailable * 0.3; // Recommend 30% for goals
  const budgetStatus =
    budgetForGoals >= monthlySavingsNeeded ? "good" : "warning";

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
        <div className="py-2 px-2 md:px-0 max-w-3xl mx-auto w-full">
          <Loader label="Loading your goals..." />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
      <div className="py-2 px-2 md:px-0 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl flex items-center justify-center gap-2 md:text-5xl font-extrabold mb-4 text-indigo-700 dark:text-indigo-300 tracking-tight animate-fade-in">
          <ProductionImage
            className="h-12 w-12"
            src="/saving.png"
            alt="Savings"
            width={48}
            height={48}
          />
          Smart Savings Goals
        </h1>
        <p className="text-muted-foreground mb-8 text-lg text-center">
          Set, track, and achieve your savings goals with smart budget
          integration!
        </p>

        {/* Goals Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
          <Card className="text-center p-6 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center gap-2">
              <Target className="w-8 h-8 text-indigo-600" />
              <span className="text-lg font-semibold">Total Goals</span>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                {goals.length}
              </span>
            </CardContent>
          </Card>

          <Card className="text-center p-6 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center gap-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-lg font-semibold">Active Goals</span>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-green-700 dark:text-green-300">
                {activeGoals.length}
              </span>
            </CardContent>
          </Card>

          <Card className="text-center p-6 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-yellow-600" />
              <span className="text-lg font-semibold">Completed</span>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                {completedGoals.length}
              </span>
            </CardContent>
          </Card>

          <Card className="text-center p-6 shadow-xl hover:scale-105 transition-transform">
            <CardHeader className="flex flex-col items-center gap-2">
              <PiggyBank className="w-8 h-8 text-blue-600" />
              <span className="text-lg font-semibold">Progress</span>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {overallProgress}%
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Smart Budget Integration */}
        {budget && budgetAvailable > 0 && (
          <Card className="mb-8 p-6 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-zinc-800 dark:to-zinc-700 animate-fade-in-up">
            <CardHeader className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Lightbulb className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  Budget Integration
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  How your goals align with your monthly budget
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                    ₹{budgetAvailable}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Monthly Budget
                  </div>
                </div>

                <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{Math.round(budgetForGoals)}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Recommended for Goals (30%)
                  </div>
                </div>

                <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{Math.round(monthlySavingsNeeded)}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Needed for Active Goals
                  </div>
                </div>
              </div>

              {/* Budget Status */}
              <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Budget Status for Goals</span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      budgetStatus === "good"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {budgetStatus === "good" ? "✅ Good" : "⚠️ Warning"}
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded transition-all duration-500 ${
                      budgetStatus === "good" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                    style={{
                      width:
                        Math.min(
                          100,
                          (monthlySavingsNeeded / budgetForGoals) * 100
                        ) + "%",
                    }}
                  />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  {budgetStatus === "good"
                    ? `Great! Your budget can comfortably support your goals. You have ₹${Math.round(
                        budgetForGoals - monthlySavingsNeeded
                      )} extra for additional savings.`
                    : `Your goals require ₹${Math.round(
                        monthlySavingsNeeded - budgetForGoals
                      )} more than recommended. Consider adjusting goals or increasing your budget.`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Goal Form */}
        <Card className="mb-8 p-6 shadow-xl bg-white dark:bg-zinc-900 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <PlusCircle className="w-5 h-5 text-pink-500" />
              Add New Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col md:flex-row gap-3"
              onSubmit={handleAddGoal}
            >
              <input
                type="text"
                placeholder="Goal Title (e.g., New Phone, College Trip)"
                className="border rounded px-4 py-2 flex-1 bg-card text-card-foreground focus:ring-2 focus:ring-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Target Amount (₹)"
                className="border rounded px-4 py-2 w-36 bg-card text-card-foreground focus:ring-2 focus:ring-primary"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                required
              />
              <input
                type="date"
                className="border rounded px-4 py-2 w-44 bg-card text-card-foreground focus:ring-2 focus:ring-primary"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="h-auto px-6 py-2 flex gap-2 items-center"
              >
                <PlusCircle className="text-pink-500" /> Add Goal
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Goals Filter */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            Your Goals
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={showCompletedGoals ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCompletedGoals(true)}
            >
              All Goals
            </Button>
            <Button
              variant={!showCompletedGoals ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCompletedGoals(false)}
            >
              Active Only
            </Button>
          </div>
        </div>

        {/* Goals List */}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <div className="space-y-6">
          {goals.length === 0 && !loading && (
            <Card className="text-center p-12 bg-white dark:bg-zinc-900 shadow-xl">
              <Goal className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                No goals yet
              </h3>
              <p className="text-zinc-500 dark:text-zinc-500 mb-4">
                Start by adding your first savings goal above!
              </p>
            </Card>
          )}

          {goals
            .filter(
              (goal) =>
                showCompletedGoals || goal.savedAmount < goal.targetAmount
            )
            .map((goal) => {
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
                  className={`relative shadow-xl hover:scale-105 transition-transform ${
                    isAchieved
                      ? "ring-2 ring-green-200 dark:ring-green-800 bg-green-50 dark:bg-green-950/30"
                      : "bg-white dark:bg-zinc-900"
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Goal
                        className={`w-6 h-6 ${
                          isAchieved ? "text-green-600" : "text-yellow-600"
                        }`}
                      />
                      <CardTitle
                        className={
                          isAchieved ? "text-green-700 dark:text-green-300" : ""
                        }
                      >
                        {goal.title}
                      </CardTitle>
                      {isAchieved && (
                        <span className="text-green-600 font-bold text-sm bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          Achieved!
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal._id)}
                      aria-label="Delete goal"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <PiggyBank className="text-blue-500" />
                        <span className="font-semibold text-foreground">
                          ₹{goal.savedAmount}
                        </span>
                        /<span>₹{goal.targetAmount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="text-blue-500" />
                        <span className="font-semibold text-foreground">
                          {dayjs(goal.deadline).format("DD MMM YYYY")}
                        </span>
                        {!isAchieved && daysLeft > 0 && (
                          <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                            {daysLeft} days left
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-4 overflow-hidden">
                      <div
                        className={`transition-all duration-700 h-4 rounded ${
                          isAchieved ? "bg-green-500" : "bg-blue-400"
                        }`}
                        style={{ width: percent + "%" }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {percent}% complete
                      </span>
                      {!isAchieved && monthlyNeeded > 0 && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                          Save ₹{Math.round(monthlyNeeded)}/month
                        </span>
                      )}
                    </div>

                    {/* Add Savings Form */}
                    {!isAchieved && (
                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                        <input
                          type="number"
                          min={0}
                          placeholder="Add amount"
                          className="border rounded px-3 py-2 w-36 bg-card text-card-foreground focus:ring-2 focus:ring-primary"
                          value={addAmounts[goal._id] ?? 0}
                          onChange={(e) =>
                            setAddAmounts((m) => ({
                              ...m,
                              [goal._id]: Number(e.target.value),
                            }))
                          }
                        />
                        <Button
                          type="button"
                          onClick={() => handleAddSavings(goal._id)}
                          className="h-10 px-4"
                        >
                          Update Progress
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Student Tips */}
        <Card className="mt-12 bg-gradient-to-r from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Lightbulb className="w-5 h-5" />
              Smart Goal Setting Tips for Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">🎯</span>
                  <div>
                    <span className="font-medium">Set Realistic Deadlines</span>
                    <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                      Consider your exam schedule and holidays when setting
                      deadlines
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">💰</span>
                  <div>
                    <span className="font-medium">Start Small</span>
                    <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                      Begin with smaller goals to build confidence and momentum
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">📚</span>
                  <div>
                    <span className="font-medium">Include Study Expenses</span>
                    <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                      Plan for books, courses, and study materials
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">📅</span>
                  <div>
                    <span className="font-medium">Monthly Milestones</span>
                    <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                      Break big goals into monthly savings targets
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">🚨</span>
                  <div>
                    <span className="font-medium">Emergency Fund First</span>
                    <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                      Build a small emergency fund before major goals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">🔄</span>
                  <div>
                    <span className="font-medium">Review Regularly</span>
                    <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                      Adjust goals based on changing circumstances
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
