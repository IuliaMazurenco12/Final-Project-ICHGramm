import { Router } from 'express';
import { toggleHeart, getPublicationHearts } from '../controllers/heartController.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = Router();

router.use(verifyToken);

router.post('/:publicationId', toggleHeart);
router.get('/:publicationId', getPublicationHearts);

export default router;