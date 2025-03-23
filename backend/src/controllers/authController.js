const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

// Generate Access Token (Expires in 45 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role }, // ✅ Include role in token
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "45m" }
  );
};

// Generate Refresh Token (Expires in 7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id }, // No need to include role in refresh token
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

// User Registration
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken; // Store refresh token in DB
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ accessToken, role: user.role }); // ✅ Return role for frontend
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(403).json({ message: "Refresh token required" });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const newAccessToken = generateAccessToken(user);
      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(200).json({ message: "User already logged out" });

    // Decode refresh token to get userId
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const user = await User.findById(decoded.userId);
      if (!user) return res.status(200).json({ message: "User already logged out" });

      user.refreshToken = null;
      await user.save();

      res.clearCookie("refreshToken");
      res.json({ message: "Logged out successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
