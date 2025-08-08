import mongoose from "mongoose";
const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  targetAmount: Number,
  savedAmount: Number,
  deadline: Date,
  aiRecommendedMonthly: Number,
});
export default mongoose.models.Goal || mongoose.model("Goal", GoalSchema);