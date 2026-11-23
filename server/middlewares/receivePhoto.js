import multer from 'multer';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 МБ

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed.'));
    }
  },
});

const receivePhoto = (fieldName) => (req, res, next) => {
  uploader.single(fieldName)(req, res, (error) => {
    if (error) {
      const message =
        error.code === 'LIMIT_FILE_SIZE' ? 'Image must be smaller than 5 MB.' : error.message;
      return res.status(400).json({ message });
    }
    next();
  });
};

export default receivePhoto;