const jwt = require("jsonwebtoken");
const db = require('../models');

const User = db.User;

module.exports.verifyToken = async (req, res, next) => {

  const token = req.cookies.authToken;

  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id:decoded.id } });

    if (!user || user.status === "deleted") {
        res.clearCookie('authToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "None" }); 
        return res.status(404).json({ message: "User not found or deleted" });
    }

    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};



module.exports.TFAverifyEmail = async (req, res, next) => {
  try {
      const { token } = req.query;

      if (!token) {
          return res.status(400).json({ message: 'Invalid or missing token' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.EMAIL_SECRET);

      // Find user
      const user = await User.findOne({ where: { email: decoded.email } });

      if (!user || user.status === "deleted") {
          return res.status(404).json({ message: "User not found or deleted" });
      }

      if (!user.email_verified) {
          return res.status(404).json({ message: "Email is not verified. Try TFA SMS Verification." });
      }

      await user.update({ TFAverifyEmail: true });

      console.log("Email verified for 2FA successfully!");

      req.user = user;

      next();

  } catch (error) {
      console.error("Error verifying email:", error);
      return res.status(400).json({ message: "Invalid or expired token" });
  }
};



module.exports.TFAverifySMS = async (req, res, next) => {
  try {
      const { phoneNumber, otp } = req.body;

      const user = await User.findOne({ where: { phoneNumber } });

      if (!user || user.status === "deleted") {
          return res.status(404).json({ message: "User not found or deleted" });
      }

      if (!user.phone_verified) {
        return res.status(404).json({ message: "Phone Number is not verified. Try TFA Email Verification." });
      }

      if (user.otp !== otp) {
          return res.status(400).json({ message: 'Invalid OTP' });
      }

      if (new Date() > user.otpExpiresAt) {
          return res.status(400).json({ message: 'OTP expired' });
      }

      await user.update({ otp: null, otpExpiresAt: null, TFAverifySMS: true });

      console.log("Phone number verified for 2FA successfully!");

      req.user = user;
      next();

  } catch (error) {
      console.error('Error verifying OTP:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};