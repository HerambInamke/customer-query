import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { updateUserValidator, userIdValidator, listUsersValidator } from '../validators/userValidators.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

router.get('/agents', userController.getSupportAgents);

router.get('/', authorize(USER_ROLES.ADMIN), listUsersValidator, validate, userController.getAllUsers);

router.get('/:id', authorize(USER_ROLES.ADMIN), userIdValidator, validate, userController.getUserById);

router.patch('/:id', updateUserValidator, validate, userController.updateUser);

router.patch(
  '/:id/deactivate',
  authorize(USER_ROLES.ADMIN),
  userIdValidator,
  validate,
  userController.deactivateUser
);

export default router;
