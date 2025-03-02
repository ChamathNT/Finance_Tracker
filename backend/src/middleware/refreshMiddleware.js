// const jwt = require("jsonwebtoken");
// const User = require("../models/user");

// const verifyRefreshToken = async (req, res, next) => {
//   try {
//     console.log ("abcdefg");
//     const { refreshToken } = req.cookies;
//     if (!refreshToken) return res.status(403).json({ message: "Refresh token required" });

//     const user = await User.findOne({ refreshToken });
//     if (!user) return res.status(403).json({ message: "Invalid refresh token" });

//     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
//       if (err) return res.status(403).json({ message: "Invalid refresh token" });

//       req.user = decoded; // Attach user info to request
//       next();
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// module.exports = verifyRefreshToken;
