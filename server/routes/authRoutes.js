import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    collegeEmail: user.collegeEmail,
    role: user.role,
    usn: user.usn || "",
    semester: user.semester || 1,
  };
}

function sendAuthResponse(res, user, statusCode = 200) {
  return res.status(statusCode).json({
    token: createToken(user._id),
    user: serializeUser(user),
  });
}

router.post("/signup", async (req, res) => {
  try {
    const { name, collegeEmail, password, usn, semester } = req.body;

    if (!name || !collegeEmail || !password) {
      return res.status(400).json({ message: "Name, college email, and password are required." });
    }

    if (!/^[0-9A-Z]+@aiet\.org\.in$/i.test(collegeEmail)) {
      return res.status(400).json({ 
        message: "College email must be in AIET format (e.g., 4AL23CS001@aiet.org.in)" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const normalizedEmail = collegeEmail.toLowerCase().trim();
    const existingUser = await User.findOne({ collegeEmail: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this college email already exists." });
    }

    const role = getAdminEmails().includes(normalizedEmail) ? "admin" : "student";
    const semesterNumber = parseInt(semester);

    if (role === "student" && (!usn || Number.isNaN(semesterNumber) || semesterNumber < 1 || semesterNumber > 8)) {
      return res.status(400).json({ message: "USN and semester are required for student signup." });
    }

    const userData = {
      name,
      collegeEmail: normalizedEmail,
      password,
      role,
    };

    // Add student-specific fields if not admin
    if (role === "student") {
      userData.usn = usn ? usn.trim().toUpperCase() : "";
      userData.semester = semesterNumber;
    }

    const user = await User.create(userData);
    return sendAuthResponse(res, user, 201);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Signup failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { collegeEmail, password } = req.body;

    if (!collegeEmail || !password) {
      return res.status(400).json({ message: "College email and password are required." });
    }

    const user = await User.findOne({ collegeEmail: collegeEmail.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid college email or password." });
    }

    if (user.role !== "admin" && getAdminEmails().includes(user.collegeEmail)) {
      user.role = "admin";
      await user.save({ validateBeforeSave: false });
    }

    return sendAuthResponse(res, user);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Login failed." });
  }
});

router.get("/me", protect, (req, res) => {
  return res.json({ user: serializeUser(req.user) });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { collegeEmail } = req.body;
    const user = await User.findOne({ collegeEmail: collegeEmail?.toLowerCase().trim() }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const resetUrl = `${clientUrl}/reset?resetToken=${resetToken}`;

      await sendEmail({
        to: user.collegeEmail,
        subject: "Reset your CSE (ICB) portal password",
        text: `Use this link to reset your password: ${resetUrl}`,
        html: `
          <p>Hello ${user.name},</p>
          <p>Use the link below to reset your password. It expires in 1 hour.</p>
          <p><a href="${resetUrl}">Reset password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      });
    }

    return res.json({
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not send reset link." });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or expired." });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return sendAuthResponse(res, user);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Password reset failed." });
  }
});

export default router;
