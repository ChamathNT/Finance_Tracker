const express = require("express");
const FinancialReportController = require("../controllers/reportController");
const authenticateUser = require("../middleware/authMiddleware"); // Ensure authentication

const router = express.Router();

// Fetch financial report
router.get("/getreport", authenticateUser(["customer"]), FinancialReportController.getFinancialReport);

module.exports = router;
