import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ budget: user.budget });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  const { monthly, categories } = await req.json();
  await dbConnect();
  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: { "budget.monthly": monthly, "budget.categories": categories } },
    { new: true }
  );
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  // Create notification
  await Notification.create({
    userId: session.user._id,
    type: "budget",
    message: `Budget updated: ₹${monthly}`,
    link: "/profile",
  });
  return NextResponse.json({ budget: user.budget });
}
