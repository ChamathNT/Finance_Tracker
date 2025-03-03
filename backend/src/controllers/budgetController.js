const BudgetService = require("../services/budgetServices");

/**
 * Create a new budget
 */
exports.createBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const budget = await BudgetService.createBudget(userId, req.body);
    res.status(201).json({ message: "Budget created successfully", budget });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all budgets for the logged-in user with currency conversion
 */
exports.getBudgetsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const targetCurrency = req.query.currency || null;

    const budgets = await BudgetService.getBudgetsByUser(userId, targetCurrency);
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a budget
 */
exports.updateBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const budgetId = req.params.id;

    const updatedBudget = await BudgetService.updateBudget(budgetId, userId, req.body);
    res.status(200).json({ message: "Budget updated successfully", updatedBudget });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a budget
 */
exports.deleteBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const budgetId = req.params.id;

    const response = await BudgetService.deleteBudget(budgetId, userId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
