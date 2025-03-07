const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const Budget = require("../models/budget");
const Goal = require("../models/goals");

class DashboardService {
    static async getDashboardData(userId) {
        try {

            const objectIdUserId = new mongoose.Types.ObjectId(userId); // Ensure ObjectId format

            // Fetch Total Income & Expenses
            const transactions = await Transaction.aggregate([
                { $match: { userId: objectIdUserId } }, // Match user transactions
                {
                    $group: {
                        _id: "$type",
                        totalAmount: { $sum: "$amount" }
                    }
                }
            ]);

            let totalIncome = 0, totalExpenses = 0;
            transactions.forEach(tx => {
                if (tx._id === "income") totalIncome = tx.totalAmount;
                if (tx._id === "expense") totalExpenses = tx.totalAmount;
            });

            // Fetch Last 3 Budgets
            const budgets = await Budget.find({ userId: objectIdUserId })
                .sort({ createdAt: -1 }) // Sort by newest first
                .limit(3); // Get only the last 3

            const budgetSummary = budgets.map(budget => ({
                category: budget.category || "Overall",
                allocatedAmount: budget.amount,
                startDate: budget.startDate,
                endDate: budget.endDate
            }));

            // Fetch Last 3 Goals
            const goals = await Goal.find({ userId: objectIdUserId })
                .sort({ createdAt: -1 }) // Sort by newest first
                .limit(3); // Get only the last 3

            const goalSummary = goals.map(goal => ({
                title: goal.title,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                remainingAmount: Math.max(goal.targetAmount - goal.currentAmount, 0),
                deadline: goal.deadline
            }));

            // Fetch Recent Transactions (last 5)
            const recentTransactions = await Transaction.find({ userId: objectIdUserId })
                .sort({ date: -1 })
                .limit(5);

            return {
                totalIncome,
                totalExpenses,
                budgetSummary,
                goalSummary,
                recentTransactions
            };
        } catch (error) {
            throw new Error("Error fetching dashboard data: " + error.message);
        }
    }
}

module.exports = DashboardService;
