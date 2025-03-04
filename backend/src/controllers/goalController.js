const GoalService = require("../services/goalServices");

class GoalController {
  // Create a new goal
  static async createGoal(req, res) {
    try {
      const userId = req.user.userId; // Extract user ID from token
      const goal = await GoalService.createGoal(userId, req.body);
      res.status(201).json(goal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all goals for a user
  static async getGoals(req, res) {
    try {
      const userId = req.user.userId;
      const goals = await GoalService.getUserGoals(userId);
      res.status(200).json(goals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Edit goal
  static async updateGoal(req, res) {
    try {
      const userId = req.user.userId;
      const goalId = req.params.id;
      const updates = req.body;

      const updatedGoal = await GoalService.updateGoal(goalId, userId, updates);
      res.status(200).json(updatedGoal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete goal
  static async deleteGoal(req, res) {
    try {
      const userId = req.user.userId;
      const goalId = req.params.id;

      const result = await GoalService.deleteGoal(goalId, userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = GoalController;
