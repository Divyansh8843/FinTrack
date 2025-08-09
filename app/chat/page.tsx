"use client";

import { useState, useEffect, useRef } from "react";
import { apiPost } from "@/lib/apiClient";
import { SendHorizonal, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductionImage from "@/components/ProductionImage";
import { scrollToTop } from "@/lib/scrollUtils";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState<boolean>(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showPageScrollTop, setShowPageScrollTop] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle scroll to show/hide scroll-to-top button
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      setShowScrollTop(scrollTop > 200);
    }
  };

  // Handle page scroll to show/hide page-level scroll-to-top button
  const handlePageScroll = () => {
    setShowPageScrollTop(window.pageYOffset > 300);
  };

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
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove as any);
  }, []);

  // Scroll to top of chat
  const handleScrollToTop = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add page scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handlePageScroll);
    return () => {
      window.removeEventListener("scroll", handlePageScroll);
    };
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ reply: string }>("/api/chat", {
        message: input,
        mode: advanced ? "advanced" : "standard",
      });
      setMessages((prev) => [...prev, { sender: "bot", text: res.reply }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
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
        <Card className="mb-6 bg-card border">
          <CardContent
            ref={chatContainerRef}
            onScroll={handleScroll}
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
            {error && <div className="text-red-500">{error}</div>}
            {/* Anchor for autoscroll */}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>
        <form
          className="flex gap-2 w-full sm:w-2/3 md:w-1/2 mx-auto"
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
            disabled={loading || !input.trim()}
          >
            <SendHorizonal /> Send
          </Button>
        </form>

        {/* Page-level scroll to top is provided globally by GoToTop */}
      </div>
    </main>
  );
}
