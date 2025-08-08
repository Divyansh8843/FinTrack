import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db";
import Goal from "@/models/Goal";
import User from "@/models/User";
import Notification from "@/models/Notification";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  const { title, targetAmount, savedAmount, deadline, aiRecommendedMonthly } =
    await req.json();
  await dbConnect();
  const goal = await Goal.create({
    userId: session.user._id,
    title,
    targetAmount,
    savedAmount,
    deadline,
    aiRecommendedMonthly,
  });
  // Create notification
  await Notification.create({
    userId: session.user._id,
    type: "goal",
    message: `New goal added: ${title} (Target: ₹${targetAmount})`,
    link: "/goals",
  });
  return NextResponse.json(goal);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  await dbConnect();
  const goals = await Goal.find({ userId: session.user._id }).sort({
    deadline: 1,
  });
  return NextResponse.json(goals);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  const { id, ...update } = await req.json();
  await dbConnect();
  const goal = await Goal.findOneAndUpdate(
    { _id: id, userId: session.user._id },
    update,
    { new: true }
  );
  if (!goal)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  // Create notification
  await Notification.create({
    userId: session.user._id,
    type: "goal",
    message: `Goal updated: ${goal.title}`,
    link: "/goals",
  });
  return NextResponse.json(goal);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  const { id } = await req.json();
  await dbConnect();
  const result = await Goal.deleteOne({ _id: id, userId: session.user._id });
  if (result.deletedCount === 0)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  // Create notification
  await Notification.create({
    userId: session.user._id,
    type: "goal",
    message: `Goal deleted`,
    link: "/goals",
  });
  return NextResponse.json({ success: true });
}
