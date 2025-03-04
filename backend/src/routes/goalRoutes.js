const express = require("express");
const router = express.Router();
const GoalController = require("../controllers/goalController");
const authenticateUser = require("../middleware/authMiddleware");

// Protect all goal-related routes with authentication
router.post("/creategoals", authenticateUser(["customer"]), GoalController.createGoal);
router.get("/getgoals", authenticateUser(["customer"]), GoalController.getGoals);
router.put("/updategoals/:id", authenticateUser(["customer"]), GoalController.updateGoal);
router.delete("/deletegoals/:id", authenticateUser(["customer"]), GoalController.deleteGoal);

module.exports = router;
