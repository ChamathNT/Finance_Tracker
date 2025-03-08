const mongoose = require("mongoose");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const Budget = require("../models/budget");
const Goal = require("../models/goals");
const Notification = require("../models/notification");

class AdminService {
    static async deleteUser(objectId) {

        if (!objectId || objectId.trim() === "") {
            throw new Error("User ObjectId is required");
        }

        // Convert objectId to a MongoDB ObjectId
        const userObjectId = new mongoose.Types.ObjectId(objectId);

        // Find the user by ObjectId
        const user = await User.findById(userObjectId);
        if (!user) {
            throw new Error("User not found");
        }


        // Ensure the user is not an admin
        if (user.role === "admin") {
            throw new Error("Admins cannot delete other admins");
        }

        const userId = user._id.toString(); // Convert ObjectId to string for deletion

        // Delete related records using the user's `userId`
        await Transaction.deleteMany({ userId });
        await Budget.deleteMany({ userId });
        await Goal.deleteMany({ userId });
        await Notification.deleteMany({ userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        return { message: "Customer and related records deleted successfully" };
    }
}

module.exports = AdminService;
