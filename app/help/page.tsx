import type { Metadata } from "next";
import Link from "next/link";
import ProductionImage from "@/components/ProductionImage";

export const metadata: Metadata = {
  title: "Help • FinTrack",
  description: "New User Guide for using FinTrack effectively",
};

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Hero */}
      <section className="rounded-xl border bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-zinc-900 p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <ProductionImage src="/logo.png" alt="FinTrack Logo" width={40} height={40} className="rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">FinTrack &mdash; New User Guide</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-300 max-w-3xl">
          Welcome to FinTrack, your personal finance tracker for students and busy professionals.
          This guide walks you through setup, core features, and tips to start getting value fast.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="#getting-started" className="px-3 py-1.5 rounded border bg-background hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm">Getting Started</a>
          <a href="#budgets" className="px-3 py-1.5 rounded border bg-background hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm">Budgets</a>
          <a href="#goals" className="px-3 py-1.5 rounded border bg-background hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm">Goals</a>
          <a href="#recurring" className="px-3 py-1.5 rounded border bg-background hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm">Recurring</a>
          <a href="#insights" className="px-3 py-1.5 rounded border bg-background hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm">Insights</a>
          <a href="#notifications" className="px-3 py-1.5 rounded border bg-background hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm">Notifications</a>
        </div>
      </section>

      {/* Quick links */}
      <section className="grid md:grid-cols-3 gap-4 mb-10">
        <Link href="/dashboard" className="rounded-lg border p-4 hover:shadow-sm transition bg-background">
          <div className="font-semibold mb-1">Dashboard</div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Overview of spending, budgets, and quick stats.</p>
        </Link>
        <Link href="/add-expense" className="rounded-lg border p-4 hover:shadow-sm transition bg-background">
          <div className="font-semibold mb-1">Add Expense</div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Capture a new transaction, or use optional OCR.</p>
        </Link>
        <Link href="/budget" className="rounded-lg border p-4 hover:shadow-sm transition bg-background">
          <div className="font-semibold mb-1">Budgets</div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Create monthly and category limits.</p>
        </Link>
      </section>

      {/* Content: two-column layout with sticky TOC and cards */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left: ToC */}
        <aside className="md:col-span-3 hidden md:block">
          <nav className="sticky top-24 space-y-1">
            <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">On this page</div>
            <a href="#overview" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Overview</a>
            <a href="#quick-start" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Quick Start</a>
            <a href="#dashboard" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Dashboard</a>
            <a href="#adding-expenses" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Adding Expenses</a>
            <a href="#budgets" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Budgets</a>
            <a href="#goals" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Goals</a>
            <a href="#recurring" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Recurring</a>
            <a href="#notifications" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Notifications</a>
            <a href="#insights" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">AI Insights</a>
            <a href="#profile" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Profile</a>
            <a href="#privacy" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Data &amp; Privacy</a>
            <a href="#workflows" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Workflows</a>
            <a href="#troubleshooting" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Troubleshooting</a>
            <a href="#faq" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">FAQ</a>
            <a href="#tips" className="block px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">Pro Tips</a>
          </nav>
        </aside>

        {/* Right: Content as cards */}
        <div className="md:col-span-9 space-y-6">
          <section id="overview" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Overview</h2>
            <p className="mt-2">FinTrack helps you <strong>record</strong> and <strong>analyze</strong> your spending, set <strong>budgets</strong> and <strong>goals</strong>, and get<strong> helpful insights</strong> to improve habits.</p>
          </section>

          <section id="quick-start" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Quick Start (2 minutes)</h2>
            <ol className="mt-3 list-decimal pl-5 space-y-1">
              <li>Sign in with Google from the top-right.</li>
              <li>Click &quot;Add Expense&quot; and save your first transaction.</li>
              <li>Go to <strong>Budgets</strong> and set a monthly limit.</li>
              <li>Optionally create your first <strong>Goal</strong> (e.g., &quot;Laptop&quot;).</li>
            </ol>
          </section>

          <section id="dashboard" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Dashboard</h2>
            <p className="mt-2">Your control center for this month&apos;s spending, categories, and trends.</p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>See remaining budget, recent transactions, and top categories.</li>
              <li>Use the navbar to jump to Budgets, Goals, Recurring, and more.</li>
            </ul>
          </section>

          <section id="adding-expenses" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Adding Expenses</h2>
            <p className="mt-2">Choose the method that fits your workflow:</p>
            <ol className="mt-3 list-decimal pl-5 space-y-1">
              <li><strong>Manual:</strong> Click &quot;Add Expense&quot; and fill amount, category, date, and description.</li>
              <li><strong>Receipt OCR (optional):</strong> Upload a receipt image to auto‑extract total, date, and merchant. Review and save.</li>
              <li><strong>CSV Import (optional):</strong> Import exported bank/app data and review parsed rows before saving.</li>
            </ol>
            <p className="mt-3"><em>Tip:</em> Keep descriptions short and consistent. Categories like &quot;Food&quot;, &quot;Travel&quot;, &quot;Stationery&quot; improve insights.</p>
          </section>

          <section id="budgets" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Budgets</h2>
            <ol className="mt-3 list-decimal pl-5 space-y-1">
              <li>Create a monthly total budget.</li>
              <li>Optionally add category‑specific caps (e.g., &quot;Food&quot;).</li>
              <li>Watch remaining vs. spent; adjust mid‑month if needed.</li>
            </ol>
            <p className="mt-3"><em>Best practice:</em> Start realistic; add category caps only where you overspend.</p>
          </section>

          <section id="goals" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Goals</h2>
            <ol className="mt-3 list-decimal pl-5 space-y-1">
              <li>Define a goal (e.g., &quot;New Laptop by Dec 31&quot;).</li>
              <li>Set target amount; follow the suggested monthly plan.</li>
              <li>Update progress whenever you save toward the goal.</li>
            </ol>
          </section>

          <section id="recurring" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Recurring Expenses</h2>
            <ol className="mt-3 list-decimal pl-5 space-y-1">
              <li>Add items like rent or subscriptions once.</li>
              <li>Choose frequency (daily/weekly/monthly/yearly) and start date.</li>
              <li>They appear automatically when due—no manual re‑entry.</li>
            </ol>
          </section>

          <section id="notifications" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Email Notifications</h2>
            <ol className="mt-3 list-decimal pl-5 space-y-1">
              <li>Enable alerts and (optionally) add a secondary email.</li>
              <li>Select frequency: monthly, weekly, or threshold alerts.</li>
              <li>Set the threshold amount or percentage to watch.</li>
            </ol>
            <p className="mt-3"><em>Note:</em> SMTP must be configured by your admin; some providers require app‑passwords.</p>
          </section>

          <section id="insights" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">AI Insights (Optional)</h2>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Ask tailored questions about spending and budgets.</li>
              <li>Get suggestions to cut costs or plan savings.</li>
              <li>If no AI key is set, a simple rule‑based suggestion may appear.</li>
            </ul>
            <p className="mt-3"><em>Privacy:</em> Insights use aggregated categories; we avoid sending unnecessary personal data.</p>
          </section>

          <section id="profile" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Profile</h2>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Update personal info and preferences.</li>
              <li>Manage notification settings.</li>
              <li>Sign out from the top navigation.</li>
            </ul>
          </section>

          <section id="privacy" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Data &amp; Privacy</h2>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Your data is tied to your account and stored securely.</li>
              <li>Google OAuth handles authentication.</li>
              <li>Sensitive credentials are never exposed on the client.</li>
            </ul>
          </section>

          <section id="workflows" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Common Workflows</h2>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li><strong>Quick capture:</strong> add an expense right after purchase.</li>
              <li><strong>Month‑start setup:</strong> set budget; review recurring items.</li>
              <li><strong>Weekly review:</strong> check top categories; adjust caps.</li>
              <li><strong>Goal progress:</strong> update saved amount after income.</li>
            </ul>
          </section>

          <section id="troubleshooting" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Troubleshooting</h2>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li><strong>Can&apos;t sign in:</strong> allow popups; use your Google account.</li>
              <li><strong>No data appears:</strong> add your first expense or contact support.</li>
              <li><strong>Email not received:</strong> verify SMTP settings.</li>
              <li><strong>OCR issues:</strong> use clear photos with good lighting.</li>
              <li><strong>Slow pages:</strong> refresh or sign out/in.</li>
            </ul>
          </section>

          <section id="faq" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">FAQ</h2>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li><strong>Is my data safe?</strong> Yes.</li>
              <li><strong>Can I export data?</strong> Yes (CSV or request).</li>
              <li><strong>Do I need a budget?</strong> Recommended, not required.</li>
              <li><strong>Are AI features required?</strong> No.</li>
            </ul>
          </section>

          <section id="tips" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="m-0">Pro Tips</h2>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Log expenses within 24 hours.</li>
              <li>Tag categories consistently for better insights.</li>
              <li>Review weekly; adjust budgets early.</li>
              <li>Start with 1–2 goals and a simple monthly budget.</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/dashboard" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Go to Dashboard</Link>
        <Link href="/add-expense" className="px-4 py-2 rounded border bg-background hover:bg-zinc-50 dark:hover:bg-zinc-800">Add Your First Expense</Link>
      </div>
    </main>
  );
}
