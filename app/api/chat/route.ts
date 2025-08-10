import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import Goal from "@/models/Goal";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { message }: { message?: string } = await req.json();
  if (!message)
    return NextResponse.json({ error: "No message provided" }, { status: 400 });

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const useGemini = !!geminiKey;
  if (!openrouterKey && !geminiKey)
    return NextResponse.json(
      { error: "No AI API key set (set GEMINI_API_KEY or OPENROUTER_API_KEY)" },
      { status: 500 }
    );

  // Fetch user context to enable data-aware replies
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  const expenses = user
    ? await Expense.find({ userId: user._id }).limit(100)
    : [];
  const goals = user ? await Goal.find({ userId: user._id }).limit(20) : [];

  // Compute quick stats to ground answers in real data
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
  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const dailyBudgetAllowance = monthlyBudget
    ? Math.round((monthlyBudget / daysInMonth) * 100) / 100
    : null;
  const currentDailyAvg = dayOfMonth
    ? Math.round((thisMonthTotal / dayOfMonth) * 100) / 100
    : null;

  const brief = {
    totals: { allTime: total, thisMonth: thisMonthTotal, monthlyBudget },
    budgetProgressPct,
    topCategory,
    categoryBreakdown: categoryBreakdown.slice(0, 5),
    latestExpenses: expenses
      .slice(0, 10)
      .map((e) => ({ amount: e.amount, category: e.category, date: e.date })),
    goals: goals.map((g) => ({
      title: g.title,
      targetAmount: g.targetAmount,
      savedAmount: g.savedAmount,
      deadline: g.deadline,
    })),
    pacing: { dayOfMonth, daysInMonth, dailyBudgetAllowance, currentDailyAvg },
    studentType: user?.studentType || null,
  };

  const endpoint = "https://openrouter.ai/api/v1/chat/completions";
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openrouterKey || ""}`,
  };
  if (process.env.OPENROUTER_SITE_URL) {
    headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }
  if (process.env.OPENROUTER_APP_NAME) {
    headers["X-Title"] = process.env.OPENROUTER_APP_NAME;
  }
  const geminiEndpoint = useGemini
    ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`
    : "";

  const messages = [
    {
      role: "system",
      content:
        "Act as a senior student-finance advisor with advanced reasoning. Be India-specific where relevant (canteen, local transport, data packs, shared OTT, exam seasons). Always ground advice in the provided JSON data; do not invent numbers. If a figure is not in context, say 'Not available'. Prefer bullet points. Keep responses under ~160 words. No emojis. Use the ₹ currency symbol when referencing amounts. When possible, quantify tips using budgetProgressPct and pacing.",
    },
    {
      role: "user",
      content: `Context (JSON): ${JSON.stringify(
        brief
      )}\n\nUser question: ${message}\n\nRespond EXACTLY in this format (use '-' bullets only):\n- Brief answer (1-2 sentences)\n- 3 bullets (max 12 words each) with specific steps referencing figures from context\n- One final line: Next action: <12 words>`,
    },
  ];
  const systemContent = messages[0].content;
  const userContent = messages[1].content;
  const geminiPrompt = `${systemContent}\n\n${userContent}`;

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
                maxOutputTokens: 360,
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
              max_tokens: 360,
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
    ? data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply generated."
    : data?.choices?.[0]?.message?.content || "No reply generated.";
  const reply = formatConciseReply(raw);
  return NextResponse.json({ reply });
}

function formatConciseReply(text: string): string {
  const cleaned = text.replace(/\s+$/g, "").replace(/^\s+/g, "");
  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  // Remove disclaimers/preambles
  const filtered = lines.filter(
    (l) => !/(as an ai|cannot|sorry|i\b am unable|note:)/i.test(l)
  );
  // Normalize any bullet markers (*, -, •) to '- '
  const normalized = filtered.map((l) => l.replace(/^\s*[\-*•]\s+/, "- "));
  const bullets = normalized.filter((l) => /^-\s/.test(l));
  const nonBullets = normalized.filter((l) => !/^-\s/.test(l));

  const summary = truncateWords(nonBullets.join(" "), 30); // ~1-2 sentences
  const pickedBullets = bullets
    .slice(0, 3)
    .map((b) => truncateWords(b.replace(/^-\s*/, "• "), 12));
  const nextAction = ((): string => {
    const hint = normalized.find((l) => /next action|do today|today:/i.test(l));
    if (hint)
      return `Next action: ${truncateWords(
        hint.replace(/^[^:]*:/, "").trim(),
        12
      )}`;
    // fallback: derive from first bullet
    return pickedBullets[0]
      ? `Next action: ${pickedBullets[0].replace(/^•\s*/, "")}`
      : "";
  })();

  const finalParts = [summary, ...pickedBullets, nextAction].filter(Boolean);
  const finalText = finalParts.join("\n").trim();
  return truncateWords(finalText, 120); // hard cap words
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "…";
}
