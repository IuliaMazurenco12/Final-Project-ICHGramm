import { Router } from 'express';
import { getProfile, updateProfile, searchMembers } from '../controllers/profileController.js';
import verifyToken from '../middlewares/verifyToken.js';
import receivePhoto from '../middlewares/receivePhoto.js';

const router = Router();

router.get('/search', verifyToken, searchMembers);
router.get('/:id', verifyToken, getProfile);
router.put('/', verifyToken, receivePhoto('avatar'), updateProfile);

export default router;