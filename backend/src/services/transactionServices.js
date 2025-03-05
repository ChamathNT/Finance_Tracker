const Transaction = require("../models/transaction");
const Budget = require("../models/budget");
const Goal = require("../models/goals");
const Notification = require("../models/notification");
const { convertCurrency } = require("../utils/currencyUtil");

class TransactionService {
  // Create a transaction with currency support
  static async createTransaction(userId, { type, amount, category, tags, currency = "LKR" }) {
    try {
      const transaction = new Transaction({
        userId,
        type,
        amount,
        category,
        tags,
        currency, // Store currency
      });

      await transaction.save();

      if (type === "expense") {
        await this.checkBudgetLimit(userId, category);
      }

      if (type === "income") {
        await this.autoSaveToGoal(userId, amount);
      }

      return transaction;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get transactions with currency conversion support
  static async getTransactions(userId, filters, targetCurrency = "LKR") {
    try {
      const transactions = await Transaction.find({ userId, ...filters });

      if (targetCurrency) {
        // Convert each transaction amount to the requested currency
        const convertedTransactions = await Promise.all(
          transactions.map(async (transaction) => {
            if (transaction.currency !== targetCurrency) {
              const convertedAmount = await convertCurrency(transaction.amount, transaction.currency, targetCurrency);
              return { ...transaction.toObject(), amount: convertedAmount, currency: targetCurrency };
            }
            return transaction.toObject();
          })
        );

        return convertedTransactions;
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
          message: `Goal "${goal.title}" has been completed!`,
          type: "goal_update",
        });
      }
    }
  }
}

module.exports = TransactionService;
