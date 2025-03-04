const Budget = require("../models/budget");
const { convertCurrency } = require("../utils/currencyUtil");

/**
 * Create a new budget.
 */
exports.createBudget = async (userId, budgetData) => {
  const { category, amount, currency, startDate, endDate } = budgetData;

  const budget = new Budget({
    userId,
    category,
    amount,
    currency: currency || "LKR", // Default to LKR
    startDate,
    endDate,
  });

  await budget.save();
  return budget;
};

/**
 * Get all budgets for a user with optional currency conversion.
 */
exports.getBudgetsByUser = async (userId, targetCurrency) => {
  const budgets = await Budget.find({ userId });

  return await Promise.all(
    budgets.map(async (budget) => {
      let convertedAmount = budget.amount;

      if (targetCurrency && budget.currency !== targetCurrency) {
        convertedAmount = await convertCurrency(budget.amount, budget.currency, targetCurrency);
      }

      return {
        id: budget._id,
        category: budget.category || "Total Budget",
        amount: `${convertedAmount} ${targetCurrency || budget.currency}`,
        currency: budget.currency,
        startDate: budget.startDate,
        endDate: budget.endDate,
      };
    })
  );
};

/**
 * Update an existing budget.
 */
exports.updateBudget = async (budgetId, userId, updateData) => {
  const budget = await Budget.findOneAndUpdate(
    { _id: budgetId, userId },
    updateData,
    { new: true } // Return the updated document
  );

  if (!budget) {
    throw new Error("Budget not found or unauthorized");
  }

  return budget;
};

/**
 * Delete a budget.
 */
exports.deleteBudget = async (budgetId, userId) => {
  const budget = await Budget.findOneAndDelete({ _id: budgetId, userId });

  if (!budget) {
    throw new Error("Budget not found or unauthorized");
  }

  return { message: "Budget deleted successfully" };
};
