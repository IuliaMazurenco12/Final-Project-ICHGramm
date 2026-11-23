import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Subscription from '../models/Subscription.js';
import imageToBase64 from '../utils/imageToBase64.js';
import { USERNAME_PATTERN } from '../utils/patterns.js';

const SEARCH_LIMIT = 20;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/profile/:id
export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const account = await Account.findById(id).select('-password');

    if (!account) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const [followersCount, followingCount, mySubscription] = await Promise.all([
      Subscription.countDocuments({ following: id }),
      Subscription.countDocuments({ follower: id }),
      Subscription.exists({ follower: req.user._id, following: id }),
    ]);

    res.json({
      user: {
        ...account.toJSON(),
        followersCount,
        followingCount,
        isFollowedByMe: Boolean(mySubscription),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while loading profile.' });
  }
};

// PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const account = req.user;
    const { fullName, username, bio, website } = req.body;

    if (username !== undefined) {
      const cleanUsername = username.trim().toLowerCase();

      if (!USERNAME_PATTERN.test(cleanUsername)) {
        return res.status(400).json({
          field: 'username',
          message: 'Username: 3–30 characters, only letters, numbers, dots and underscores.',
        });
      }

      if (cleanUsername !== account.username) {
        const taken = await Account.exists({ username: cleanUsername });
        if (taken) {
          return res.status(409).json({ field: 'username', message: 'This username is already taken.' });
        }
        account.username = cleanUsername;
      }
    }

    if (fullName !== undefined) account.fullName = fullName.trim();
    if (bio !== undefined) account.bio = bio.trim();
    if (website !== undefined) account.website = website.trim();

    if (req.file) {
      account.avatar = await imageToBase64(req.file, 320);
    }

    await account.save();

    res.json({ message: 'Profile updated.', user: account });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ field: firstError.path, message: firstError.message });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

// GET /api/profile/search?q=...
export const searchMembers = async (req, res) => {
  try {
    const query = (req.query.q || '').trim();

    if (!query) {
      return res.json({ users: [] });
    }

    const pattern = new RegExp(escapeRegex(query), 'i');

    const users = await Account.find({
      _id: { $ne: req.user._id },
      $or: [{ username: pattern }, { fullName: pattern }],
    })
      .select('username fullName avatar')
      .limit(SEARCH_LIMIT);

    res.json({ users });
  } catch (error) {
    console.error('Search members error:', error);
    res.status(500).json({ message: 'Server error while searching.' });
  }
};