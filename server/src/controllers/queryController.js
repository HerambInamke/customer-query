import { queryService } from '../services/queryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../responses/index.js';

export const queryController = {
  createQuery: asyncHandler(async (req, res) => {
    const query = await queryService.createCustomerQuery(req.body, req.user);

    return sendCreated(res, {
      message: 'Customer query created successfully',
      data: { query },
    });
  }),

  getAllQueries: asyncHandler(async (req, res) => {
    const { queries, meta } = await queryService.getAllQueries(req.query, req.user);

    return sendSuccess(res, {
      message: 'Customer queries retrieved successfully',
      data: { queries },
      meta,
    });
  }),

  getQueryById: asyncHandler(async (req, res) => {
    const query = await queryService.getQueryById(req.params.id);

    return sendSuccess(res, {
      message: 'Customer query retrieved successfully',
      data: { query },
    });
  }),

  updateQuery: asyncHandler(async (req, res) => {
    const query = await queryService.updateCustomerQuery(req.params.id, req.body, req.user);

    return sendSuccess(res, {
      message: 'Customer query updated successfully',
      data: { query },
    });
  }),

  deleteQuery: asyncHandler(async (req, res) => {
    const query = await queryService.deleteCustomerQuery(req.params.id);

    return sendSuccess(res, {
      message: 'Customer query deleted successfully',
      data: { query },
    });
  }),

  restoreQuery: asyncHandler(async (req, res) => {
    const query = await queryService.restoreCustomerQuery(req.params.id);

    return sendSuccess(res, {
      message: 'Customer query restored successfully',
      data: { query },
    });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const query = await queryService.updateQueryStatus(req.params.id, req.body.status, req.user);

    return sendSuccess(res, {
      message: 'Query status updated successfully',
      data: { query },
    });
  }),

  updatePriority: asyncHandler(async (req, res) => {
    const query = await queryService.updateQueryPriority(req.params.id, req.body.priority, req.user);

    return sendSuccess(res, {
      message: 'Query priority updated successfully',
      data: { query },
    });
  }),

  assignAgent: asyncHandler(async (req, res) => {
    const query = await queryService.assignSupportAgent(
      req.params.id,
      req.body.assignedTo,
      req.user
    );

    return sendSuccess(res, {
      message: 'Support agent assigned successfully',
      data: { query },
    });
  }),

  bulkDelete: asyncHandler(async (req, res) => {
    const result = await queryService.bulkDeleteQueries(req.body.ids);

    return sendSuccess(res, {
      message: `${result.deletedCount} queries deleted successfully`,
      data: result,
    });
  }),

  bulkRestore: asyncHandler(async (req, res) => {
    const result = await queryService.bulkRestoreQueries(req.body.ids);

    return sendSuccess(res, {
      message: `${result.restoredCount} queries restored successfully`,
      data: result,
    });
  }),

  getStats: asyncHandler(async (_req, res) => {
    const stats = await queryService.getQueryStats();

    return sendSuccess(res, {
      message: 'Query statistics retrieved successfully',
      data: { stats },
    });
  }),
};
