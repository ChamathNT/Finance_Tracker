const Transaction = require("../models/transaction");
const Budget = require("../models/budget");
const Goal = require("../models/goals");
const Notification = require("../models/notification");
const { convertCurrency } = require("../utils/currencyUtil");

class TransactionService {
  // Create a transaction with currency support
  static async createTransaction(userId, { type, amount, currency = "LKR", category, tags, isRecurring, recurrencePattern, endDate }) {
    try {
      // Convert amount to LKR if needed
      if (currency !== "LKR") {
        const convertedAmount = await convertCurrency(amount, currency, "LKR");
        amount = convertedAmount;
        currency = "LKR";
      }

      const transaction = new Transaction({
        userId,
        type,
        amount,
        currency,
        category,
        tags,
        isRecurring,
        recurrencePattern,
        endDate,
        lastProcessedDate: isRecurring ? new Date() : null
      });

      await transaction.save();

      // Budget Check & Goal Auto-Save (if applicable)
      if (type === "expense") await this.checkBudgetLimit(userId, category);
      if (type === "income") await this.autoSaveToGoal(userId, amount);

      return transaction;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get transactions with currency conversion support
  static async getTransactions(userId, filters, targetCurrency = "LKR") {
    try {
      const transactions = await Transaction.find(filters);

      if (targetCurrency && targetCurrency !== "LKR") {
        for (let transaction of transactions) {
          transaction.amount = await convertCurrency(transaction.amount, "LKR", targetCurrency);
          transaction.currency = targetCurrency;
        }
      }

      return transactions;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Update only tags in a transaction
  static async updateTransactionTags(transactionId, userId, tags) {
    try {
      const transaction = await Transaction.findOneAndUpdate(
        { _id: transactionId, userId },
        { tags },
        { new: true }
      );

      if (!transaction) throw new Error("Transaction not found");
      return transaction;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Delete a transaction
  static async deleteTransaction(transactionId, userId) {
    try {
      const transaction = await Transaction.findOneAndDelete({
        _id: transactionId,
        userId,
      });

      if (!transaction) throw new Error("Transaction not found");
      return { message: "Transaction deleted successfully" };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Check Budget Limit
  static async checkBudgetLimit(userId, category) {
    const mongoose = require("mongoose");

    const budget = await Budget.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      category: category.toLowerCase(),
    });

    if (!budget || !budget.amount) return;

    const totalExpenses = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), category, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalSpent = totalExpenses.length ? totalExpenses[0].total : 0;

    if (totalSpent > budget.amount) {
      await Notification.create({
        userId,
        message: `🚨 Budget limit exceeded for ${category}! You have spent ${totalSpent} LKR.`,
        type: "spending_alert",
      });
    }
  }

  // Auto-Save to Goals
  static async autoSaveToGoal(userId, incomeAmount) {
    const goals = await Goal.find({ userId, autoSavePercentage: { $gt: 0 } });

    for (const goal of goals) {
      const saveAmount = (goal.autoSavePercentage / 100) * incomeAmount;
      goal.currentAmount += saveAmount;
      await goal.save();

      if (goal.currentAmount >= goal.targetAmount) {
        await Notification.create({
          userId,
          message: `🎉 Goal "${goal.title}" has been completed!`,
          type: "goal_update",
        });
      }
    }
  }

  // 🔹 Handle Recurring Transactions
  static async handleRecurringTransactions() {
    const now = new Date();

    console.log("⏳ Fetching recurring transactions...");
    const transactions = await Transaction.find({ isRecurring: true });

    if (transactions.length === 0) {
      console.log("⚠️ No recurring transactions found.");
      return;
    }

    console.log(`🔄 Found ${transactions.length} recurring transactions.`);

    for (const transaction of transactions) {
      console.log(`📝 Checking transaction ${transaction._id} (${transaction.category})...`);

      if (!this.shouldProcessTransaction(transaction, now)) {
        console.log(`⏭ Skipping transaction ${transaction._id}, not due yet.`);
        continue;
      }

      console.log(`✅ Processing recurring transaction: ${transaction._id}`);
      
      // Create a new transaction
      const newTransaction = new Transaction({
        userId: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        category: transaction.category,
        tags: transaction.tags,
        date: now,
        isRecurring: transaction.endDate ? true : false,
        recurrencePattern: transaction.recurrencePattern,
        endDate: transaction.endDate,
        lastProcessedDate: now
      });

      await newTransaction.save();
      console.log(`💾 Saved new transaction ${newTransaction._id}`);

      // Mark the previous transaction as non-recurring
      await Transaction.findByIdAndUpdate(transaction._id, { isRecurring: false });
      console.log(`⛔ Set previous transaction ${transaction._id} as non-recurring.`);

      // Send notification
      await Notification.create({
        userId: transaction.userId,
        message: `🔄 Your recurring transaction (${transaction.category}) has been processed.`,
        type: "bill_reminder",
      });

      console.log(`📩 Sent notification for ${newTransaction._id}`);
    }
  }

  // Determines if a transaction should be processed
  static shouldProcessTransaction(transaction, now) {
    if (!transaction.lastProcessedDate) return true;

    const lastDate = new Date(transaction.lastProcessedDate);
    const diff = now - lastDate;

    switch (transaction.recurrencePattern) {
      case "custom":
        return diff >= 3 * 60 * 1000; // 3 minutes
      case "daily":
        return diff >= 24 * 60 * 60 * 1000;
      case "weekly":
        return diff >= 7 * 24 * 60 * 60 * 1000;
      case "monthly":
        return now.getMonth() !== lastDate.getMonth();
      default:
        return false;
    }
  }

}

module.exports = TransactionService;
