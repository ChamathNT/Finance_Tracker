const express = require("express");
const CustomerDashController = require("../controllers/customerDashController");
const  authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/dashboard - Fetch user dashboard
router.get("/cusDash", authenticateUser(["customer"]), CustomerDashController.getDashboard);

module.exports = router;
