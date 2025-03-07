const AdminDashboardService = require("../services/adminDashServices");

class AdminDashboardController {
  static async getDashboard(req, res) {
    try {
      const dashboardData = await AdminDashboardService.getDashboardData();
      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AdminDashboardController;
