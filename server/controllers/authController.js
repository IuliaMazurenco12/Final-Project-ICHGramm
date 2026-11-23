import Account from '../models/Account.js';
import issueToken from '../utils/issueToken.js';
import { EMAIL_PATTERN, USERNAME_PATTERN } from '../utils/patterns.js';

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, fullName, username, password } = req.body;

    if (!email || !fullName || !username || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      return res.status(400).json({ field: 'email', message: 'Enter a valid email address.' });
    }

    if (!USERNAME_PATTERN.test(cleanUsername)) {
      return res.status(400).json({
        field: 'username',
        message: 'Username: 3–30 characters, only letters, numbers, dots and underscores.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ field: 'password', message: 'Password must be at least 6 characters.' });
    }

    if (await Account.exists({ email: cleanEmail })) {
      return res.status(409).json({ field: 'email', message: 'This email is already registered.' });
    }

    if (await Account.exists({ username: cleanUsername })) {
      return res.status(409).json({ field: 'username', message: 'This username is already taken.' });
    }

    const account = await Account.create({
      email: cleanEmail,
      fullName: fullName.trim(),
      username: cleanUsername,
      password,
    });

    res.status(201).json({
      token: issueToken(account._id),
      user: account,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({ field, message: `This ${field} is already taken.` });
    }
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Enter your username or email and password.' });
    }

    const value = identifier.trim().toLowerCase();

    const account = await Account.findOne({
      $or: [{ email: value }, { username: value }],
    }).select('+password');

    if (!account || !(await account.checkPassword(password))) {
      return res.status(401).json({ message: 'Incorrect username/email or password.' });
    }

    res.json({
      token: issueToken(account._id),
      user: account,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};