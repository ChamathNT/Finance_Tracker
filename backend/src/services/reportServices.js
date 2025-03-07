const Transaction = require("../models/transaction");

class FinancialReportService {
  // Fetch transactions within a date range, category, or tags
  static async getFinancialReport(userId, { startDate, endDate, category, tags }) {
    try {
      const filter = { userId };
  
      // Apply date range filter
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }
  
      // ✅ Fix: Ensure category is not empty before using regex
      if (category && typeof category === "string" && category.trim() !== "") {
        filter.category = { $regex: new RegExp(`^${category.trim()}$`, "i") }; // Case-insensitive
      }
  
      // ✅ Fix: Ensure tags filter works properly
      if (tags && typeof tags === "string") {
        const tagArray = tags.split(",").map(tag => tag.trim());
        filter.tags = { $elemMatch: { $regex: new RegExp(tagArray.join("|"), "i") } };
      }
  
  
      // Get transactions
      const transactions = await Transaction.find(filter);
  
      // Group transactions by type (income vs. expense)
      const report = {
        totalIncome: 0,
        totalExpenses: 0,
        categoryBreakdown: {},
        transactionsOverTime: {},
      };
  
      transactions.forEach((txn) => {
        if (txn.type === "income") {
          report.totalIncome += txn.amount;
        } else if (txn.type === "expense") { // Ensure expense is correctly identified
          report.totalExpenses += txn.amount;
        }
      
        // Categorized breakdown
        if (!report.categoryBreakdown[txn.category]) {
          report.categoryBreakdown[txn.category] = 0;
        }
        report.categoryBreakdown[txn.category] += txn.amount;
      
        // Group by date
        const dateKey = txn.date.toISOString().split("T")[0];
      
        // ✅ Fix: Ensure correct fields (remove "expense" and use "expenses")
        if (!report.transactionsOverTime[dateKey]) {
          report.transactionsOverTime[dateKey] = { income: 0, expenses: 0 }; // No extra "expense" field
        }
      
        if (txn.type === "income") {
          report.transactionsOverTime[dateKey].income += txn.amount;
        } else if (txn.type === "expense") {
          report.transactionsOverTime[dateKey].expenses += txn.amount; // ✅ Fix: Ensure expenses accumulate
        }
      });
      
  
      return report;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  
}

module.exports = FinancialReportService;
