const Goal = require("../models/goals");

class GoalService {
  // Create a new goal
  static async createGoal(userId, { title, targetAmount, deadline, autoSavePercentage, currency }) {
    try {
      const goal = new Goal({
        userId,
        title,
        targetAmount,
        currentAmount: 0, // Starts at 0
        currency: currency || "LKR", // Default to LKR if not provided
        deadline,
        autoSavePercentage: autoSavePercentage || 0,
      });

      await goal.save();
      return goal;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get all goals by user
  static async getUserGoals(userId) {
    try {
      return await Goal.find({ userId });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Edit goal
  static async updateGoal(goalId, userId, updates) {
    try {
      const goal = await Goal.findOneAndUpdate(
        { _id: goalId, userId }, // Ensure the user can only update their own goal
        updates,
        { new: true } // Return updated document
      );

      if (!goal) throw new Error("Goal not found");
      return goal;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Delete goal
  static async deleteGoal(goalId, userId) {
    try {
      const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
      if (!goal) throw new Error("Goal not found or unauthorized");
      return { message: "Goal deleted successfully" };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = GoalService;
