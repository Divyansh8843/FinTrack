import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";

type ExpenseCardProps = {
  title: string;
  amount: number | string;
  categories: string[];
};

export default function ExpenseCard({
  title,
  amount,
  categories,
}: ExpenseCardProps) {
  return (
    <Card className="p-4 rounded-2xl shadow-lg bg-white dark:bg-zinc-900">
      <CardHeader className="flex justify-between items-center">
        <div className="text-xl font-semibold">{title}</div>
        <PiggyBank className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-zinc-600 dark:text-zinc-300">
          ₹{amount} • {categories.join(", ")}
        </p>
      </CardContent>
    </Card>
  );
}
