"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import AIInsightsCard from "@/components/AIInsightsCard";
import { RefreshCw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
export default function InsightsPage() {
  const [suggestions, setSuggestions] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  // Always advanced-quality outputs by default; toggle removed per request

  const fetchInsights = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      if (aiAvailable === false) return;
      const res = await apiPost<{ suggestions: string }>("/api/insights", {});
      setSuggestions(res.suggestions);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/\b429\b|RESOURCE_EXHAUSTED|quota|rate\s*limit/i.test(msg)) {
        setAiAvailable(false);
        setError(
          "AI is temporarily unavailable due to provider rate limits. Please try again later."
        );
      } else {
        setError(msg);
      }
    } finally {
      setRefreshing(false);
      // Ensure the initial page load completes so UI renders the card
      setLoading(false);
    }
  }, [aiAvailable]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ available: boolean }>("/api/ai-status");
        setAiAvailable(res.available);
      } catch {
        setAiAvailable(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (aiAvailable !== null) fetchInsights();
  }, [aiAvailable, fetchInsights]);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
      <div className="py-2 px-2 md:px-0 max-w-3xl mx-auto w-full overflow-x-hidden">
        <h1 className="text-4xl flex items-center justify-center gap-2 md:text-5xl font-extrabold mb-4 text-indigo-700 dark:text-indigo-300 tracking-tight  animate-fade-in">
          <Lightbulb className="text-yellow-500 animate-pulse h-10 w-10" /> AI
          Insights
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Get smart, actionable suggestions to optimize your spending and boost
          your savings journey!
        </p>
        <div className="flex items-center justify-end mb-4">
          <Button
            onClick={fetchInsights}
            disabled={refreshing || loading || aiAvailable === false}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {aiAvailable === false && (
          <div className="mb-6 p-4 border rounded bg-yellow-50 text-yellow-900 dark:bg-zinc-800 dark:text-yellow-200">
            AI is currently unavailable. Please add an API key in environment variables to view insights.
          </div>
        )}
        {loading && <Loader label="Loading Insights.." />}
        {error && aiAvailable !== false && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
        {!loading && !error && aiAvailable !== false && (
          <div className="break-words">
            <AIInsightsCard suggestions={suggestions} />
          </div>
        )}
      </div>
    </main>
  );
}
