"use client";

import { useState } from "react";
import { apiPost } from "@/lib/apiClient";
import { SendHorizonal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
      <div className="py-2 px-2 md:px-0 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl flex items-center justify-center gap-2 md:text-5xl font-extrabold text-indigo-700 dark:text-indigo-300 tracking-tight animate-fade-in">
          <Image
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
        <Card className="mb-6 h-80 overflow-y-auto flex flex-col gap-2 bg-white dark:bg-zinc-900 border border-gray-500">
          <CardContent className="flex-1 flex flex-col gap-2">
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
                      ? "bg-indigo-100 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 px-3 py-1 rounded-lg inline-block whitespace-pre-line"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-1 rounded-lg inline-block whitespace-pre-line"
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
          </CardContent>
        </Card>
        <form className="flex gap-2 w-fit mx-auto" onSubmit={handleSend}>
          <input
            type="text"
            className="border border-gray-500 w-full rounded px-4 py-2 flex-1 bg-card text-card-foreground focus:ring-2 focus:ring-primary"
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
            <SendHorizonal className="text-blue-500" /> Send
          </Button>
        </form>
      </div>
    </main>
  );
}
