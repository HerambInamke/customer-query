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

router.get('/stats', queryController.getStats);

router.post(
  '/bulk-delete',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPORT),
  bulkActionValidator,
  validate,
  queryController.bulkDelete
);

router.post(
  '/bulk-restore',
  authorize(USER_ROLES.ADMIN),
  bulkActionValidator,
  validate,
  queryController.bulkRestore
);

router.get('/', listQueriesValidator, validate, queryController.getAllQueries);

router.post('/', createQueryValidator, validate, queryController.createQuery);

router.get('/:id', queryIdValidator, validate, queryController.getQueryById);

router.patch('/:id', updateQueryValidator, validate, queryController.updateQuery);

router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPORT),
  queryIdValidator,
  validate,
  queryController.deleteQuery
);

router.patch(
  '/:id/restore',
  authorize(USER_ROLES.ADMIN),
  queryIdValidator,
  validate,
  queryController.restoreQuery
);

router.patch(
  '/:id/status',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPORT),
  updateStatusValidator,
  validate,
  queryController.updateStatus
);

router.patch(
  '/:id/priority',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPORT),
  updatePriorityValidator,
  validate,
  queryController.updatePriority
);

router.patch(
  '/:id/assign',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPORT),
  assignAgentValidator,
  validate,
  queryController.assignAgent
);

export default router;
