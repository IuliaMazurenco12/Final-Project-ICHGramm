import { Router } from 'express';
import { getPublicationRemarks, addRemark, deleteRemark } from '../controllers/remarkController.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = Router();

router.use(verifyToken);

router.get('/:publicationId', getPublicationRemarks);
router.post('/:publicationId', addRemark);
router.delete('/:id', deleteRemark);

export default router;