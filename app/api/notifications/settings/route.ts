import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession();
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ emailSettings: user.emailSettings || {} });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await dbConnect();
  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: { emailSettings: body } },
    { new: true }
  );
  return NextResponse.json({ emailSettings: user.emailSettings || {} });
}
