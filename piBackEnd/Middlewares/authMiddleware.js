// middlewares/authMiddleware.js
import User from "../models/user.js";

/**
 * 🔐 Simple authentication middleware without JWT
 * Gets userId from request and sets it for use in controllers
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers["user-id"] || req.query.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required. Please provide user-id in headers or query.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      message: "Authentication error",
      error: error.message,
    });
  }
};
