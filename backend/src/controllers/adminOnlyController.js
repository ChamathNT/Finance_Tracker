const AdminService = require("../services/adminOnlyServices");

class AdminController {
    static async deleteUser(req, res) {
        try {

            const { id } = req.params;  // Use `id` instead of `userId`

            if (!id) {
                return res.status(400).json({ message: "User ObjectId is required" });
            }

            const response = await AdminService.deleteUser(id);
            res.json(response);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = AdminController;

