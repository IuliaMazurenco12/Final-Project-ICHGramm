import { Router } from 'express';
import {
  followMember,
  unfollowMember,
  getFollowers,
  getFollowing,
} from '../controllers/subscriptionController.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = Router();

router.use(verifyToken);

router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.post('/:userId', followMember);
router.delete('/:userId', unfollowMember);

export default router;