"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/apiClient";
import { toast } from "react-toastify";
import { Calendar, PiggyBank, Trash2, PlusCircle, Goal } from "lucide-react";
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

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [addAmounts, setAddAmounts] = useState<Record<string, number>>({});

  useEffect(() => {
    apiGet<Goal[]>("/api/goals")
      .then(setGoals)
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
      toast.success("Goal added!");
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
    const goal = goals.find((g) => g._id === goalId);
    const amount = Number(addAmounts[goalId] || 0);
    if (!goal || !amount || isNaN(amount)) return;
    const newSaved = Math.max(
      0,
      Math.min(goal.targetAmount, goal.savedAmount + amount)
    );
    try {
      const updated = await apiPut<Goal>("/api/goals", {
        id: goalId,
        savedAmount: newSaved,
      });
      setGoals((prev) => prev.map((g) => (g._id === goalId ? updated : g)));
      setAddAmounts((m) => ({ ...m, [goalId]: 0 }));
      toast.success("Savings added to goal");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
      <div className="py-2 px-2 md:px-0 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl flex items-center justify-center gap-2 md:text-5xl font-extrabold mb-4 text-indigo-700 dark:text-indigo-300 tracking-tight animate-fade-in">
          <Image
            className="h-12 w-12"
            src="/saving.png"
            alt="Savings"
            width={48}
            height={48}
          />
          Savings Goals
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Set, track, and achieve your savings goals. Stay motivated and watch
          your progress grow!
        </p>
        <form
          className="flex flex-col md:flex-row gap-2 mb-8"
          onSubmit={handleAddGoal}
        >
          <input
            type="text"
            placeholder="Goal Title"
            className="border rounded px-4 py-2 flex-1 bg-card text-card-foreground focus:ring-2 focus:ring-primary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Target Amount"
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
            <PlusCircle className="text-pink-500" /> Add
          </Button>
        </form>
        {loading && <Loader label="Loading Goals.." />}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <ul className="space-y-6">
          {goals.length === 0 && !loading && (
            <li className="text-center text-muted-foreground text-lg">
              No goals yet. Start by adding your first savings goal!
            </li>
          )}
          {goals.map((goal) => {
            const percent = Math.min(
              100,
              Math.round((goal.savedAmount / goal.targetAmount) * 100)
            );
            const isAchieved = percent >= 100;
            return (
              <Card key={goal._id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Goal className="text-yellow-600" />
                    <CardTitle>{goal.title}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGoal(goal._id)}
                    aria-label="Delete goal"
                  >
                    <Trash2 className="text-red-500" />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <PiggyBank className="text-blue-500" />{" "}
                    <span className="font-semibold text-foreground">
                      ₹{goal.savedAmount}
                    </span>
                    /<span>₹{goal.targetAmount}</span>
                    <Calendar className="ml-4 text-blue-500" />
                    Deadline:{" "}
                    <span className="font-semibold text-foreground">
                      {dayjs(goal.deadline).format("DD MMM YYYY")}
                    </span>
                    <span className="text-xs text-zinc-500 ml-1">
                      (
                      {Math.max(
                        0,
                        dayjs(goal.deadline)
                          .startOf("day")
                          .diff(dayjs().startOf("day"), "day")
                      )}{" "}
                      days left)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-4 overflow-hidden mt-2">
                    <div
                      className={`transition-all duration-700 h-4 rounded ${
                        isAchieved ? "bg-green-500" : "bg-blue-400"
                      }`}
                      style={{ width: percent + "%" }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-zinc-400">
                      {percent}% complete
                    </span>
                    {isAchieved && (
                      <span className="text-green-600 font-bold text-xs animate-bounce">
                        Goal Achieved! 🎉
                      </span>
                    )}
                  </div>
                  {/* Quick add savings */}
                  {!isAchieved && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        placeholder="Add amount"
                        className="border rounded px-3 py-1 w-36 bg-card text-card-foreground"
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
                        className="h-8 px-4"
                      >
                        Update
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
