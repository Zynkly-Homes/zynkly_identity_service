import { Router } from 'express';
import { authMiddleware, apiKeyMiddleware, envApiKeyMiddleware } from '../../middlewares';
import {
  getAllApiKeys,
  getApiKeyById,
  createApiKey,
  updateApiKey,
  deleteApiKey,
} from '../../controllers/api-key.controller';

const router = Router();

// POST /api-keys — JWT + .env bootstrap key (no DB key exists yet on first run)
router.post('/', authMiddleware, envApiKeyMiddleware, createApiKey);

// All other routes — JWT + valid DB API key
router.use(authMiddleware, apiKeyMiddleware);
router.get('/',       getAllApiKeys);
router.get('/:id',    getApiKeyById);
router.patch('/:id',  updateApiKey);
router.delete('/:id', deleteApiKey);

export default router;
