import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buildEmailHtml = (opts: {
  studentName: string;
  periodLabel: string;
  total: number;
  topCategory?: string;
  message?: string;
}) => {
  const { studentName, periodLabel, total, topCategory, message } = opts;
  const amount = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(total);
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; line-height:1.6; color:#111">
    <h2 style="margin:0 0 8px 0">Expense Report of ${studentName}</h2>
    <p style="margin:0 0 12px 0; color:#555">Period: <strong>${periodLabel}</strong></p>
    <p style="margin:0 0 8px 0">Total Spend: <strong>Rs ${amount}</strong></p>
    ${
      topCategory
        ? `<p style="margin:0 0 8px 0">Top Category: <strong>${topCategory}</strong></p>`
        : ""
    }
    ${message ? `<p style="margin:12px 0 0 0">${message}</p>` : ""}
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
    <p style="font-size:12px;color:#888">This is an automated notification. You can manage email preferences in the app.</p>
  </div>`;
};
