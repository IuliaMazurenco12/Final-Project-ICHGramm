import mongoose from 'mongoose';
import Publication from '../models/Publication.js';
import Account from '../models/Account.js';
import Heart from '../models/Heart.js';
import imageToBase64 from '../utils/imageToBase64.js';
import withHeartStats from '../utils/withHeartStats.js';

const AUTHOR_FIELDS = 'username fullName avatar';

// GET /api/publications
export const getAllPublications = async (req, res) => {
  try {
    const publications = await Publication.find()
      .sort({ createdAt: -1 })
      .populate('author', AUTHOR_FIELDS);

    res.json({ publications: await withHeartStats(publications, req.user._id) });
  } catch (error) {
    console.error('Get all publications error:', error);
    res.status(500).json({ message: 'Server error while loading publications.' });
  }
};

const EXPLORE_LIMIT = 60;

// GET /api/publications/explore
export const getExplorePublications = async (req, res) => {
  try {
    const sample = await Publication.aggregate([
      { $sample: { size: EXPLORE_LIMIT } },
      { $project: { _id: 1 } },
    ]);

    const randomIds = sample.map((item) => item._id);

    const publications = await Publication.find({ _id: { $in: randomIds } }).populate(
      'author',
      AUTHOR_FIELDS
    );

    const positionById = new Map(randomIds.map((id, index) => [id.toString(), index]));
    publications.sort(
      (a, b) => positionById.get(a._id.toString()) - positionById.get(b._id.toString())
    );

    res.json({ publications: await withHeartStats(publications, req.user._id) });
  } catch (error) {
    console.error('Get explore publications error:', error);
    res.status(500).json({ message: 'Server error while loading explore.' });
  }
};

// GET /api/publications/user/:userId
export const getUserPublications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const userExists = await Account.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const publications = await Publication.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', AUTHOR_FIELDS);

    res.json({ publications: await withHeartStats(publications, req.user._id) });
  } catch (error) {
    console.error('Get user publications error:', error);
    res.status(500).json({ message: 'Server error while loading publications.' });
  }
};

// GET /api/publications/:id
export const getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid publication id.' });
    }

    const publication = await Publication.findById(id).populate('author', AUTHOR_FIELDS);

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found.' });
    }

    const [publicationWithStats] = await withHeartStats([publication], req.user._id);

    res.json({ publication: publicationWithStats });
  } catch (error) {
    console.error('Get publication error:', error);
    res.status(500).json({ message: 'Server error while loading publication.' });
  }
};

// POST /api/publications
export const createPublication = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ field: 'image', message: 'Please choose an image.' });
    }

    const publication = await Publication.create({
      author: req.user._id,
    image: await imageToBase64(req.file),
      caption: req.body.caption || '',
    });

    await publication.populate('author', AUTHOR_FIELDS);

    res.status(201).json({
      message: 'Publication created.',
      publication: { ...publication.toJSON(), heartsCount: 0, likedByMe: false },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ field: firstError.path, message: firstError.message });
    }
    console.error('Create publication error:', error);
    res.status(500).json({ message: 'Server error while creating publication.' });
  }
};

// PUT /api/publications/:id
export const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid publication id.' });
    }

    const publication = await Publication.findById(id);

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found.' });
    }

    if (!publication.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can edit only your own publications.' });
    }

    if (req.body.caption !== undefined) {
      publication.caption = req.body.caption;
    }

    if (req.file) {
publication.image = await imageToBase64(req.file);
    }

    await publication.save();
    await publication.populate('author', AUTHOR_FIELDS);

    const [publicationWithStats] = await withHeartStats([publication], req.user._id);

    res.json({ message: 'Publication updated.', publication: publicationWithStats });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ field: firstError.path, message: firstError.message });
    }
    console.error('Update publication error:', error);
    res.status(500).json({ message: 'Server error while updating publication.' });
  }
};

// DELETE /api/publications/:id
export const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid publication id.' });
    }

    const publication = await Publication.findById(id);

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found.' });
    }

    if (!publication.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can delete only your own publications.' });
    }

    await Heart.deleteMany({ publication: id });
    await publication.deleteOne();

    res.json({ message: 'Publication deleted.', id });
  } catch (error) {
    console.error('Delete publication error:', error);
    res.status(500).json({ message: 'Server error while deleting publication.' });
  }
};