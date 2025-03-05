const TransactionService = require("../services/transactionServices");

class TransactionController {
  // Create a transaction
  static async createTransaction(req, res) {
    try {
      const userId = req.user.userId;
      const transaction = await TransactionService.createTransaction(userId, req.body);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get transactions with filters and currency conversion
  static async getTransactions(req, res) {
    try {
      const userId = req.user.id || req.user.userId;
      const { type, category, tags, currency } = req.query;
      const filter = { userId };

      if (type) filter.type = type;
      if (category) filter.category = category;
      if (tags && typeof tags === "string") {
        const tagArray = tags.split(",").map(tag => tag.trim());
        filter.tags = { $elemMatch: { $regex: new RegExp(tagArray.join("|"), "i") } };
      }
      

      const transactions = await TransactionService.getTransactions(userId, filter, currency);
      res.status(200).json(transactions);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error.message);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }

  // Update tags for a transaction
  static async updateTransactionTags(req, res) {
    try {
      const userId = req.user.userId;
      const transactionId = req.params.id;
      const { tags } = req.body;

      const updatedTransaction = await TransactionService.updateTransactionTags(transactionId, userId, tags);
      res.status(200).json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a transaction
  static async deleteTransaction(req, res) {
    try {
      const userId = req.user.userId;
      const transactionId = req.params.id;

      const result = await TransactionService.deleteTransaction(transactionId, userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TransactionController;
