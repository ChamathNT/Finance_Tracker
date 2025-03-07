const FinancialReportService = require("../services/reportServices");

class FinancialReportController {
  static async getFinancialReport(req, res) {
    try {
      const userId = req.user.userId;
      const { startDate, endDate, category, tags } = req.query;

      const report = await FinancialReportService.getFinancialReport(userId, {
        startDate,
        endDate,
        category,
        tags,
      });

      res.status(200).json(report);
    } catch (error) {
      console.error("❌ Error fetching financial report:", error.message);
      res.status(500).json({ error: "Failed to fetch financial report" });
    }
  }
}

module.exports = FinancialReportController;
