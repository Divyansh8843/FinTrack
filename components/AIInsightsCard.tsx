import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Lightbulb,
  AlertTriangle,
  Target,
  Wallet,
  Clock,
  Flag,
} from "lucide-react";
import { ReactNode, useMemo } from "react";

type Props = { suggestions: string | ReactNode };

export default function AIInsightsCard({ suggestions }: Props) {
  const sections = useMemo(
    () => parseSections(String(suggestions)),
    [suggestions]
  );
  return (
    <Card className="p-4 rounded-2xl shadow-lg bg-white dark:bg-zinc-900">
      <CardHeader className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <div className="text-xl font-semibold">AI Insights</div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.summary && (
          <Section
            title="Quick Summary"
            icon={<Wallet className="w-4 h-4 text-indigo-500" />}
          >
            <p className="text-zinc-700 dark:text-zinc-200">
              {sections.summary}
            </p>
          </Section>
        )}
        {sections.alerts.length > 0 && (
          <Section
            title="Overspending Alerts"
            icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
          >
            <BulletList items={sections.alerts} />
          </Section>
        )}
        {sections.tips.length > 0 && (
          <Section
            title="Savings Tips"
            icon={<Target className="w-4 h-4 text-green-500" />}
          >
            <BulletList items={sections.tips} />
          </Section>
        )}
        {sections.budget.length > 0 && (
          <Section
            title="Budget Status"
            icon={<Clock className="w-4 h-4 text-blue-500" />}
          >
            <BulletList items={sections.budget} />
          </Section>
        )}
        {sections.goals.length > 0 && (
          <Section
            title="Goal Suggestions"
            icon={<Flag className="w-4 h-4 text-purple-500" />}
          >
            <BulletList items={sections.goals} />
          </Section>
        )}
        {sections.nextAction && (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {sections.nextAction}
          </div>
        )}
        {sections.rest && (
          <div className="text-zinc-700 dark:text-zinc-200 whitespace-pre-line">
            {sections.rest}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="pl-0 space-y-2 text-zinc-700 dark:text-zinc-200">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500 mt-1" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function parseSections(text: string) {
  const cleanedText = text.replace(/\*\*/g, "");
  const rawLines = cleanedText.split(/\r?\n/).map((l) => l.trim());
  const lines = rawLines
    .map((l) => (l.startsWith("* ") ? l.replace(/^\*\s+/, "- ") : l))
    .filter(Boolean);
  let summary = "";
  const alerts: string[] = [];
  const tips: string[] = [];
  const goals: string[] = [];
  const budget: string[] = [];
  let nextAction = "";
  const restLines: string[] = [];

  let current: "summary" | "alerts" | "tips" | "budget" | "goals" | "other" =
    "other";
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith("quick summary")) {
      current = "summary";
      continue;
    }
    if (lower.startsWith("overspending alerts")) {
      current = "alerts";
      continue;
    }
    if (lower.startsWith("savings tips")) {
      current = "tips";
      continue;
    }
    if (lower.startsWith("budget status")) {
      current = "budget";
      continue;
    }
    if (lower.startsWith("goal suggestions")) {
      current = "goals";
      continue;
    }
    if (lower.startsWith("next action")) {
      nextAction = line;
      continue;
    }

    if (current === "summary" && !/^[-•\*]/.test(line))
      summary += (summary ? " " : "") + line;
    else if (current === "alerts" && /^[-•\*]/.test(line))
      alerts.push(line.replace(/^[-•\*]\s*/, ""));
    else if (current === "tips" && /^[-•\*]/.test(line))
      tips.push(line.replace(/^[-•\*]\s*/, ""));
    else if (current === "goals" && /^[-•\*]/.test(line))
      goals.push(line.replace(/^[-•\*]\s*/, ""));
    else if (current === "budget") {
      if (/^[-•\*]/.test(line)) budget.push(line.replace(/^[-•\*]\s*/, ""));
      else if (line) budget.push(line);
    } else restLines.push(line);
  }

  return {
    summary,
    alerts,
    tips,
    goals,
    budget,
    nextAction,
    rest: restLines.join("\n"),
  } as const;
}
