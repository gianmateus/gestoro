import { Router } from 'express';
import { login, logout, verifyTokenEndpoint, getProfile } from '../controllers/auth.controller';
import { loginLimiter, generalLimiter } from '../middleware/rateLimiter.middleware';
import { validateData } from '../middleware/validation.middleware';
import { loginSchema } from '../utils/validation.schemas';

const router = Router();

// Authentication routes - Rotas de autenticação
router.post('/login', loginLimiter, validateData(loginSchema), login);
router.post('/logout', generalLimiter, logout);
router.get('/verify', generalLimiter, verifyTokenEndpoint);
router.get('/profile', generalLimiter, getProfile);

export default router; 