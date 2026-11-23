import mongoose from 'mongoose';
import Heart from '../models/Heart.js';
import Publication from '../models/Publication.js';

// POST /api/hearts/:publicationId
export const toggleHeart = async (req, res) => {
  try {
    const { publicationId } = req.params;
    const accountId = req.user._id;

    if (!mongoose.isValidObjectId(publicationId)) {
      return res.status(400).json({ message: 'Invalid publication id.' });
    }

    const publicationExists = await Publication.exists({ _id: publicationId });
    if (!publicationExists) {
      return res.status(404).json({ message: 'Publication not found.' });
    }

    const removedHeart = await Heart.findOneAndDelete({
      account: accountId,
      publication: publicationId,
    });

    let liked = false;

    if (!removedHeart) {
      try {
        await Heart.create({ account: accountId, publication: publicationId });
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
      liked = true;
    }

    const heartsCount = await Heart.countDocuments({ publication: publicationId });

    res.json({ liked, heartsCount });
  } catch (error) {
    console.error('Toggle heart error:', error);
    res.status(500).json({ message: 'Server error while updating like.' });
  }
};

// GET /api/hearts/:publicationId
export const getPublicationHearts = async (req, res) => {
  try {
    const { publicationId } = req.params;

    if (!mongoose.isValidObjectId(publicationId)) {
      return res.status(400).json({ message: 'Invalid publication id.' });
    }

    const publicationExists = await Publication.exists({ _id: publicationId });
    if (!publicationExists) {
      return res.status(404).json({ message: 'Publication not found.' });
    }

    const hearts = await Heart.find({ publication: publicationId })
      .sort({ createdAt: -1 })
      .populate('account', 'username fullName avatar');

    const likedByMe = hearts.some((heart) => heart.account._id.equals(req.user._id));

    res.json({
      heartsCount: hearts.length,
      likedByMe,
      hearts,
    });
  } catch (error) {
    console.error('Get hearts error:', error);
    res.status(500).json({ message: 'Server error while loading likes.' });
  }
};