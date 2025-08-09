"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import { apiPost } from "@/lib/apiClient";
import dayjs from "dayjs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  SendIcon,
} from "lucide-react";
import Loader from "@/components/Loader";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  ExpenseLineChart,
  ExpenseDonutChart,
  ExpenseAreaChart,
} from "@/components/ExpensePieChart";
import { jsPDF } from "jspdf";
import ProductionImage from "@/components/ProductionImage";
import Papa from "papaparse";
import { Download } from "lucide-react";
export default function ReportsPage() {
  // Insights text no longer rendered here; keep local state only if needed later
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<
    { category: string; value: number }[]
  >([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [filter, setFilter] = useState<"month" | "year" | "custom">("month");
  const [customRange, setCustomRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [dateLabel, setDateLabel] = useState("This Month");
  const [rangeNote, setRangeNote] = useState<string>("");
  const [monthlyTrend, setMonthlyTrend] = useState<
    { month: string; value: number }[]
  >([]);
  const [cumulativeTrend, setCumulativeTrend] = useState<
    { month: string; value: number }[]
  >([]);
  const [topCategories, setTopCategories] = useState<
    { name: string; value: number }[]
  >([]);
  const [topMerchants, setTopMerchants] = useState<
    { name: string; value: number }[]
  >([]);
  const [topSources, setTopSources] = useState<
    { name: string; value: number }[]
  >([]);
  const [budget, setBudget] = useState<{
    monthly: number;
    categories: Record<string, number>;
  } | null>(null);
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
  } | null>(null);
  const [lineItems, setLineItems] = useState<
    {
      amount: number;
      date: string;
      description?: string;
      category?: string;
      source?: string;
    }[]
  >([]);
  const [goals, setGoals] = useState<
    {
      title: string;
      targetAmount: number;
      savedAmount: number;
      deadline: string;
    }[]
  >([]);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Prepare date range based on filter
      let from: string | undefined;
      let to: string | undefined;
      if (filter === "month") {
        from = dayjs().startOf("month").toISOString();
        to = dayjs().endOf("month").toISOString();
        setDateLabel(dayjs().format("MMMM YYYY"));
      } else if (filter === "year") {
        from = dayjs().startOf("year").toISOString();
        to = dayjs().endOf("year").toISOString();
        setDateLabel(dayjs().format("YYYY"));
      } else if (filter === "custom" && customRange.from && customRange.to) {
        from = dayjs(customRange.from).startOf("day").toISOString();
        to = dayjs(customRange.to).endOf("day").toISOString();
        setDateLabel(
          `${dayjs(customRange.from).format("DD MMM YYYY")} - ${dayjs(
            customRange.to
          ).format("DD MMM YYYY")}`
        );
      }
      // Fetch summary and insights with date range
      let summaryRes = await apiGet<{
        total: number;
        categories: Record<string, number>;
        merchants: Record<string, number>;
        sources: Record<string, number>;
      }>(`/api/expenses-summary?from=${from ?? ""}&to=${to ?? ""}`);
      // Fallback: if no data in selected range, fetch all-time to populate charts
      if (!summaryRes.total) {
        try {
          const allRes = await apiGet<{
            total: number;
            categories: Record<string, number>;
            merchants: Record<string, number>;
            sources: Record<string, number>;
          }>(`/api/expenses-summary`);
          if (allRes.total) {
            summaryRes = allRes;
            setRangeNote(
              "No data in selected range. Showing all-time summary."
            );
          } else {
            setRangeNote("");
          }
        } catch {
          setRangeNote("");
        }
      } else {
        setRangeNote("");
      }
      setTotalSpent(summaryRes.total);
      setCategoryData(
        Object.entries(summaryRes.categories).map(([category, value]) => ({
          category,
          value,
        }))
      );
      setError(null);

      setTopCategories(
        Object.entries(summaryRes.categories)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      );
      setTopMerchants(
        Object.entries(summaryRes.merchants || {})
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      );
      setTopSources(
        Object.entries(summaryRes.sources || {})
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      );

      // Fetch all expenses (we will filter client-side for the selected period)
      const expenses = await apiGet<
        {
          amount: number;
          date: string;
          description?: string;
          category?: string;
          source?: string;
        }[]
      >("/api/expenses");
      // Persist filtered line items for detailed exports
      const startMs = from ? new Date(from).getTime() : -Infinity;
      const endMs = to ? new Date(to).getTime() : Infinity;
      const filtered = expenses.filter((e) => {
        const t = new Date(e.date).getTime();
        return t >= startMs && t <= endMs;
      });
      setLineItems(filtered);
      // Group by month
      const monthMap: Record<string, number> = {};
      let runningTotal = 0;
      const sorted = [...expenses].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const cumuArr: { month: string; value: number }[] = [];
      sorted.forEach((exp) => {
        const month = dayjs(exp.date).format("MMM YYYY");
        monthMap[month] = (monthMap[month] || 0) + exp.amount;
      });
      const months = Object.keys(monthMap).sort(
        (a, b) => dayjs(a, "MMM YYYY").unix() - dayjs(b, "MMM YYYY").unix()
      );
      const monthlyArr = months.map((m) => ({ month: m, value: monthMap[m] }));
      months.forEach((m) => {
        runningTotal += monthMap[m];
        cumuArr.push({ month: m, value: runningTotal });
      });
      setMonthlyTrend(monthlyArr);
      setCumulativeTrend(cumuArr);

      // Fetch user budget
      const budgetRes = await apiGet<{
        budget: { monthly: number; categories: Record<string, number> };
      }>("/api/budget");
      setBudget(budgetRes.budget);
      // Fetch profile for header metadata
      try {
        const prof = await apiGet<{ name?: string; email?: string }>(
          "/api/profile"
        );
        setProfile(prof);
      } catch {
        setProfile(null);
      }
      // Fetch notification settings (only enabled flag for quick access)
      try {
        const notif = await apiGet<{ emailSettings?: { enabled?: boolean } }>(
          "/api/notifications/settings"
        );
        if (
          notif?.emailSettings &&
          typeof notif.emailSettings.enabled === "boolean"
        ) {
          setNotifyEnabled(!!notif.emailSettings.enabled);
        }
      } catch {}
      // Fetch user goals
      const goalsRes = await apiGet<
        {
          title: string;
          targetAmount: number;
          savedAmount: number;
          deadline: string;
        }[]
      >("/api/goals");
      setGoals(goalsRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const now = dayjs().format("YYYY-MM-DD HH:mm");
    const rows: (string | number)[][] = [];
    // Title and meta (no app/company branding)
    rows.push(["Expense Report"]);
    rows.push(["Period", dateLabel]);
    rows.push(["Generated", now]);
    if (profile?.name || profile?.email) {
      rows.push([
        "Prepared For",
        `${profile?.name ?? ""}${
          profile?.email ? ` <${profile.email}>` : ""
        }`.trim(),
      ]);
    }
    rows.push([]);
    // Category breakdown with share for clarity
    rows.push(["Category", "Amount (INR)", "Share (%)"]);
    const safeTotal = totalSpent || 0;
    categoryData.forEach((c) => {
      const share = safeTotal
        ? Number(((c.value / safeTotal) * 100).toFixed(2))
        : 0;
      rows.push([
        c.category,
        Number(c.value.toFixed ? c.value.toFixed(2) : c.value),
        share,
      ]);
    });
    rows.push([]);
    rows.push([
      "Total Spent (INR)",
      Number(safeTotal.toFixed ? safeTotal.toFixed(2) : safeTotal),
    ]);
    if (topMerchants.length) {
      rows.push([]);
      rows.push(["Top Merchants"]);
      rows.push(["Merchant", "Amount (INR)"]);
      topMerchants.forEach((m) =>
        rows.push([
          m.name,
          Number(m.value.toFixed ? m.value.toFixed(2) : m.value),
        ])
      );
    }
    if (topSources.length) {
      rows.push([]);
      rows.push(["Top Payment Sources"]);
      rows.push(["Source", "Amount (INR)"]);
      topSources.forEach((s) =>
        rows.push([
          s.name,
          Number(s.value.toFixed ? s.value.toFixed(2) : s.value),
        ])
      );
    }
    // Detailed line items table for the period
    if (lineItems.length) {
      rows.push([]);
      rows.push(["Line Items (Detailed)"]);
      rows.push([
        "#",
        "Date",
        "Description",
        "Category",
        "Source",
        "Amount (INR)",
      ]);
      const sorted = [...lineItems].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      sorted.forEach((it, idx) => {
        rows.push([
          idx + 1,
          dayjs(it.date).format("DD MMM YYYY"),
          it.description || "-",
          it.category || "-",
          it.source || "-",
          Number(
            (it.amount as number).toFixed
              ? (it.amount as number).toFixed(2)
              : it.amount
          ),
        ]);
      });
    }
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `expense-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderReportPDF = async (doc: jsPDF) => {
    const marginLeft = 48;
    const marginTop = 56;
    let y = marginTop;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const rightX = pageWidth - marginLeft;

    const ensureSpace = (needed: number) => {
      if (y + needed > pageHeight - marginTop) {
        doc.addPage();
        y = marginTop;
      }
    };

    const addSectionTitle = (text: string) => {
      ensureSpace(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(text, marginLeft, y);
      // underline divider
      doc.setDrawColor(200);
      doc.line(marginLeft, y + 6, rightX, y + 6);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
    };

    const addKeyValueRow = (label: string, value: string) => {
      ensureSpace(18);
      doc.setFont("helvetica", "normal");
      doc.text(label, marginLeft, y);
      doc.text(value, rightX, y, { align: "right" });
      y += 16;
    };

    const drawTable = (
      headers: { text: string; width: number; align?: "left" | "right" }[],
      rows: (string | number)[][]
    ) => {
      ensureSpace(26);
      // header background
      doc.setFillColor(240, 240, 240);
      doc.setDrawColor(210);
      doc.rect(marginLeft - 2, y - 14, rightX - marginLeft + 2, 26, "F");
      doc.setFont("helvetica", "bold");
      let x = marginLeft;
      headers.forEach((h) => {
        const tx = h.align === "right" ? x + h.width : x;
        doc.text(h.text, tx, y, { align: h.align || "left" });
        x += h.width;
      });
      y += 16;
      doc.setFont("helvetica", "normal");
      // body rows
      rows.forEach((r) => {
        ensureSpace(18);
        let rx = marginLeft;
        r.forEach((cell, i) => {
          const col = headers[i];
          const align = col.align || "left";
          const tx2 = align === "right" ? rx + col.width : rx;
          doc.text(String(cell), tx2, y, { align });
          rx += col.width;
        });
        // row divider
        doc.setDrawColor(240);
        doc.line(marginLeft - 2, y + 4, rightX, y + 4);
        y += 16;
        if (y > pageHeight - marginTop) {
          doc.addPage();
          y = marginTop;
          // redraw header
          ensureSpace(26);
          doc.setFillColor(240, 240, 240);
          doc.setDrawColor(210);
          doc.rect(marginLeft - 2, y - 14, rightX - marginLeft + 2, 26, "F");
          doc.setFont("helvetica", "bold");
          let nx = marginLeft;
          headers.forEach((h) => {
            const ntx = h.align === "right" ? nx + h.width : nx;
            doc.text(h.text, ntx, y, { align: h.align || "left" });
            nx += h.width;
          });
          y += 16;
          doc.setFont("helvetica", "normal");
        }
      });
    };

    // Try to load a font that supports the Rupee sign (₹). Fallback to 'Rs.' if not available
    const fetchAsDataURL = async (url: string): Promise<string | null> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    };
    const dataUrlToBase64 = (dataUrl: string) => dataUrl.split(",")[1] || "";

    let fontLoaded = false;
    const notoNormal = await fetchAsDataURL("/fonts/NotoSans-Regular.ttf");
    const notoBold = await fetchAsDataURL("/fonts/NotoSans-Bold.ttf");
    if (notoNormal) {
      try {
        doc.addFileToVFS("NotoSans-Regular.ttf", dataUrlToBase64(notoNormal));
        doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
        if (notoBold) {
          doc.addFileToVFS("NotoSans-Bold.ttf", dataUrlToBase64(notoBold));
          doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
        }
        fontLoaded = true;
      } catch {
        fontLoaded = false;
      }
    }

    const activeFont = fontLoaded ? "NotoSans" : "helvetica";
    const formatINR = (value: number) => {
      const num = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      const symbol = fontLoaded ? "₹" : "Rs.";
      return `${symbol} ${num}`;
    };

    const toWordsUnderThousand = (n: number): string => {
      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];
      const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
      ];
      if (n < 20) return ones[n];
      if (n < 100)
        return `${tens[Math.floor(n / 10)]}${n % 10 ? " " + ones[n % 10] : ""}`;
      return `${ones[Math.floor(n / 100)]} Hundred${
        n % 100 ? " and " + toWordsUnderThousand(n % 100) : ""
      }`;
    };

    const numberToIndianWords = (num: number): string => {
      if (!isFinite(num)) return "";
      const rounded = Math.round(num * 100);
      const rupees = Math.floor(rounded / 100);
      const paise = rounded % 100;
      if (rupees === 0)
        return paise
          ? `${toWordsUnderThousand(paise)} Paise only`
          : "Zero Rupees only";
      const units = ["", "Thousand", "Lakh", "Crore"];
      const parts: string[] = [];
      let r = rupees;
      // Split as per Indian numbering: last 3, then 2,2,2...
      const groups: number[] = [];
      groups.push(r % 1000);
      r = Math.floor(r / 1000);
      while (r > 0) {
        groups.push(r % 100);
        r = Math.floor(r / 100);
      }
      for (let i = groups.length - 1; i >= 0; i--) {
        const g = groups[i];
        if (!g) continue;
        const unit = units[i] || "";
        parts.push(
          `${toWordsUnderThousand(g)}${unit ? " " + unit : ""}`.trim()
        );
      }
      const rupeeWords = parts.join(" ");
      const paisePart = paise
        ? ` and ${toWordsUnderThousand(paise)} Paise`
        : "";
      return `${rupeeWords} Rupees${paisePart} only`;
    };

    // Header (optional logo left)
    // Attempt to place user's logo if present
    const logoDataUrl = await fetchAsDataURL("/logo.png");
    const logoSize = 32;
    let headerTextX = marginLeft;
    if (logoDataUrl) {
      try {
        doc.addImage(
          logoDataUrl,
          "PNG",
          marginLeft,
          y - 16,
          logoSize,
          logoSize
        );
        headerTextX += logoSize + 10;
      } catch {}
    }

    doc.setFont(activeFont, "bold");
    doc.setFontSize(20);
    doc.text("Expense Report", headerTextX, y);
    doc.setFontSize(12);
    doc.setFont(activeFont, "normal");
    y += 20;
    doc.text(`Period: ${dateLabel}`, headerTextX, y);
    y += 16;
    doc.text(
      `Prepared on: ${dayjs().format("DD MMM YYYY HH:mm")}`,
      headerTextX,
      y
    );
    // subtle rule under header
    y += 8;
    doc.setDrawColor(220);
    doc.line(marginLeft, y, rightX, y);

    // Bill To / Prepared For
    if (profile?.name || profile?.email) {
      y += 20;
      addSectionTitle("Prepared For");
      ensureSpace(18);
      doc.text(`${profile?.name ?? ""}`.trim() || "-", marginLeft, y);
      if (profile?.email) {
        doc.text(`${profile.email}`, marginLeft, y + 16);
        y += 16;
      }
    }

    // Summary
    y += 24;
    addSectionTitle("Summary");
    addKeyValueRow("Total Spent", `${formatINR(totalSpent)}`);

    // Category Breakdown
    y += 12;
    addSectionTitle("Category Breakdown");
    const safeTotal = totalSpent || 0;
    if (categoryData.length) {
      const catHeaders = [
        { text: "Category", width: 260 },
        { text: "Share %", width: 90, align: "right" as const },
        {
          text: "Amount",
          width: rightX - marginLeft - (260 + 90),
          align: "right" as const,
        },
      ];
      const catRows = categoryData.map((c) => {
        const share = safeTotal
          ? Math.round((c.value / safeTotal) * 10000) / 100
          : 0;
        return [c.category, `${share}%`, `${formatINR(c.value)}`];
      });
      drawTable(catHeaders, catRows);
    }

    // Detailed Line Items Table
    if (lineItems.length) {
      y += 12;
      addSectionTitle("Line Items");
      const cols = [
        { text: "#", width: 26 },
        { text: "Date", width: 92 },
        { text: "Description", width: 240 },
        { text: "Category", width: 140 },
        {
          text: "Amount",
          width: rightX - marginLeft - (26 + 92 + 240 + 140),
          align: "right" as const,
        },
      ];
      const sorted = [...lineItems].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const rows = sorted.map((it, idx) => [
        String(idx + 1),
        dayjs(it.date).format("DD MMM YYYY"),
        (it.description || "-").slice(0, 50),
        it.category || "-",
        `${formatINR(it.amount)}${it.source ? ` (${it.source})` : ""}`,
      ]);
      drawTable(
        cols as { text: string; width: number; align?: "left" | "right" }[],
        rows
      );
    }

    // Top Merchants
    if (topMerchants.length) {
      y += 12;
      addSectionTitle("Top Merchants");
      const headers = [
        { text: "Merchant", width: 300 },
        {
          text: "Amount",
          width: rightX - marginLeft - 300,
          align: "right" as const,
        },
      ];
      const rows = topMerchants.map((m) => [m.name, formatINR(m.value)]);
      drawTable(headers, rows);
    }

    // Top Payment Sources
    if (topSources.length) {
      y += 12;
      addSectionTitle("Top Payment Sources");
      const headers = [
        { text: "Source", width: 300 },
        {
          text: "Amount",
          width: rightX - marginLeft - 300,
          align: "right" as const,
        },
      ];
      const rows = topSources.map((s) => [s.name, formatINR(s.value)]);
      drawTable(headers, rows);
    }

    // Totals box and amount in words
    y += 16;
    addSectionTitle("Totals");
    ensureSpace(40);
    const totalsWidth = 240;
    const totalsX = rightX - totalsWidth;
    const rowH = 20;
    doc.setDrawColor(210);
    doc.rect(totalsX, y - 12, totalsWidth, rowH * 2 + 12);
    doc.setFont("helvetica", "normal");
    doc.text("Sub Total", totalsX + 10, y);
    doc.text(formatINR(totalSpent), totalsX + totalsWidth - 10, y, {
      align: "right",
    });
    y += rowH;
    doc.setFont("helvetica", "bold");
    doc.text("Total", totalsX + 10, y);
    doc.text(formatINR(totalSpent), totalsX + totalsWidth - 10, y, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");
    y += 22;
    const words = numberToIndianWords(totalSpent);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Amount In Words", marginLeft, y);
    doc.setFont("helvetica", "normal");
    y += 16;
    const wrapped = doc.splitTextToSize(words, rightX - marginLeft);
    wrapped.forEach((line: string) => {
      ensureSpace(16);
      doc.text(line, marginLeft, y);
      y += 14;
    });

    // Terms note
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Terms and conditions", marginLeft, y);
    doc.setFont("helvetica", "normal");
    y += 14;
    doc.text(
      "This is a computer-generated report for personal record-keeping.",
      marginLeft,
      y
    );
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    await renderReportPDF(doc);
    // Save without branding in filename
    doc.save(`expense-report-${Date.now()}.pdf`);
  };

  const generateReportPdfBase64 = async (): Promise<{
    base64: string;
    filename: string;
  }> => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    await renderReportPDF(doc);
    const dataUrl = doc.output("datauristring");
    const base64 = dataUrl.split(",")[1] || "";
    const filename = `expense-report-${Date.now()}.pdf`;
    return { base64, filename };
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, customRange]);

  // Also refresh summary and charts periodically to feel real-time
  // Reduce background refresh frequency to avoid frequent reloads
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 45000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll goals to keep report goal progress fresh without manual refresh
  useEffect(() => {
    const interval = setInterval(() => {
      apiGet<
        {
          title: string;
          targetAmount: number;
          savedAmount: number;
          deadline: string;
        }[]
      >("/api/goals")
        .then(setGoals)
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-0">
      <div className="w-full max-w-screen-2xl mx-auto px-0 md:px-4 py-8">
        <h1 className="text-4xl flex items-center justify-center gap-2 md:text-5xl font-extrabold mb-4 text-indigo-700 dark:text-indigo-300 tracking-tight  animate-fade-in">
          <ProductionImage
            className="text-blue-600 h-12 w-12"
            src="/report.png"
            alt="Reports"
            width={48}
            height={48}
          />
          Reports & Predictions
        </h1>
        <p className="text-muted-foreground mb-6 text-lg text-center">
          Visualize your spending and get predictions for smarter planning!
        </p>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex flex-wrap gap-2 mb-6 items-center justify-center">
            <label className="font-medium">Range:</label>
            <select
              className="border rounded px-2 py-1 bg-card text-card-foreground"
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as "month" | "year" | "custom")
              }
            >
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            {filter === "custom" && (
              <>
                <input
                  type="date"
                  className="border rounded px-2 py-1 bg-card text-card-foreground"
                  value={customRange.from}
                  onChange={(e) =>
                    setCustomRange((r) => ({ ...r, from: e.target.value }))
                  }
                />
                <span>-</span>
                <input
                  type="date"
                  className="border rounded px-2 py-1 bg-card text-card-foreground"
                  value={customRange.to}
                  onChange={(e) =>
                    setCustomRange((r) => ({ ...r, to: e.target.value }))
                  }
                />
              </>
            )}
            <span className="ml-4 text-muted-foreground text-sm">
              {dateLabel}
            </span>
            {!!rangeNote && (
              <span className="ml-4 text-red-600 text-sm">{rangeNote}</span>
            )}
          </div>
          <div className="flex gap-3 mb-6 items-center">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button
              disabled={!notifyEnabled || sendingEmail}
              onClick={async () => {
                try {
                  setSendingEmail(true);
                  const { base64, filename } = await generateReportPdfBase64();
                  await apiPost("/api/notifications/send", {
                    period: filter === "year" ? "year" : "month",
                    pdfBase64: base64,
                    pdfFilename: filename,
                  });
                  alert("Email sent");
                } catch (err) {
                  alert((err as Error).message);
                } finally {
                  setSendingEmail(false);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition disabled:opacity-50"
            >
              <SendIcon className="w-4 h-4" />
              {sendingEmail ? "Sending..." : "Send Report"}
            </button>
          </div>
        </div>
        {loading && <Loader label="Preparing report..." />}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
              <Card className="bg-white dark:bg-zinc-900 shadow-xl p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-zinc-500">Total Spent</p>
                    <p className="text-2xl font-bold text-green-700">
                      ₹{totalSpent}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 shadow-xl p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-zinc-500">Top Category</p>
                    <p className="text-xl font-bold text-blue-700">
                      {topCategories[0]?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 shadow-xl p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-zinc-500">Period</p>
                    <p className="text-lg font-bold text-purple-700">
                      {dateLabel}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 shadow-xl p-6">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-zinc-500">Categories</p>
                    <p className="text-xl font-bold text-orange-700">
                      {categoryData.length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Donut and Area charts side by side, full width */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-fade-in-up">
              <Card className="bg-white dark:bg-zinc-900 shadow-xl h-full flex flex-col">
                <CardHeader>
                  <h2 className="text-2xl font-bold  text-indigo-700 dark:text-indigo-300">
                    Category Distribution
                  </h2>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center items-center">
                  {categoryData.length > 0 ? (
                    <ExpenseDonutChart data={categoryData} />
                  ) : (
                    <div className="text-zinc-400 text-center py-8">
                      No expenses to display yet.
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="text-xl font-bold">
                    Total Spent:{" "}
                    <span className="text-blue-600">₹{totalSpent}</span>
                  </div>
                </CardFooter>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 shadow-xl h-full flex flex-col">
                <CardHeader>
                  <h2 className="text-2xl font-bold  text-indigo-700 dark:text-indigo-300">
                    Spending Trend
                  </h2>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                  {monthlyTrend.length > 0 ? (
                    <ExpenseAreaChart
                      data={monthlyTrend}
                      xKey="month"
                      yKey="value"
                      label="Monthly Spent"
                    />
                  ) : (
                    <div className="text-zinc-400 text-center py-8">
                      No data for spending trend.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <Card className="mt-12 bg-white dark:bg-zinc-900 shadow-xl animate-fade-in-up">
              <CardContent>
                <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">
                  Cumulative Spend Over Time
                </h2>
                {cumulativeTrend.length > 0 ? (
                  <ExpenseLineChart
                    data={cumulativeTrend}
                    xKey="month"
                    yKey="value"
                    label="Cumulative Spent"
                  />
                ) : (
                  <div className="text-zinc-400 text-center py-8">
                    No data for cumulative trend.
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Top Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-fade-in-up">
              <Card className="bg-white dark:bg-zinc-900 shadow-xl">
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">
                    Top Categories
                  </h3>
                  {topCategories.length > 0 ? (
                    <ul className="space-y-1">
                      {topCategories.map((cat) => (
                        <li
                          key={cat.name}
                          className="flex justify-between text-base gap-4"
                        >
                          <span className="break-words max-w-[60%]">
                            {cat.name}
                          </span>
                          <span className="font-bold">₹{cat.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-zinc-400">No data</div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 shadow-xl">
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">
                    Top Merchants
                  </h3>
                  {topMerchants.length > 0 ? (
                    <ul className="space-y-1">
                      {topMerchants.map((m) => (
                        <li
                          key={m.name}
                          className="flex justify-between text-base gap-4"
                        >
                          <span className="break-words max-w-[60%]">
                            {m.name}
                          </span>
                          <span className="font-bold">₹{m.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-zinc-400">No data</div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 shadow-xl">
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">
                    Top Payment Sources
                  </h3>
                  {topSources.length > 0 ? (
                    <ul className="space-y-1">
                      {topSources.map((s) => (
                        <li
                          key={s.name}
                          className="flex justify-between text-base gap-4"
                        >
                          <span className="break-words max-w-[60%]">
                            {s.name}
                          </span>
                          <span className="font-bold">₹{s.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-zinc-400">No data</div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Budget vs. Actual Section */}
            {budget && (
              <Card className="mt-12 bg-white dark:bg-zinc-900 shadow-xl animate-fade-in-up">
                <CardContent>
                  <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">
                    Budget vs. Actual
                  </h2>
                  <div className="mb-4 flex flex-col gap-2">
                    <div className="flex justify-between text-base font-medium">
                      <span>Total Budget</span>
                      <span>₹{budget.monthly}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium">
                      <span>Total Spent</span>
                      <span>₹{totalSpent}</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded ${
                          totalSpent > budget.monthly
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((totalSpent / budget.monthly) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {Math.min(
                        100,
                        Math.round((totalSpent / budget.monthly) * 100)
                      )}
                      % of budget used
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 mt-6">
                    By Category
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(budget.categories || {}).map(
                      ([cat, bval]) => {
                        const actual =
                          categoryData.find((c) => c.category === cat)?.value ||
                          0;
                        const percent = bval
                          ? Math.min(100, Math.round((actual / bval) * 100))
                          : 0;
                        return (
                          <div key={cat} className="mb-2">
                            <div className="flex justify-between text-base">
                              <span>{cat}</span>
                              <span>
                                ₹{actual} / ₹{bval}
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded ${
                                  actual > bval ? "bg-red-500" : "bg-green-500"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="text-xs text-zinc-400">
                              {percent}% used
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Goal Progress Section */}
            {goals.length > 0 && (
              <Card className="mt-12 bg-white dark:bg-zinc-900 shadow-xl animate-fade-in-up">
                <CardContent>
                  <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">
                    Goal Progress
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goals.map((goal) => {
                      const percent = goal.targetAmount
                        ? Math.min(
                            100,
                            Math.round(
                              (goal.savedAmount / goal.targetAmount) * 100
                            )
                          )
                        : 0;
                      return (
                        <div key={goal.title} className="mb-2">
                          <div className="flex justify-between text-base font-medium">
                            <span>{goal.title}</span>
                            <span>
                              ₹{goal.savedAmount} / ₹{goal.targetAmount}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-2 overflow-hidden">
                            <div
                              className="h-2 rounded bg-blue-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="text-xs text-zinc-600">
                            {percent}% complete (Deadline:{" "}
                            {dayjs(goal.deadline).format("DD MMM YYYY")})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
