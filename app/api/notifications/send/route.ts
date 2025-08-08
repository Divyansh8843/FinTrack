import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Expense from "@/models/Expense";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - add @types/nodemailer for types
import nodemailer from "nodemailer";
import dayjs from "dayjs";
import { buildEmailHtml } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    period = "month",
    toEmail,
    pdfBase64,
    pdfFilename,
  } = await req.json();
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const parentEmail = toEmail || user.emailSettings?.parentEmail;
  if (!parentEmail)
    return NextResponse.json(
      { error: "Parent email not set" },
      { status: 400 }
    );
  const start =
    period === "year" ? dayjs().startOf("year") : dayjs().startOf("month");
  const end =
    period === "year" ? dayjs().endOf("year") : dayjs().endOf("month");
  const expenses = await Expense.find({
    userId: (user as unknown as { _id: string })._id,
    date: { $gte: start.toDate(), $lte: end.toDate() },
  });
  const total = expenses.reduce(
    (s: number, e: { amount?: number }) => s + (e.amount || 0),
    0
  );
  let topCategory = "";
  const cat: Record<string, number> = {};
  expenses.forEach((e: { category: string; amount?: number }) => {
    cat[e.category] = (cat[e.category] || 0) + (e.amount || 0);
  });
  const top = Object.entries(cat).sort((a, b) => b[1] - a[1])[0];
  if (top) topCategory = top[0];

  const html = buildEmailHtml({
    studentName: user.name || "Student",
    periodLabel:
      period === "year" ? dayjs().format("YYYY") : dayjs().format("MMMM YYYY"),
    total,
    topCategory,
    message: "Attached is the detailed spending report as a PDF.",
  });

  // Simple transport: expects SMTP envs set
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const mailOptions: {
    from: string;
    to: string;
    subject: string;
    html: string;
    attachments?: { filename: string; content: Buffer }[];
  } = {
    from: process.env.MAIL_FROM || "no-reply@spendtracker.app",
    to: parentEmail,
    subject: `Expense Report of ${user.name || "student"} (${
      period === "year" ? dayjs().format("YYYY") : dayjs().format("MMMM YYYY")
    })`,
    html,
  };
  if (pdfBase64 && pdfFilename) {
    mailOptions.attachments = [
      {
        filename: pdfFilename,
        content: Buffer.from(pdfBase64, "base64"),
      },
    ];
  }
  const info = await transporter.sendMail(mailOptions);

  return NextResponse.json({ success: true, messageId: info.messageId });
}
