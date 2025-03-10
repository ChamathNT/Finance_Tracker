const DashboardService = require("../../src/services/customerDashServices");
const Transaction = require("../../src/models/transaction");
const Budget = require("../../src/models/budget");
const Goal = require("../../src/models/goals");
const mongoose = require("mongoose");

jest.mock("../../src/models/transaction");
jest.mock("../../src/models/budget");
jest.mock("../../src/models/goals");

describe("DashboardService", () => {
  const userId = new mongoose.Types.ObjectId();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getDashboardData", () => {
    it("should return correct dashboard data", async () => {
      // Mock transaction aggregation response
      Transaction.aggregate.mockResolvedValue([
        { _id: "income", totalAmount: 5000 },
        { _id: "expense", totalAmount: 3000 }
      ]);

      // Mock budgets with chainable query methods
      Budget.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          { category: "Food", amount: 1000, startDate: "2024-03-01", endDate: "2024-03-31" },
          { category: "Rent", amount: 2000, startDate: "2024-03-01", endDate: "2024-03-31" }
        ])
      });

      // Mock goals with chainable query methods
      Goal.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          { title: "Vacation", targetAmount: 5000, currentAmount: 2500, deadline: "2024-06-30" }
        ])
      });

      // Mock transactions with chainable query methods
      Transaction.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          { type: "income", amount: 1000, date: "2024-03-05" },
          { type: "expense", amount: 500, date: "2024-03-06" }
        ])
      });

      // Call the function
      const result = await DashboardService.getDashboardData(userId);

      // Assertions
      expect(Transaction.aggregate).toHaveBeenCalledWith([
        { $match: { userId } },
        { $group: { _id: "$type", totalAmount: { $sum: "$amount" } } }
      ]);
      expect(Budget.find).toHaveBeenCalledWith({ userId });
      expect(Goal.find).toHaveBeenCalledWith({ userId });
      expect(Transaction.find).toHaveBeenCalledWith({ userId });

      expect(result).toEqual({
        totalIncome: 5000,
        totalExpenses: 3000,
        budgetSummary: [
          { category: "Food", allocatedAmount: 1000, startDate: "2024-03-01", endDate: "2024-03-31" },
          { category: "Rent", allocatedAmount: 2000, startDate: "2024-03-01", endDate: "2024-03-31" }
        ],
        goalSummary: [
          { title: "Vacation", targetAmount: 5000, currentAmount: 2500, remainingAmount: 2500, deadline: "2024-06-30" }
        ],
        recentTransactions: [
          { type: "income", amount: 1000, date: "2024-03-05" },
          { type: "expense", amount: 500, date: "2024-03-06" }
        ]
      });
    });

    it("should return zero values when no data is found", async () => {
      Transaction.aggregate.mockResolvedValue([]);

      Budget.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });

      Goal.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });

      Transaction.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });

      const result = await DashboardService.getDashboardData(userId);

      expect(result).toEqual({
        totalIncome: 0,
        totalExpenses: 0,
        budgetSummary: [],
        goalSummary: [],
        recentTransactions: []
      });
    });

    it("should throw an error when a database query fails", async () => {
      Transaction.aggregate.mockRejectedValue(new Error("Database error"));

      await expect(DashboardService.getDashboardData(userId)).rejects.toThrow(
        "Error fetching dashboard data: Database error"
      );
    });
  });
});
