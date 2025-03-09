const FinancialReportService = require("../../src/services/reportServices");
const Transaction = require("../../src/models/transaction");

jest.mock("../../src/models/transaction", () => ({
  find: jest.fn(),
}));

describe("FinancialReportService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getFinancialReport", () => {
    it("should return an empty report if no transactions are found", async () => {
      Transaction.find.mockResolvedValue([]);

      const report = await FinancialReportService.getFinancialReport("user123", {});

      expect(report).toEqual({
        totalIncome: 0,
        totalExpenses: 0,
        categoryBreakdown: {},
        transactionsOverTime: {},
      });

      expect(Transaction.find).toHaveBeenCalledWith({ userId: "user123" });
    });

    it("should correctly calculate total income and expenses", async () => {
      const transactions = [
        { userId: "user123", type: "income", amount: 500, category: "Salary", date: new Date("2025-03-01") },
        { userId: "user123", type: "expense", amount: 200, category: "Food", date: new Date("2025-03-02") },
        { userId: "user123", type: "expense", amount: 100, category: "Transport", date: new Date("2025-03-02") },
      ];

      Transaction.find.mockResolvedValue(transactions);

      const report = await FinancialReportService.getFinancialReport("user123", {});

      expect(report.totalIncome).toBe(500);
      expect(report.totalExpenses).toBe(300);
    });

    it("should group transactions by category", async () => {
      const transactions = [
        { userId: "user123", type: "income", amount: 500, category: "Salary", date: new Date("2025-03-01") },
        { userId: "user123", type: "expense", amount: 200, category: "Food", date: new Date("2025-03-02") },
        { userId: "user123", type: "expense", amount: 100, category: "Food", date: new Date("2025-03-03") },
      ];

      Transaction.find.mockResolvedValue(transactions);

      const report = await FinancialReportService.getFinancialReport("user123", {});

      expect(report.categoryBreakdown).toEqual({
        Salary: 500,
        Food: 300, // (200 + 100)
      });
    });

    it("should group transactions by date", async () => {
      const transactions = [
        { userId: "user123", type: "income", amount: 500, category: "Salary", date: new Date("2025-03-01") },
        { userId: "user123", type: "expense", amount: 200, category: "Food", date: new Date("2025-03-02") },
        { userId: "user123", type: "expense", amount: 100, category: "Transport", date: new Date("2025-03-02") },
      ];

      Transaction.find.mockResolvedValue(transactions);

      const report = await FinancialReportService.getFinancialReport("user123", {});

      expect(report.transactionsOverTime).toEqual({
        "2025-03-01": { income: 500, expenses: 0 },
        "2025-03-02": { income: 0, expenses: 300 }, // (200 + 100)
      });
    });

    it("should apply date range filters", async () => {
      await FinancialReportService.getFinancialReport("user123", {
        startDate: "2025-03-01",
        endDate: "2025-03-05",
      });

      expect(Transaction.find).toHaveBeenCalledWith({
        userId: "user123",
        date: { $gte: new Date("2025-03-01"), $lte: new Date("2025-03-05") },
      });
    });

    it("should filter transactions by category (case-insensitive)", async () => {
      await FinancialReportService.getFinancialReport("user123", {
        category: "food",
      });

      expect(Transaction.find).toHaveBeenCalledWith({
        userId: "user123",
        category: { $regex: /^food$/i },
      });
    });

    it("should filter transactions by multiple tags", async () => {
      await FinancialReportService.getFinancialReport("user123", {
        tags: "groceries, dinner",
      });

      expect(Transaction.find).toHaveBeenCalledWith({
        userId: "user123",
        tags: { $elemMatch: { $regex: /groceries|dinner/i } },
      });
    });
  });
});
