const express = require("express");
const router = express.Router();
const { register, login, logout, refreshToken } = require("../controllers/authController");
const userAuth = require("../middleware/authMiddleware");


router.post("/signup", register);
router.post("/signin", login);
router.post("/refresh-token", refreshToken); 
router.post("/signout", logout); 

module.exports = router;
