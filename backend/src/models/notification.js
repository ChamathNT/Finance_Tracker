const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true }, // Notification text
  type: {
    type: String,
    enum: ["spending_alert", "bill_reminder", "goal_update"],
    required: true,
  },
  isRead: { type: Boolean, default: false }, // Read/Unread Status
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;