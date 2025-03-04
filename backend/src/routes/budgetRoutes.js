const express = require("express");
const router = express.Router();
const BudgetController = require("../controllers/budgetController");
const authenticateUser = require("../middleware/authMiddleware");

// Protected routes - only accessible by customers
router.post("/createbudget", authenticateUser(["customer"]), BudgetController.createBudget);
router.get("/readbudget", authenticateUser(["customer"]), BudgetController.getBudgetsByUser);
router.put("/updatebudget/:id", authenticateUser(["customer"]), BudgetController.updateBudget);
router.delete("/deletebudget/:id", authenticateUser(["customer"]), BudgetController.deleteBudget);

module.exports = router;
