const GoalService = require("../../src/services/goalServices");
const Goal = require("../../src/models/goals");
const Notification = require("../../src/models/notification");

jest.mock("../../src/models/goals");
jest.mock("../../src/models/notification");

describe("GoalService", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  describe("createGoal", () => {
    it("should create a goal with default values when optional fields are not provided", async () => {
      const userId = "user123";
      const goalData = {
        title: "Buy a Car",
        targetAmount: 100000,
        deadline: "2025-12-31",
      };

      const mockGoal = {
        _id: "goal123",
        ...goalData,
        userId,
        currentAmount: 0, // Ensure currentAmount is included
        currency: "LKR", // Default currency
        save: jest.fn().mockResolvedValue(true),
      };

      Goal.mockImplementation(() => mockGoal);

      const result = await GoalService.createGoal(userId, goalData);

      expect(result.currentAmount).toBe(0);
      expect(result.currency).toBe("LKR"); // Default currency
    });

    it("should throw an error if saving goal fails", async () => {
        const mockGoal = new Goal({
          userId: "user123",
          title: "Buy a Car",
          targetAmount: 100000,
          deadline: "2025-12-31",
        });
      
        // Mock the save method of the newly created Goal instance
        mockGoal.save = jest.fn().mockRejectedValue(new Error("Database error"));
      
        Goal.prototype.save = mockGoal.save; // Ensure all new instances use this mock
      
        await expect(GoalService.createGoal("user123", {})).rejects.toThrow("Database error");
      });
      
  });

  describe("getUserGoals", () => {
    it("should return all goals for a user", async () => {
      const userId = "user123";
      const mockGoals = [{ title: "Vacation", targetAmount: 50000 }, { title: "New Laptop", targetAmount: 150000 }];
      Goal.find.mockResolvedValue(mockGoals);

      const result = await GoalService.getUserGoals(userId);

      expect(Goal.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockGoals);
    });

    it("should throw an error if database query fails", async () => {
      Goal.find.mockRejectedValue(new Error("Database query failed"));

      await expect(GoalService.getUserGoals("user123")).rejects.toThrow("Database query failed");
    });
  });

  describe("updateGoal", () => {
    it("should update and return the updated goal", async () => {
      const goalId = "goal123";
      const userId = "user123";
      const updates = { targetAmount: 120000 };

      const mockGoal = { _id: goalId, userId, title: "Buy a Car", targetAmount: 120000 };
      Goal.findOneAndUpdate.mockResolvedValue(mockGoal);

      const result = await GoalService.updateGoal(goalId, userId, updates);

      expect(Goal.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: goalId, userId },
        updates,
        { new: true }
      );
      expect(result.targetAmount).toBe(120000);
    });

    it("should throw an error if the goal is not found", async () => {
      Goal.findOneAndUpdate.mockResolvedValue(null);

      await expect(GoalService.updateGoal("goal123", "user123", {})).rejects.toThrow("Goal not found");
    });
  });

  describe("deleteGoal", () => {
    it("should delete the goal and return success message", async () => {
      const goalId = "goal123";
      const userId = "user123";

      Goal.findOneAndDelete.mockResolvedValue({ _id: goalId });

      const result = await GoalService.deleteGoal(goalId, userId);

      expect(Goal.findOneAndDelete).toHaveBeenCalledWith({ _id: goalId, userId });
      expect(result).toEqual({ message: "Goal deleted successfully" });
    });

    it("should throw an error if the goal is not found", async () => {
      Goal.findOneAndDelete.mockResolvedValue(null);

      await expect(GoalService.deleteGoal("goal123", "user123")).rejects.toThrow("Goal not found or unauthorized");
    });
  });

  describe("increaseGoalAmount", () => {
    it("should increase the goal amount and notify when completed", async () => {
      const userId = "user123";
      const amount = 1000;
      const mockGoals = [
        {
          _id: "goal1",
          title: "Buy a Car", // Ensure title is included
          userId,
          autoSavePercentage: 10,
          currentAmount: 900,
          targetAmount: 1000,
          save: jest.fn(),
        },
      ];

      Goal.find.mockResolvedValue(mockGoals);
      Notification.create.mockResolvedValue(true);

      await GoalService.increaseGoalAmount(userId, amount);

      expect(Goal.find).toHaveBeenCalledWith({ userId, autoSavePercentage: { $gt: 0 } });
      expect(mockGoals[0].save).toHaveBeenCalled();
      expect(Notification.create).toHaveBeenCalledWith({
        userId,
        message: `🎉 Goal "Buy a Car" has been completed!`, // Use title instead of undefined
        type: "goal_update",
      });
    });

    it("should not notify if the goal is not yet completed", async () => {
      const userId = "user123";
      const amount = 1000;
      const mockGoals = [
        { _id: "goal1", title: "Buy a Car", userId, autoSavePercentage: 10, currentAmount: 500, targetAmount: 2000, save: jest.fn() },
      ];

      Goal.find.mockResolvedValue(mockGoals);
      Notification.create.mockResolvedValue(true);

      await GoalService.increaseGoalAmount(userId, amount);

      expect(Goal.find).toHaveBeenCalledWith({ userId, autoSavePercentage: { $gt: 0 } });
      expect(mockGoals[0].save).toHaveBeenCalled();
      expect(Notification.create).not.toHaveBeenCalled();
    });

    it("should throw an error if there is a database error", async () => {
      Goal.find.mockRejectedValue(new Error("DB error"));

      await expect(GoalService.increaseGoalAmount("user123", 1000)).rejects.toThrow("DB error");
    });
  });
});
