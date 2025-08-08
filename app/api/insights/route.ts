import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import Goal from "@/models/Goal";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Remove mode; always produce professional detailed outputs
  await req.json().catch(() => ({}));
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  const expenses = await Expense.find({ userId: user._id });
  const goals = await Goal.find({ userId: user._id });

  // Compute quick stats to ground the AI
  const categories: Record<string, number> = {};
  let total = 0;
  let thisMonthTotal = 0;
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  for (const exp of expenses) {
    total += exp.amount || 0;
    const key = String(exp.category || "Other");
    categories[key] = (categories[key] || 0) + (exp.amount || 0);
    const d = new Date(exp.date);
    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
      thisMonthTotal += exp.amount || 0;
    }
  }
  const categoryBreakdown = Object.entries(categories)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
  const topCategory = categoryBreakdown[0]?.category || "-";
  const monthlyBudget = Number(user?.budget?.monthly || 0);
  const budgetProgressPct = monthlyBudget
    ? Math.round((thisMonthTotal / monthlyBudget) * 100)
    : null;
  // Advanced metrics
  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysLeft = Math.max(0, daysInMonth - dayOfMonth);
  const dailyBudgetAllowance = monthlyBudget
    ? Math.round((monthlyBudget / daysInMonth) * 100) / 100
    : null;
  const currentDailyAvg = dayOfMonth
    ? Math.round((thisMonthTotal / dayOfMonth) * 100) / 100
    : null;
  const projectedMonthTotal = currentDailyAvg
    ? Math.round(currentDailyAvg * daysInMonth * 100) / 100
    : null;

  // Week-to-date and last week
  const dayIdx = (now.getDay() + 6) % 7; // Monday=0
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayIdx);
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setMilliseconds(-1);
  let weekToDate = 0;
  let lastWeek = 0;
  const merchantTotals: Record<string, number> = {};
  const sourceTotals: Record<string, number> = {};
  const recurrenceKeyToCount: Record<string, number> = {};
  for (const exp of expenses) {
    const d = new Date(exp.date);
    if (d >= startOfWeek && d <= now) weekToDate += exp.amount || 0;
    if (d >= startOfLastWeek && d <= endOfLastWeek) lastWeek += exp.amount || 0;
    if (exp.description)
      merchantTotals[exp.description] =
        (merchantTotals[exp.description] || 0) + (exp.amount || 0);
    if (exp.source)
      sourceTotals[exp.source] =
        (sourceTotals[exp.source] || 0) + (exp.amount || 0);
    const recurKey = `${exp.description || ""}|${exp.amount || 0}`;
    recurrenceKeyToCount[recurKey] = (recurrenceKeyToCount[recurKey] || 0) + 1;
  }
  const recurringHints = Object.entries(recurrenceKeyToCount)
    .filter(([, count]) => count >= 3)
    .slice(0, 5)
    .map(([key]) => key.split("|")[0])
    .filter(Boolean);
  const categoryBudgets: Record<string, number> =
    (user?.budget?.categories as Record<string, number>) || {};

  // Build a richer prompt for better, actionable output
  const context = {
    totals: { allTime: total, thisMonth: thisMonthTotal, monthlyBudget },
    budgetProgressPct,
    categoryBreakdown,
    topCategory,
    pacing: {
      dayOfMonth,
      daysInMonth,
      daysLeft,
      dailyBudgetAllowance,
      currentDailyAvg,
      projectedMonthTotal,
    },
    weekToDate,
    lastWeek,
    merchantTotals,
    sourceTotals,
    recurringHints,
    categoryBudgets,
    studentType: user?.studentType || null,
    numGoals: goals.length,
    goals: goals.map((g) => ({
      title: g.title,
      targetAmount: g.targetAmount,
      savedAmount: g.savedAmount,
      deadline: g.deadline,
    })),
  };

  // Build model-agnostic messages/prompt
  const messages = [
    {
      role: "system",
      content:
        "Act as a senior student-finance advisor. Use advanced reasoning and be highly specific for Indian students (canteen, books, commute, housing, data packs, shared subscriptions, exam seasons). Be clear, concise, and actionable. Always ground advice in the provided JSON; do not invent numbers. Prefer bullet points. Keep responses under ~220 words. No emojis. Use the ₹ currency symbol when referencing amounts. If budget progress > 80% before day 20, warn strongly. Tailor tips using studentType if present.",
    },
    {
      role: "user",
      content: `Analyze this data and return:\n- Quick Summary (1-2 lines)\n- Overspending Alerts (with categories, amounts, and % of total this month)\n- Savings Tips (3-6 items, specific, measurable, student-relevant)\n- Budget Status (daily allowance, current daily avg, projected month, days left)\n- Goal Suggestions (pace per day/week to meet deadlines)\n- Next Action: <max 12 words>\n\nDATA (JSON): ${JSON.stringify(
        context,
        null,
        2
      )}\nImportant:\n- Reference the student's top spend categories.\n- Give 3-6 concrete tips for this week.\n- If budget progress > 80% before 20th, warn about slowdown.\n- If any category < 5% but necessary (e.g., Books), suggest maintaining.\n- Include student discounts/freebies ideas.\n- Mention recurringHints if they look cancellable or optimizable.\n- Keep to the section headers exactly as above.`,
    },
  ];

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const useGemini = !!geminiKey;
  if (!openrouterKey && !geminiKey)
    return NextResponse.json(
      { error: "No AI API key set (set GEMINI_API_KEY or OPENROUTER_API_KEY)" },
      { status: 500 }
    );

  const endpoint = "https://openrouter.ai/api/v1/chat/completions";
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openrouterKey || ""}`,
  };
  if (process.env.OPENROUTER_SITE_URL)
    headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  if (process.env.OPENROUTER_APP_NAME)
    headers["X-Title"] = process.env.OPENROUTER_APP_NAME;
  const geminiEndpoint = useGemini
    ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`
    : "";
  const systemContent = messages[0].content;
  const userContent = messages[1].content;
  const geminiPrompt = `${systemContent}\n\n${userContent}`;

  try {
    // Retry logic for OpenRouter API
    let response: Response | undefined;
    const retries = 3;
    let lastError: string | null = null;
    for (let i = 0; i < retries; i++) {
      response = await fetch(
        useGemini ? geminiEndpoint : endpoint,
        useGemini
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
                generationConfig: {
                  temperature: 0,
                  topP: 0.9,
                  maxOutputTokens: 480,
                },
              }),
            }
          : {
              method: "POST",
              headers,
              body: JSON.stringify({
                model,
                messages,
                temperature: 0,
                top_p: 0.9,
                max_tokens: 480,
                frequency_penalty: 0,
                presence_penalty: 0,
              }),
            }
      );
      if (response.ok) break;
      if (response.status === 429 || response.status === 503) {
        lastError = await response.text();
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
        continue;
      }
      break;
    }
    if (!response || !response.ok) {
      const error =
        lastError ||
        (response ? await response.text() : "No response from AI service");
      return NextResponse.json(
        { error: error || "AI service unavailable. Please try again later." },
        { status: response?.status || 500 }
      );
    }

    const data = await response.json();
    const raw = useGemini
      ? data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No suggestions generated."
      : data?.choices?.[0]?.message?.content || "No suggestions generated.";
    const suggestions = formatConciseInsights(raw);
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("OpenRouter API error:", err);
    // Fallback: minimal heuristic tips without AI
    const fallback = [
      `Top category: ${topCategory}. Try setting a weekly cap and tracking daily to curb overspending.`,
      monthlyBudget
        ? `This month spent: ₹${thisMonthTotal} out of ₹${monthlyBudget} (${
            budgetProgressPct ?? 0
          }%). Consider a mid-month review and no-spend days if above 70%.`
        : `Set a monthly budget to get proactive alerts and better planning.`,
      `Automate savings: move 10% of inflows to a goal on payday to stay consistent.`,
    ].join("\n- ");
    return NextResponse.json({ suggestions: `- ${fallback}` });
  }
}

function formatConciseInsights(text: string): string {
  // Preserve all sections from the AI, but strip boilerplate and tidy spacing
  const cleaned = text.replace(/\s+$/g, "").replace(/^\s+/g, "");
  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/(as an ai|cannot|sorry|i\b am unable|note:)/i.test(l));
  return lines.join("\n");
}

// Removed truncateWords usage; keep no-op only if referenced in future
