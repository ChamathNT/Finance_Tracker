const TransactionService = require("../../src/services/transactionServices");
const Transaction = require("../../src/models/transaction");
const Budget = require("../../src/models/budget");
const Goal = require("../../src/models/goals");
const Notification = require("../../src/models/notification");
const { convertCurrency } = require("../../src/utils/currencyUtil");

jest.mock("../../src/models/transaction");
jest.mock("../../src/models/budget");
jest.mock("../../src/models/goals");
jest.mock("../../src/models/notification");
jest.mock("../../src/utils/currencyUtil");

describe("TransactionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTransaction", () => {
    // it("should create a transaction and convert currency if needed", async () => {
    //   const userId = "user123";
    //   const transactionData = {
    //     type: "expense",
    //     amount: 100,
    //     currency: "USD",
    //     category: "Food",
    //     tags: ["dinner"],
    //     isRecurring: false,
    //   };

    //   // Mocking currency conversion (USD to LKR)
    //   convertCurrency.mockResolvedValue(32000);

    //   // Mock save method on Transaction model
    //   const saveMock = jest.fn().mockResolvedValue({ ...transactionData, currency: "LKR" });
    //   Transaction.prototype.save = saveMock;

    //   // Mock external service methods
    //   TransactionService.checkBudgetLimit = jest.fn();
    //   TransactionService.autoSaveToGoal = jest.fn();

    //   // Call createTransaction method
    //   const transaction = await TransactionService.createTransaction(userId, transactionData);

    //   // Verifications
    //   expect(convertCurrency).toHaveBeenCalledWith(100, "USD", "LKR");
    //   expect(transaction.currency).toBe("LKR");  // Currency should be updated
    //   expect(Transaction.prototype.save).toHaveBeenCalled();
    //   expect(TransactionService.checkBudgetLimit).toHaveBeenCalledWith(userId, "Food");
    // });

    it("should throw an error if transaction creation fails", async () => {
      Transaction.prototype.save = jest.fn().mockRejectedValue(new Error("Database error"));
      await expect(TransactionService.createTransaction("user123", {})).rejects.toThrow("Database error");
    });
  });

  describe("getTransactions", () => {
    it("should return transactions and convert currency if required", async () => {
      const transactions = [
        { amount: 1000, currency: "LKR" },
        { amount: 2000, currency: "LKR" },
      ];

      Transaction.find = jest.fn().mockResolvedValue(transactions);
      convertCurrency.mockResolvedValueOnce(10).mockResolvedValueOnce(20); // Convert to USD

      const result = await TransactionService.getTransactions("user123", {}, "USD");

      expect(convertCurrency).toHaveBeenCalledTimes(2);
      expect(result[0].amount).toBe(10);
      expect(result[1].amount).toBe(20);
    });

    it("should throw an error if fetching transactions fails", async () => {
      Transaction.find = jest.fn().mockRejectedValue(new Error("Fetch error"));
      await expect(TransactionService.getTransactions("user123", {})).rejects.toThrow("Fetch error");
    });
  });

  describe("updateTransactionTags", () => {
    it("should update tags of a transaction", async () => {
      const transaction = { _id: "txn123", tags: ["groceries"] };

      Transaction.findOneAndUpdate = jest.fn().mockResolvedValue(transaction);

      const updatedTransaction = await TransactionService.updateTransactionTags("txn123", "user123", ["shopping"]);

      expect(Transaction.findOneAndUpdate).toHaveBeenCalled();
      expect(updatedTransaction.tags).toContain("groceries");
    });

    it("should throw an error if transaction is not found", async () => {
      Transaction.findOneAndUpdate = jest.fn().mockResolvedValue(null);
      await expect(TransactionService.updateTransactionTags("txn123", "user123", ["shopping"]))
        .rejects.toThrow("Transaction not found");
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction", async () => {
      Transaction.findOneAndDelete = jest.fn().mockResolvedValue({ _id: "txn123" });

      const response = await TransactionService.deleteTransaction("txn123", "user123");

      expect(Transaction.findOneAndDelete).toHaveBeenCalled();
      expect(response.message).toBe("Transaction deleted successfully");
    });

    it("should throw an error if transaction is not found", async () => {
      Transaction.findOneAndDelete = jest.fn().mockResolvedValue(null);
      await expect(TransactionService.deleteTransaction("txn123", "user123"))
        .rejects.toThrow("Transaction not found");
    });
  });


  describe("handleRecurringTransactions", () => {
    it("should process and create new recurring transactions", async () => {
      const transaction = {
        _id: "txn123",
        userId: "user123",
        type: "expense",
        amount: 1000,
        currency: "LKR",
        category: "Rent",
        tags: [],
        isRecurring: true,
        recurrencePattern: "daily",
        lastProcessedDate: new Date(Date.now() - 25 * 60 * 60 * 1000),
      };

      Transaction.find = jest.fn().mockResolvedValue([transaction]);
      Transaction.prototype.save = jest.fn().mockResolvedValue(transaction);
      Transaction.findByIdAndUpdate = jest.fn();
      Notification.create = jest.fn();

      await TransactionService.handleRecurringTransactions();

      expect(Transaction.prototype.save).toHaveBeenCalled();
      expect(Notification.create).toHaveBeenCalled();
    });

    it("should skip transactions that are not due", async () => {
      const transaction = {
        _id: "txn123",
        recurrencePattern: "daily",
        lastProcessedDate: new Date(),
      };

      Transaction.find = jest.fn().mockResolvedValue([transaction]);
      Transaction.prototype.save = jest.fn();
      Notification.create = jest.fn();

      await TransactionService.handleRecurringTransactions();

      expect(Transaction.prototype.save).not.toHaveBeenCalled();
      expect(Notification.create).not.toHaveBeenCalled();
    });
  });
});
