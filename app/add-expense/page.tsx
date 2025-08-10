"use client";

import { useState } from "react";
import { apiPost } from "@/lib/apiClient";
import { toast } from "react-toastify";
import {
  Utensils,
  Bus,
  Book,
  Gift,
  MoreHorizontal,
  UploadCloud,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const categories = [
  { label: "Food", icon: <Utensils className="w-5 h-5" /> },
  { label: "Travel", icon: <Bus className="w-5 h-5" /> },
  { label: "Stationery", icon: <Book className="w-5 h-5" /> },
  { label: "Subscription", icon: <Gift className="w-5 h-5" /> },
  { label: "Misc", icon: <MoreHorizontal className="w-5 h-5" /> },
];

// Utility to resize image before OCR
async function resizeImage(file: File, maxWidth = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No canvas context");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.2)); // lowest quality for speed
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AddExpensePage() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0].label);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  // Removed unused OCR debug/text state to satisfy ESLint

  async function handleOcr() {
    if (!image) return;
    setOcrLoading(true);
    try {
      // Timeout for OCR (15 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error("OCR timed out. Please try a smaller or clearer image.")
            ),
          15000
        )
      );
      // Resize image before OCR
      const imageBase64 = await resizeImage(image, 1000);
      const ocrPromise = apiPost<{
        amount: number;
        vendor: string;
        date: string;
        category: string;
        source: string;
        text: string;
      }>("/api/ocr", { imageBase64 });
      const res = await Promise.race([ocrPromise, timeoutPromise]);
      console.log("OCR API response:", res);
      if (res && typeof res === "object" && res !== null) {
        const ocrRes = res as {
          amount?: number;
          vendor?: string;
          date?: string;
          category?: string;
          source?: string;
          text?: string;
        };
        // Auto-fill form fields with OCR results
        if (ocrRes.amount !== undefined && ocrRes.amount !== null)
          setAmount(ocrRes.amount.toString());
        if (ocrRes.vendor) setDescription(ocrRes.vendor);
        if (ocrRes.date) setDate(ocrRes.date);
        if (ocrRes.category) {
          const found = categories.find((cat) => cat.label === ocrRes.category);
          setCategory(found ? found.label : "Misc");
        }
        if (ocrRes.source) setSource(ocrRes.source);
        toast.success("OCR data extracted!");
      } else {
        toast.error("OCR failed. Unexpected response.");
      }
    } catch (e) {
      console.error("OCR error:", e);
      toast.error(
        e instanceof Error
          ? e.message
          : "OCR failed. Please try again or enter details manually."
      );
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("/api/expenses", {
        amount: Number(amount),
        category,
        description,
        date,
        source,
        imageUrl: "", // You can add image upload logic here
      });
      setAmount("");
      setCategory(categories[0].label);
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      setSource("");
      setImage(null);
      toast.success("Expense added!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
      <div className="py-2 px-2 md:px-0 max-w-xl mx-auto w-full">
        <Card className="py-3 px-6 shadow-lg">
          <h1 className="text-3xl font-bold  text-indigo-700 dark:text-indigo-300 text-center">
            Add Expense
          </h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="block font-medium">Amount</label>
              <input
                type="number"
                className="border rounded p-2 w-full sm:flex-1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="block font-medium">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.label}
                    className={`flex flex-col items-center px-3 py-2 rounded-lg border ${
                      category === cat.label
                        ? "bg-indigo-100 dark:bg-indigo-800 border-indigo-600"
                        : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                    } hover:bg-indigo-200 dark:hover:bg-indigo-700`}
                    onClick={() => setCategory(cat.label)}
                  >
                    {cat.icon}
                    <span className="text-xs mt-1">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="block font-medium">Description</label>
              <input
                type="text"
                className="border rounded p-2 w-full sm:flex-1"
                placeholder="e.g. Lunch with friends"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="block font-medium">Date</label>
              <input
                type="date"
                className="border rounded p-2 w-full sm:flex-1"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="block font-medium">Source</label>
              <input
                type="text"
                className="border rounded p-2 w-full sm:flex-1"
                placeholder="cash, UPI, card, etc."
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block font-medium">Upload Bill (OCR)</label>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="border rounded p-2 w-full sm:flex-1"
                />
                <button
                  type="button"
                  onClick={handleOcr}
                  disabled={!image || ocrLoading}
                  className="flex items-center gap-1 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />{" "}
                  {ocrLoading ? "Processing..." : "Scan"}
                </button>
              </div>
              {/* Remove the OCR text area that displays the raw OCR text */}
              {/* {ocrText && (
              <textarea
                className="border rounded p-2 w-full mt-2 text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200"
                rows={4}
                value={ocrText}
                readOnly
              />
            )} */}
            </div>
            <Button
              type="submit"
              className="w-full text-lg py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
