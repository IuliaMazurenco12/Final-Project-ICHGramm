import jwt from 'jsonwebtoken';
import Account from '../models/Account.js';

const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, token missing.' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const account = await Account.findById(decoded.id);
    if (!account) {
      return res.status(401).json({ message: 'Account no longer exists.' });
    }

    req.user = account;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export default verifyToken;