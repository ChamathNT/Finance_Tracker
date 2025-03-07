const express = require("express");
const CustomerDashController = require("../controllers/customerDashController");
const AdminDashController = require("../controllers/adminDashController");
const  authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/dashboard - Fetch user dashboard
router.get("/cusDash", authenticateUser(["customer"]), CustomerDashController.getDashboard);
router.get("/adminDash", authenticateUser(["admin"]), AdminDashController.getDashboard);

module.exports = router;
