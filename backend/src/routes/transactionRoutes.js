const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/transactionController");
const authenticateUser = require("../middleware/authMiddleware");

// Protect all transaction-related routes with authentication for customers only
router.post("/createtransaction", authenticateUser(["customer"]), TransactionController.createTransaction);
router.get("/gettransactions", authenticateUser(["customer"]), TransactionController.getTransactions);
router.put("/updatetransactiontags/:id", authenticateUser(["customer"]), TransactionController.updateTransactionTags);
router.delete("/deletetransaction/:id", authenticateUser(["customer"]), TransactionController.deleteTransaction);

module.exports = router;
