const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "LKR" }, // Default currency is LKR
  category: { type: String, required: true }, // e.g., Food, Transport
  tags: [{ type: String }], // e.g., ["#vacation", "#bills"]
  date: { type: Date, default: Date.now },


  // Recurring Transactions
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    default: null,
  },
  endDate: { type: Date, default: null },

  // NEW: Last date a recurring transaction was processed
  lastProcessedDate: { type: Date, default: null }
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;