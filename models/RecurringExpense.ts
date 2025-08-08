import mongoose from "mongoose";
const RecurringExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  category: String,
  description: String,
  startDate: Date,
  frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"] },
  nextDueDate: Date,
  active: { type: Boolean, default: true },
});
export default mongoose.models.RecurringExpense || mongoose.model("RecurringExpense", RecurringExpenseSchema); 