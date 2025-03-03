const express = require("express");
const router = express.Router();
const BudgetController = require("../controllers/budgetController");
const authenticateUser = require("../middleware/authMiddleware");

// Protected routes - only accessible by customers
router.post("/createbud", authenticateUser(), BudgetController.createBudget);
router.get("/readbud", authenticateUser(), BudgetController.getBudgetsByUser);
router.put("/updatebud/:id", authenticateUser(), BudgetController.updateBudget);
router.delete("/deletebud/:id", authenticateUser(), BudgetController.deleteBudget);
module.exports = router;
