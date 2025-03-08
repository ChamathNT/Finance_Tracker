const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminOnlyController");
const authenticateUser = require("../middleware/authMiddleware");


router.delete("/deleteuser/:id", authenticateUser(["admin"]), adminController.deleteUser);

module.exports = router;
