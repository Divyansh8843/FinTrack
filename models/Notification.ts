import mongoose from "mongoose";
const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["budget", "goal", "recurring", "general", "expense", "info"] },
  message: String,
  read: { type: Boolean, default: false },
  link: String,
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema); 