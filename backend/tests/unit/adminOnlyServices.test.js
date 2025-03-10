const mongoose = require("mongoose");
const AdminService = require("../../src/services/adminOnlyServices");
const User = require("../../src/models/user");
const Transaction = require("../../src/models/transaction");
const Budget = require("../../src/models/budget");
const Goal = require("../../src/models/goals");
const Notification = require("../../src/models/notification");

jest.mock("../../src/models/user");
jest.mock("../../src/models/transaction");
jest.mock("../../src/models/budget");
jest.mock("../../src/models/goals");
jest.mock("../../src/models/notification");

describe("AdminService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("deleteUser", () => {
    it("should delete a customer and all related records", async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      // Mock user data (customer)
      const mockUser = { _id: userId, role: "customer" };
      User.findById.mockResolvedValue(mockUser);

      // Mock delete operations
      Transaction.deleteMany.mockResolvedValue({ deletedCount: 5 });
      Budget.deleteMany.mockResolvedValue({ deletedCount: 2 });
      Goal.deleteMany.mockResolvedValue({ deletedCount: 3 });
      Notification.deleteMany.mockResolvedValue({ deletedCount: 4 });
      User.findByIdAndDelete.mockResolvedValue({ deletedCount: 1 });

      // Call deleteUser
      const result = await AdminService.deleteUser(userId);

      // Assertions
      expect(User.findById).toHaveBeenCalledWith(new mongoose.Types.ObjectId(userId));
      expect(Transaction.deleteMany).toHaveBeenCalledWith({ userId });
      expect(Budget.deleteMany).toHaveBeenCalledWith({ userId });
      expect(Goal.deleteMany).toHaveBeenCalledWith({ userId });
      expect(Notification.deleteMany).toHaveBeenCalledWith({ userId });
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);

      expect(result).toEqual({ message: "Customer and related records deleted successfully" });
    });

    it("should throw an error if user ObjectId is missing or empty", async () => {
      await expect(AdminService.deleteUser("")).rejects.toThrow("User ObjectId is required");
      await expect(AdminService.deleteUser(null)).rejects.toThrow("User ObjectId is required");
    });

    it("should throw an error if user is not found", async () => {
      User.findById.mockResolvedValue(null);

      await expect(AdminService.deleteUser(new mongoose.Types.ObjectId().toString()))
        .rejects.toThrow("User not found");
    });

    it("should throw an error if the user is an admin", async () => {
      const adminUser = { _id: new mongoose.Types.ObjectId(), role: "admin" };
      User.findById.mockResolvedValue(adminUser);

      await expect(AdminService.deleteUser(adminUser._id.toString()))
        .rejects.toThrow("Admins cannot delete other admins");
    });

    it("should throw an error if database operations fail", async () => {
      User.findById.mockRejectedValue(new Error("Database error"));

      await expect(AdminService.deleteUser(new mongoose.Types.ObjectId().toString()))
        .rejects.toThrow("Database error");
    });
  });
});
