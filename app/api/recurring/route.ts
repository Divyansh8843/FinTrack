import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import RecurringExpense from "@/models/RecurringExpense";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const dbUserPost = await User.findOne({ email: session.user.email });
  const userId = dbUserPost?._id?.toString() ?? session.user._id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const {
    amount,
    category,
    description,
    startDate,
    frequency,
    nextDueDate,
    active,
  } = await req.json();
  const recurring = await RecurringExpense.create({
    userId,
    amount,
    category,
    description,
    startDate,
    frequency,
    nextDueDate,
    active,
  });
  return NextResponse.json(recurring);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const dbUserGet = await User.findOne({ email: session.user.email });
  const userId = dbUserGet?._id?.toString() ?? session.user._id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const recurrings = await RecurringExpense.find({
    userId,
  }).sort({ nextDueDate: 1 });
  return NextResponse.json(recurrings);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...update } = await req.json();
  await dbConnect();
  const dbUserPut = await User.findOne({ email: session.user.email });
  const userId = dbUserPut?._id?.toString() ?? session.user._id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const recurring = await RecurringExpense.findOneAndUpdate(
    { _id: id, userId },
    update,
    { new: true }
  );
  if (!recurring)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  return NextResponse.json(recurring);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await dbConnect();
  const dbUserDelete = await User.findOne({ email: session.user.email });
  const userId = dbUserDelete?._id?.toString() ?? session.user._id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await RecurringExpense.deleteOne({
    _id: id,
    userId,
  });
  if (result.deletedCount === 0)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  return NextResponse.json({ success: true });
}
