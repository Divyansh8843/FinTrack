"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { toast } from "react-toastify";
import {
  Wallet,
  Plus,
  Trash2,
  AlertCircle,
  Target,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import useSWR from "swr";

interface Budget {
  monthly: number;
  categories: Record<string, number>;
}

interface Goal {
  _id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  aiRecommendedMonthly?: number;
}

export default function BudgetPage() {
  const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then((r) => {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    });

  const {
    data,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<{ budget: Budget }>("/api/budget", fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const [budget, setBudget] = useState<Budget | null>(null);
  const [monthly, setMonthly] = useState(0);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Initialize local edit state when server data loads/changes
  useEffect(() => {
    if (data?.budget) {
      setBudget(data.budget);
      setMonthly(data.budget.monthly || 0);
      setCategories(data.budget.categories || {});
    }
  }, [data]);

  // Fetch goals for smart suggestions
  useEffect(() => {
    apiGet<Goal[]>("/api/goals")
      .then(setGoals)
      .catch(() => {});
  }, []);

  async function handleBudgetUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiPost<{ budget: Budget }>("/api/budget", { monthly, categories });
      setBudget({ monthly, categories });
      // Revalidate to fetch latest server state
      mutate();
      toast.success("Budget updated successfully!");
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to update budget";
      toast.error(errorMessage);
      console.error("Budget update error:", e);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCategoryChange(cat: string, value: number) {
    setCategories((prev) => ({ ...prev, [cat]: value }));
  }

  function handleAddCategory() {
    setCategories((prev) => ({ ...prev, "": 0 }));
  }

  function handleRemoveCategory(cat: string) {
    setCategories((prev) => {
      const updated = { ...prev };
      delete updated[cat];
      return updated;
    });
  }

  function handleCategoryNameChange(oldCat: string, newCat: string) {
    if (!newCat.trim()) return; // Don't allow empty category names

    setCategories((prev) => {
      const updated = { ...prev };
      const val = updated[oldCat];
      delete updated[oldCat];
      updated[newCat.trim()] = val;
      return updated;
    });
  }

  // Smart budget suggestions based on goals
  const getSmartSuggestions = () => {
    if (goals.length === 0) return null;

    const activeGoals = goals.filter((goal) => {
      const daysLeft = new Date(goal.deadline).getTime() - new Date().getTime();
      return daysLeft > 0 && goal.savedAmount < goal.targetAmount;
    });

    if (activeGoals.length === 0) return null;

    const suggestions: Record<string, number> = {};
    activeGoals.forEach((goal) => {
      const daysLeft = new Date(goal.deadline).getTime() - new Date().getTime();
      const monthsLeft = Math.max(
        1,
        Math.ceil(daysLeft / (1000 * 60 * 60 * 24 * 30))
      );
      const monthlyNeeded = (goal.targetAmount - goal.savedAmount) / monthsLeft;

      // Create smart category names
      const categoryName = `🎯 ${goal.title}`;
      suggestions[categoryName] = Math.round(monthlyNeeded);
    });

    return suggestions;
  };

  const smartSuggestions = getSmartSuggestions();
  const totalCategoriesBudget = Object.values(categories).reduce(
    (sum, val) => sum + val,
    0
  );
  const budgetBalance = monthly - totalCategoriesBudget;

  // Show loading state
  if (isLoading && !budget) {
    return (
      <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
        <div className="py-2 px-2 md:px-0 max-w-2xl mx-auto w-full">
          <Loader label="Loading your budget..." />
        </div>
      </main>
    );
  }

  // Show error state
  if (swrError && !budget) {
    return (
      <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
        <div className="py-2 px-2 md:px-0 max-w-2xl mx-auto w-full">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Failed to Load Budget
            </h2>
            <p className="text-muted-foreground mb-4">
              {swrError.message ||
                "Something went wrong while loading your budget"}
            </p>
            <Button onClick={() => mutate()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
      <div className="py-2 px-2 md:px-0 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center justify-center gap-2 mb-2 text-primary">
          <Wallet className="text-green-600" /> Smart Budget Planning
        </h1>
        <p className="text-muted-foreground mb-8 text-lg text-center">
          Set your monthly budget and category limits. We&apos;ll help you plan for
          both expenses and savings goals!
        </p>

        {/* Budget Overview Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-zinc-800 dark:to-zinc-700 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <TrendingUp className="w-5 h-5" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                ₹{monthly}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Total Monthly Budget
              </div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{totalCategoriesBudget}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Allocated to Categories
              </div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
              <div
                className={`text-2xl font-bold ${
                  budgetBalance >= 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                ₹{budgetBalance}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {budgetBalance >= 0 ? "Remaining" : "Over Budget"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Smart Goal Suggestions */}
        {smartSuggestions && Object.keys(smartSuggestions).length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Target className="w-5 h-5" />
                Smart Goal Suggestions
              </CardTitle>
              <p className="text-sm text-green-600 dark:text-green-400">
                Based on your active goals, here are suggested monthly savings
                amounts:
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {Object.entries(smartSuggestions).map(([category, amount]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg shadow"
                  >
                    <span className="font-medium text-green-700 dark:text-green-300">
                      {category}
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      ₹{amount}/month
                    </span>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => {
                  const updatedCategories = { ...categories };
                  Object.entries(smartSuggestions).forEach(([cat, amount]) => {
                    if (!categories[cat]) {
                      updatedCategories[cat] = amount;
                    }
                  });
                  setCategories(updatedCategories);
                  toast.success("Goal-based categories added to your budget!");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Goal Categories to Budget
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Budget Form */}
        <Card className="mb-8 bg-white dark:bg-zinc-900 shadow-lg">
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={handleBudgetUpdate}>
              <div>
                <label className="block font-semibold mb-2 text-foreground">
                  Monthly Budget (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="border rounded-lg px-4 py-3 w-full bg-card text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  placeholder="Enter your monthly budget"
                  required
                />
                <p className="text-sm text-zinc-500 mt-1">
                  This is your total monthly spending limit including expenses
                  and savings
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-foreground">
                  Category Budgets
                </label>
                <div className="space-y-3">
                  {Object.entries(categories).map(([cat, value], idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-muted/30 rounded-lg"
                    >
                      <input
                        type="text"
                        className="border rounded-lg px-3 py-2 w-full sm:flex-1 bg-card text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        value={cat}
                        onChange={(e) =>
                          handleCategoryNameChange(cat, e.target.value)
                        }
                        placeholder="Category name (e.g., Food, Transport, Phone Goal)"
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="border rounded-lg px-3 py-2 w-full sm:w-32 bg-card text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        value={value}
                        onChange={(e) =>
                          handleCategoryChange(cat, Number(e.target.value))
                        }
                        placeholder="Amount"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCategory(cat)}
                        aria-label="Remove category"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}

                  {Object.keys(categories).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No categories set. Add your first category below!
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                    onClick={handleAddCategory}
                  >
                    <Plus className="h-4 w-4 text-green-600" /> Add Category
                  </Button>
                </div>
              </div>

              {/* Budget Balance Warning */}
              {budgetBalance < 0 && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Budget Warning</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Your category budgets exceed your monthly budget by ₹
                    {Math.abs(budgetBalance)}. Consider reducing some category
                    amounts or increasing your monthly budget.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-3 text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Budget"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tips for Students */}
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <PiggyBank className="w-5 h-5" />
              Student Budgeting Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Set aside 20-30% of your budget for savings goals</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>
                    Include categories for books, stationery, and study
                    materials
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>
                    Plan for exam season expenses (extra food, transport)
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Keep emergency fund for unexpected expenses</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>
                    Track your spending to identify saving opportunities
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Review and adjust your budget monthly</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
