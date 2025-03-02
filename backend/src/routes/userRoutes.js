const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { register, login, logout, refreshToken } = require("../controllers/authController");
const userAuth = require("../middleware/authMiddleware");
const refreshTokenMiddleware = require("../middleware/refreshMiddleware");

router.post("/signup", register);
router.post("/signin/admin", (req, res) => authController.login(req, res, "admin"));
router.post("/signin/customer", (req, res) => authController.login(req, res, "customer")); 
router.post("/refresh-token", refreshToken); 
router.post("/signout", logout); 

module.exports = router;
