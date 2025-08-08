import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  // Optional date range filtering for real-time scoped reports
  const fromParamRaw = req.nextUrl.searchParams.get("from");
  const toParamRaw = req.nextUrl.searchParams.get("to");
  const fromParam =
    fromParamRaw && fromParamRaw !== "undefined" ? fromParamRaw : null;
  const toParam = toParamRaw && toParamRaw !== "undefined" ? toParamRaw : null;
  const dateFilter: { $gte?: Date; $lte?: Date } = {};
  if (fromParam) {
    const d = new Date(fromParam);
    if (!isNaN(d.getTime())) dateFilter.$gte = d;
  }
  if (toParam) {
    const d = new Date(toParam);
    if (!isNaN(d.getTime())) dateFilter.$lte = d;
  }
  const query: { userId: string; date?: { $gte?: Date; $lte?: Date } } = {
    userId: user._id,
  } as unknown as { userId: string; date?: { $gte?: Date; $lte?: Date } };
  if (Object.keys(dateFilter).length) query.date = dateFilter;
  const expenses = await Expense.find(query);
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categories: Record<string, number> = {};
  const merchants: Record<string, number> = {};
  const sources: Record<string, number> = {};
  for (const exp of expenses) {
    categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    if (exp.description)
      merchants[exp.description] =
        (merchants[exp.description] || 0) + exp.amount;
    if (exp.source)
      sources[exp.source] = (sources[exp.source] || 0) + exp.amount;
  }
  return NextResponse.json({ total, categories, merchants, sources });
}
