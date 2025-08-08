import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import User from "@/models/User";
import Notification from "@/models/Notification";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  console.log("Session in expenses API (POST):", session);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }

  const { amount, category, date, description, source, imageUrl } =
    await req.json();
  await dbConnect();
  const userId = session.user?._id;
  if (!userId)
    return NextResponse.json(
      { error: "User ID missing in session." },
      { status: 401 }
    );
  const expense = await Expense.create({
    userId,
    amount,
    category,
    date,
    description,
    source,
    imageUrl,
  });
  // Create a notification for the user
  await Notification.create({
    userId,
    type: "expense",
    message: `New expense added: ₹${amount} (${category})`,
    link: "/dashboard",
  });
  return NextResponse.json(expense);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  console.log("Session in expenses API (GET):", session);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  await dbConnect();
  const userId = session.user?._id;
  if (!userId)
    return NextResponse.json(
      { error: "User ID missing in session." },
      { status: 401 }
    );
  const expenses = await Expense.find({ userId }).sort({ date: -1 });
  return NextResponse.json(expenses);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  console.log("Session in expenses API (PUT):", session);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  const { id, ...update } = await req.json();
  await dbConnect();
  const userId = session.user?._id;
  if (!userId)
    return NextResponse.json(
      { error: "User ID missing in session." },
      { status: 401 }
    );
  const expense = await Expense.findOneAndUpdate({ _id: id, userId }, update, {
    new: true,
  });
  if (!expense)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  return NextResponse.json(expense);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  console.log("Session in expenses API (DELETE):", session);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  const { id } = await req.json();
  await dbConnect();
  const userId = session.user?._id;
  if (!userId)
    return NextResponse.json(
      { error: "User ID missing in session." },
      { status: 401 }
    );
  const result = await Expense.deleteOne({ _id: id, userId });
  if (result.deletedCount === 0)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  return NextResponse.json({ success: true });
}
