const DashboardService = require("../services/customerDashServices");

class DashboardController {
    static async getDashboard(req, res) {
        try {


            if (!req.user || !req.user.userId) {  
                return res.status(400).json({ message: "User ID not found in request" });
            }

            const userId = req.user.userId; 


            const dashboardData = await DashboardService.getDashboardData(userId);
            res.json(dashboardData);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}



module.exports = DashboardController;
