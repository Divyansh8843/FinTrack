import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  studentType: String,
  budget: {
    monthly: Number,
    categories: Object,
  },
  emailSettings: {
    enabled: { type: Boolean, default: false },
    parentEmail: { type: String, default: "" },
    thresholdType: {
      type: String,
      enum: ["monthly", "weekly", "never"],
      default: "monthly",
    },
    thresholdAmount: { type: Number, default: 0 },
  },
  goals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Goal" }],
});
export default mongoose.models.User || mongoose.model("User", UserSchema);
