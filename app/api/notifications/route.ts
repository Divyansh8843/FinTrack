import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  const { type, message, link } = await req.json();
  await dbConnect();
  const notification = await Notification.create({
    userId: session.user._id,
    type,
    message,
    link,
  });
  return NextResponse.json(notification);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  await dbConnect();
  const notifications = await Notification.find({
    userId: session.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(6);
  // Auto-delete older than the newest 6
  const keepIds = notifications.map((n) => n._id);
  await Notification.deleteMany({
    userId: session.user._id,
    _id: { $nin: keepIds },
  });
  return NextResponse.json(notifications);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  const { id, ...update } = await req.json();
  await dbConnect();
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: session.user._id },
    update,
    { new: true }
  );
  if (!notification)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  return NextResponse.json(notification);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user && !("_id" in session.user)) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) session.user._id = dbUser._id.toString();
  }
  const { id } = await req.json();
  await dbConnect();
  const result = await Notification.deleteOne({
    _id: id,
    userId: session.user._id,
  });
  if (result.deletedCount === 0)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  return NextResponse.json({ success: true });
}
