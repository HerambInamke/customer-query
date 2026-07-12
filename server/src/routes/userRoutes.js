import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { updateUserValidator, userIdValidator, listUsersValidator } from '../validators/userValidators.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/users/agents:
 *   get:
 *     summary: Get available support agents
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Support agents list
 */
router.get('/agents', userController.getSupportAgents);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Admin, Support, User]
 *     responses:
 *       200:
 *         description: Users list
 *       403:
 *         description: Forbidden
 */
router.get('/', authorize(USER_ROLES.ADMIN), listUsersValidator, validate, userController.getAllUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
router.get('/:id', authorize(USER_ROLES.ADMIN), userIdValidator, validate, userController.getUserById);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch('/:id', updateUserValidator, validate, userController.updateUser);

/**
 * @swagger
 * /api/v1/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated
 */
router.patch(
  '/:id/deactivate',
  authorize(USER_ROLES.ADMIN),
  userIdValidator,
  validate,
  userController.deactivateUser
);

export default router;
