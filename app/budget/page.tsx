"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { toast } from "react-toastify";
import { Wallet, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
interface Budget {
  monthly: number;
  categories: Record<string, number>;
}

export default function BudgetPage() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [monthly, setMonthly] = useState(0);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ budget: Budget }>("/api/budget")
      .then((data) => {
        setBudget(data.budget);
        setMonthly(data.budget?.monthly || 0);
        setCategories(data.budget?.categories || {});
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e))
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleBudgetUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiPost<{ budget: Budget }>("/api/budget", { monthly, categories });
      setBudget({ monthly, categories });
      toast.success("Budget updated!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  function handleCategoryChange(cat: string, value: number) {
    setCategories((prev) => ({ ...prev, [cat]: value }));
  }

  function handleAddCategory() {
    setCategories((prev) => ({ ...prev, "": 0 }));
  }

  return (
    <main className="py-10 px-2 md:px-0 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-2 mb-2 text-primary">
        <Wallet className="text-green-600" /> Budget
      </h1>
      <p className="text-muted-foreground mb-8 text-lg">
        Set your monthly and category budgets to stay on track with your
        spending goals!
      </p>
      {loading && <Loader label="Loading Budget.." />}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {budget && (
        <Card className="mb-8 bg-white dark:bg-zinc-900">
          <CardContent>
            <form className="space-y-4" onSubmit={handleBudgetUpdate}>
              <div>
                <label className="block font-medium mb-1">Monthly Budget</label>
                <input
                  type="number"
                  className="border rounded px-4 py-2 w-full bg-card text-card-foreground focus:ring-2 focus:ring-primary"
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Category Budgets
                </label>
                <div className="space-y-2">
                  {Object.entries(categories).map(([cat, value], idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="border rounded px-4 py-2 flex-1 bg-card text-card-foreground focus:ring-2 focus:ring-primary"
                        value={cat}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setCategories((prev) => {
                            const updated = { ...prev };
                            const val = updated[cat];
                            delete updated[cat];
                            updated[newCat] = val;
                            return updated;
                          });
                        }}
                        required
                      />
                      <input
                        type="number"
                        className="border rounded px-4 py-2 w-24 bg-card text-card-foreground focus:ring-2 focus:ring-primary"
                        value={value}
                        onChange={(e) =>
                          handleCategoryChange(cat, Number(e.target.value))
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCategories((prev) => {
                            const updated = { ...prev };
                            delete updated[cat];
                            return updated;
                          });
                        }}
                        aria-label="Remove category"
                      >
                        <Trash2 className="text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={handleAddCategory}
                  >
                    <Plus className="text-green-600" /> Add Category
                  </Button>
                </div>
              </div>
              <Button type="submit" className="mt-2 w-full">
                Update Budget
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="mt-8 text-center text-xs text-muted-foreground italic">
        &quot;A budget is telling your money where to go instead of wondering
        where it went!&quot;
      </div>
    </main>
  );
}
