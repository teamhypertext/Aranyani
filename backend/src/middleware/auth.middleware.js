import User from "../models/user.models.js";

export const verifyDevice = async (req, res, next) => {
  try {
    const deviceId = req.headers["device-id"];

    if (!deviceId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Device ID missing in headers",
      });
    }

    const user = await User.findOne({ deviceId });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Device ID not found in database",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during authentication",
    });
  }
};
