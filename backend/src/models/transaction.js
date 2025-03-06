const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "LKR" },
  category: { type: String, required: true },
  tags: [{ type: String }],
  date: { type: Date, default: Date.now },

  // Recurring Transactions
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: {
    type: String,
    enum: ["daily", "weekly", "monthly", "custom"],
    default: null,
  },
  endDate: { type: Date, default: null },
  lastProcessedDate: { type: Date, default: null },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
