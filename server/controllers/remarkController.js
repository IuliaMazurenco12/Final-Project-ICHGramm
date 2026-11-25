import mongoose from 'mongoose';
import Remark from '../models/Remark.js';
import Publication from '../models/Publication.js';

const AUTHOR_FIELDS = 'username avatar';

// GET /api/remarks/:publicationId
export const getPublicationRemarks = async (req, res) => {
  try {
    const { publicationId } = req.params;

    if (!mongoose.isValidObjectId(publicationId)) {
      return res.status(400).json({ message: 'Invalid publication id.' });
    }

    const remarks = await Remark.find({ publication: publicationId })
      .sort({ createdAt: 1 })
      .populate('author', AUTHOR_FIELDS);

    res.json({ remarks });
  } catch (error) {
    console.error('Get remarks error:', error);
    res.status(500).json({ message: 'Server error while loading comments.' });
  }
};

// POST /api/remarks/:publicationId
export const addRemark = async (req, res) => {
  try {
    const { publicationId } = req.params;

    if (!mongoose.isValidObjectId(publicationId)) {
      return res.status(400).json({ message: 'Invalid publication id.' });
    }

    const publicationExists = await Publication.exists({ _id: publicationId });
    if (!publicationExists) {
      return res.status(404).json({ message: 'Publication not found.' });
    }

    const text = (req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ field: 'text', message: 'Comment cannot be empty.' });
    }

    const remark = await Remark.create({
      publication: publicationId,
      author: req.user._id,
      text,
    });

    await remark.populate('author', AUTHOR_FIELDS);

    res.status(201).json({ message: 'Comment added.', remark });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ field: firstError.path, message: firstError.message });
    }
    console.error('Add remark error:', error);
    res.status(500).json({ message: 'Server error while adding comment.' });
  }
};

// DELETE /api/remarks/:id
export const deleteRemark = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid comment id.' });
    }

    const remark = await Remark.findById(id);

    if (!remark) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (!remark.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can delete only your own comments.' });
    }

    await remark.deleteOne();

    res.json({ message: 'Comment deleted.', id });
  } catch (error) {
    console.error('Delete remark error:', error);
    res.status(500).json({ message: 'Server error while deleting comment.' });
  }
};