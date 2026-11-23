import mongoose from 'mongoose';
import Subscription from '../models/Subscription.js';
import Account from '../models/Account.js';

const MEMBER_FIELDS = 'username fullName avatar';

const checkTarget = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    return { status: 400, message: 'Invalid user id.' };
  }

  const exists = await Account.exists({ _id: userId });
  if (!exists) {
    return { status: 404, message: 'User not found.' };
  }

  return null;
};

// POST /api/subscriptions/:userId
export const followMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;

    const targetError = await checkTarget(userId);
    if (targetError) {
      return res.status(targetError.status).json({ message: targetError.message });
    }

    if (followerId.equals(userId)) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    const alreadyFollowing = await Subscription.exists({ follower: followerId, following: userId });
    if (alreadyFollowing) {
      return res.status(409).json({ message: 'You already follow this user.' });
    }

    try {
      await Subscription.create({ follower: followerId, following: userId });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }

    const followersCount = await Subscription.countDocuments({ following: userId });

    res.status(201).json({ isFollowing: true, followersCount });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error while following.' });
  }
};

// DELETE /api/subscriptions/:userId
export const unfollowMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const targetError = await checkTarget(userId);
    if (targetError) {
      return res.status(targetError.status).json({ message: targetError.message });
    }

    const removed = await Subscription.findOneAndDelete({
      follower: req.user._id,
      following: userId,
    });

    if (!removed) {
      return res.status(404).json({ message: 'You do not follow this user.' });
    }

    const followersCount = await Subscription.countDocuments({ following: userId });

    res.json({ isFollowing: false, followersCount });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: 'Server error while unfollowing.' });
  }
};

// GET /api/subscriptions/:userId/followers
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const targetError = await checkTarget(userId);
    if (targetError) {
      return res.status(targetError.status).json({ message: targetError.message });
    }

    const subscriptions = await Subscription.find({ following: userId })
      .sort({ createdAt: -1 })
      .populate('follower', MEMBER_FIELDS);

    const users = subscriptions.map((subscription) => subscription.follower).filter(Boolean);

    res.json({ users });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error while loading followers.' });
  }
};

// GET /api/subscriptions/:userId/following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const targetError = await checkTarget(userId);
    if (targetError) {
      return res.status(targetError.status).json({ message: targetError.message });
    }

    const subscriptions = await Subscription.find({ follower: userId })
      .sort({ createdAt: -1 })
      .populate('following', MEMBER_FIELDS);

    const users = subscriptions.map((subscription) => subscription.following).filter(Boolean);

    res.json({ users });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error while loading following.' });
  }
};