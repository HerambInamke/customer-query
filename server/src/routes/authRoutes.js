import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, registerValidator, validate, authController.register);

router.post('/login', authRateLimiter, loginValidator, validate, authController.login);

router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.getMe);

export default router;
