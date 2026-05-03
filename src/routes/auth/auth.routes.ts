import { Router }       from 'express';
import { authMiddleware } from '../../middlewares';
import { login, getProfile } from '../../controllers/auth.controller';

const router = Router();

router.post('/login',   login);
router.get('/profile',  authMiddleware, getProfile);

export default router;
