const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true }, // e.g., "Buy a Car"
  targetAmount: { type: Number, required: true }, // e.g., 5000
  currentAmount: { type: Number, default: 0 }, // Starts at 0, updated as savings grow
  currency: { type: String, default: "LKR" }, // Default currency set to LKR
  deadline: { type: Date, required: true }, // Target date to reach goal
  autoSavePercentage: { type: Number, default: 0 }, // % of income automatically saved
  createdAt: { type: Date, default: Date.now },
});

const Goal = mongoose.model("Goal", GoalSchema);
module.exports = Goal;
