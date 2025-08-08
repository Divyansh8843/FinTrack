import mongoose from "mongoose";
const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  category: String,
  date: Date,
  description: String,
  source: String,
  imageUrl: String,
});
export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);