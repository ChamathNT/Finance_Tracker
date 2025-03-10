const AdminDashboardService = require("../../src/services/adminDashServices");
const User = require("../../src/models/user");
const Transaction = require("../../src/models/transaction");

jest.mock("../../src/models/user");
jest.mock("../../src/models/transaction");

describe("AdminDashboardService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getDashboardData", () => {
    it("should return correct dashboard data", async () => {
      // Mock user count (only customers)
      User.countDocuments.mockResolvedValue(100);

      // Mock transaction count
      Transaction.countDocuments.mockResolvedValue(500);

      // Mock financial summary
      Transaction.aggregate.mockResolvedValue([
        { _id: "income", totalAmount: 100000 },
        { _id: "expense", totalAmount: 75000 }
      ]);

      // Call the function
      const result = await AdminDashboardService.getDashboardData();

      // Assertions
      expect(User.countDocuments).toHaveBeenCalledWith({ role: "customer" });
      expect(Transaction.countDocuments).toHaveBeenCalled();
      expect(Transaction.aggregate).toHaveBeenCalledWith([
        { $group: { _id: "$type", totalAmount: { $sum: "$amount" } } }
      ]);

      expect(result).toEqual({
        totalUsers: 100,
        totalTransactions: 500,
        totalIncome: 100000,
        totalExpenses: 75000
      });
    });

    it("should return zero values when no data is found", async () => {
      User.countDocuments.mockResolvedValue(0);
      Transaction.countDocuments.mockResolvedValue(0);
      Transaction.aggregate.mockResolvedValue([]);

      const result = await AdminDashboardService.getDashboardData();

      expect(result).toEqual({
        totalUsers: 0,
        totalTransactions: 0,
        totalIncome: 0,
        totalExpenses: 0
      });
    });

    it("should throw an error when a database query fails", async () => {
      User.countDocuments.mockRejectedValue(new Error("Database error"));

      await expect(AdminDashboardService.getDashboardData()).rejects.toThrow(
        "Error fetching admin dashboard data: Database error"
      );
    });
  });
});
