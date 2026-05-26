import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, unauthorized } from '../utils/httpError.js';

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { name, email, password, confirmPassword, role } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) errors.push('Full name is required');
    if (!email || !validateEmail(email)) errors.push('A valid email is required');
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (password !== confirmPassword) errors.push('Passwords do not match');
    if (!['admin', 'student'].includes(role)) errors.push('Role must be Admin or Student');
    if (errors.length) throw badRequest('Validation failed', errors);

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) throw badRequest('Email is already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role,
    });

    res.status(201).json({ user: user.toSafeJSON(), token: signToken(user) });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw badRequest('Email and password are required');

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+password_hash',
    );
    if (!user) throw unauthorized('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw unauthorized('Invalid email or password');

    res.json({ user: user.toSafeJSON(), token: signToken(user) });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user.toSafeJSON() });
  }),
);

export default router;
