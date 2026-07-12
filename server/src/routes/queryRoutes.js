import { Router } from 'express';
import { queryController } from '../controllers/queryController.js';
import {
  createQueryValidator,
  updateQueryValidator,
  queryIdValidator,
  listQueriesValidator,
  bulkActionValidator,
  updateStatusValidator,
  updatePriorityValidator,
  assignAgentValidator,
} from '../validators/queryValidators.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/queries/stats:
 *   get:
 *     summary: Get query statistics
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Query statistics
 */
router.get('/stats', queryController.getStats);

/**
 * @swagger
 * /api/v1/queries/bulk-delete:
 *   post:
 *     summary: Bulk soft delete queries (Admin only)
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Queries deleted
 */
router.post(
  '/bulk-delete',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPORT),
  bulkActionValidator,
  validate,
  queryController.bulkDelete
);

/**
 * @swagger
 * /api/v1/queries/bulk-restore:
 *   post:
 *     summary: Bulk restore deleted queries (Admin only)
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Queries restored
 */
router.post(
  '/bulk-restore',
  authorize(USER_ROLES.ADMIN),
  bulkActionValidator,
  validate,
  queryController.bulkRestore
);

/**
 * @swagger
 * /api/v1/queries:
 *   get:
 *     summary: List all customer queries
 *     tags: [Queries]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, priority, status, alphabetical]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Queries list with pagination
 */
router.get('/', listQueriesValidator, validate, queryController.getAllQueries);

/**
 * @swagger
 * /api/v1/queries:
 *   post:
 *     summary: Create a new customer query
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuery'
 *     responses:
 *       201:
 *         description: Query created
 *       422:
 *         description: Validation error
 */
router.post('/', createQueryValidator, validate, queryController.createQuery);

/**
 * @swagger
 * /api/v1/queries/{id}:
 *   get:
 *     summary: Get a single query by ID
 *     tags: [Queries]
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
 *         description: Query data
 *       404:
 *         description: Query not found
 */
router.get('/:id', queryIdValidator, validate, queryController.getQueryById);

/**
 * @swagger
 * /api/v1/queries/{id}:
 *   patch:
 *     summary: Update a customer query
 *     tags: [Queries]
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
 *         description: Query updated
 */
router.patch('/:id', updateQueryValidator, validate, queryController.updateQuery);

/**
 * @swagger
 * /api/v1/queries/{id}:
 *   delete:
 *     summary: Soft delete a customer query
 *     tags: [Queries]
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
 *         description: Query deleted
 */
router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPORT),
  queryIdValidator,
  validate,
  queryController.deleteQuery
);

/**
 * @swagger
 * /api/v1/queries/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted query (Admin only)
 *     tags: [Queries]
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
 *         description: Query restored
 */
router.patch(
  '/:id/restore',
  authorize(USER_ROLES.ADMIN),
  queryIdValidator,
  validate,
  queryController.restoreQuery
);

/**
 * @swagger
 * /api/v1/queries/{id}/status:
 *   patch:
 *     summary: Update query status
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Open, In Progress, Resolved, Closed, Rejected]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/:id/status',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPORT),
  updateStatusValidator,
  validate,
  queryController.updateStatus
);

/**
 * @swagger
 * /api/v1/queries/{id}/priority:
 *   patch:
 *     summary: Update query priority
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [priority]
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Urgent]
 *     responses:
 *       200:
 *         description: Priority updated
 */
router.patch(
  '/:id/priority',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPORT),
  updatePriorityValidator,
  validate,
  queryController.updatePriority
);

/**
 * @swagger
 * /api/v1/queries/{id}/assign:
 *   patch:
 *     summary: Assign a support agent to a query
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignedTo]
 *             properties:
 *               assignedTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agent assigned
 */
router.patch(
  '/:id/assign',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPORT),
  assignAgentValidator,
  validate,
  queryController.assignAgent
);

export default router;
