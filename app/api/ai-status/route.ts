import { NextResponse } from "next/server";

export async function GET() {
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const available = hasOpenRouter || hasGemini;
  const provider = hasGemini ? "gemini" : hasOpenRouter ? "openrouter" : null;
  return NextResponse.json({ available, provider });
}
