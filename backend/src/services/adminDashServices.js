const User = require("../models/user");
const Transaction = require("../models/transaction");

class AdminDashboardService {
  static async getDashboardData() {
    try {
      // Get total number of users (excluding admins)
      const totalUsers = await User.countDocuments({ role: "customer" });

      // Get total transactions count
      const totalTransactions = await Transaction.countDocuments();

      // Get financial summaries
      const financialSummary = await Transaction.aggregate([
        {
          $group: {
            _id: "$type",
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);

      let totalIncome = 0, totalExpenses = 0;
      financialSummary.forEach(tx => {
        if (tx._id === "income") totalIncome = tx.totalAmount;
        if (tx._id === "expense") totalExpenses = tx.totalAmount;
      });

      return {
        totalUsers,  // Only customers
        totalTransactions,
        totalIncome,
        totalExpenses
      };
    } catch (error) {
      throw new Error("Error fetching admin dashboard data: " + error.message);
    }
  }
}

module.exports = AdminDashboardService;
