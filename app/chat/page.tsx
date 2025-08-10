"use client";

import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { SendHorizonal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductionImage from "@/components/ProductionImage";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  // Advanced mode and scroll-to-top states removed to satisfy ESLint (unused)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Removed scroll state handlers

  // Prevent background scroll when focusing/scrolling inside chat container on touch devices
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      // Allow scroll inside the chat container only
      if (
        (el.scrollTop === 0 && e.touches[0].clientY > 0) ||
        (Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight &&
          e.touches[0].clientY < 0)
      ) {
        // Reached top or bottom; prevent body scroll bounce
        e.preventDefault();
      }
      e.stopPropagation();
    };
    el.addEventListener("touchmove", onTouchMove as EventListener, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove as EventListener);
  }, []);

  // Removed scroll-to-top handler

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Preflight: check AI availability
  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ available: boolean }>("/api/ai-status");
        setAiAvailable(res.available);
      } catch {
        setAiAvailable(false);
      }
    })();
  }, []);

  // Removed page scroll event listener

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ reply: string }>("/api/chat", {
        message: input,
        mode: "advanced",
      });
      setMessages((prev) => [...prev, { sender: "bot", text: res.reply }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // If provider returned quota / rate limit, disable AI for this session
      if (/\b429\b|RESOURCE_EXHAUSTED|quota|rate\s*limit/i.test(msg)) {
        setAiAvailable(false);
        setError(
          "AI is temporarily unavailable due to provider rate limits. Please try again later."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  return (
    <main className="min-h-screen w-full bg-background text-foreground p-4">
      <div className="py-2 px-2 md:px-0 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl flex items-center justify-center gap-2 md:text-5xl font-extrabold tracking-tight animate-fade-in">
          <ProductionImage
            className="h-20 w-20"
            src="/chatbot.png"
            alt="ChatBot"
            width={80}
            height={80}
          />
          Finance Chatbot
        </h1>
        <p className="text-muted-foreground mb-6 text-lg">
          Ask anything about student finance, budgeting, or saving. Get instant,
          AI-powered answers!
        </p>
        {aiAvailable === false && (
          <div className="mb-6 p-4 border rounded bg-yellow-50 text-yellow-900 dark:bg-zinc-800 dark:text-yellow-200">
            AI is currently unavailable. Please add an API key in environment variables to use the chatbot.
          </div>
        )}
        <Card className="mb-6 bg-card border" aria-hidden={aiAvailable === false}>
          <CardContent
            ref={chatContainerRef}
            onWheel={(e) => e.stopPropagation()}
            className="h-[30vh] md:h-[40vh] overflow-y-auto overscroll-y-contain touch-pan-y custom-scrollbar flex flex-col gap-2 relative"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {messages.length === 0 && (
              <div className="text-zinc-400">Start the conversation!</div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={msg.sender === "user" ? "text-right" : "text-left"}
              >
                <span
                  className={
                    msg.sender === "user"
                      ? "bg-indigo-100 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 px-3 py-1 rounded-lg inline-block whitespace-pre-line break-words"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-1 rounded-lg inline-block whitespace-pre-line break-words"
                  }
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-zinc-400">Finance Chatbot Typing...</div>
            )}
            {error && aiAvailable !== false && (
              <div className="text-red-500">{error}</div>
            )}
            {/* Anchor for autoscroll */}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>
        <form
          className="flex gap-2 w-full sm:w-2/3 md:w-4/5 mx-auto"
          onSubmit={handleSend}
          onWheel={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            className="border w-full rounded px-4 py-2 flex-1 bg-card text-card-foreground focus:ring-2 focus:ring-primary"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            className="h-auto px-6 py-2 flex gap-2 items-center"
            disabled={loading || !input.trim() || aiAvailable === false}
          >
            <SendHorizonal /> Send
          </Button>
        </form>

        {/* Page-level scroll to top is provided globally by GoToTop */}
      </div>
    </main>
  );
}
