import { Router } from 'express';
import {
  getAllPublications,
  getExplorePublications,
  getUserPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
} from '../controllers/publicationController.js';
import verifyToken from '../middlewares/verifyToken.js';
import receivePhoto from '../middlewares/receivePhoto.js';

const router = Router();

router.use(verifyToken);

router.get('/', getAllPublications);
router.get('/explore', getExplorePublications);
router.get('/user/:userId', getUserPublications);
router.get('/:id', getPublicationById);
router.post('/', receivePhoto('image'), createPublication);
router.put('/:id', receivePhoto('image'), updatePublication);
router.delete('/:id', deletePublication);

export default router;