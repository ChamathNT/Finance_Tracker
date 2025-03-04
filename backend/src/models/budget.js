const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: false }, // If null, it's a total monthly budget
  amount: { type: Number, required: true }, // Budget amount
  currency: { type: String, required: true, default: "LKR" }, // Currency code (e.g., USD, EUR, LKR)
  startDate: { type: Date, required: true }, // Start of the budget period
  endDate: { type: Date, required: true }, // End of the budget period
  createdAt: { type: Date, default: Date.now },
});

const Budget = mongoose.model("Budget", BudgetSchema);
module.exports = Budget;
