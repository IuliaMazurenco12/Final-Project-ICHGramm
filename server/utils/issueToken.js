import jwt from 'jsonwebtoken';

const issueToken = (accountId) => {
  return jwt.sign({ id: accountId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export default issueToken;