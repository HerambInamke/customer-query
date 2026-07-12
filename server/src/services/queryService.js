import { queryRepository } from '../repositories/queryRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../errors/index.js';
import { buildQueryFilter, buildSortOption } from '../utils/queryBuilder.js';
import { parsePaginationOptions, buildPaginationMeta } from '../utils/pagination.js';
import { USER_ROLES, QUERY_STATUS } from '../constants/index.js';

export const queryService = {
  async createCustomerQuery(queryData, createdBy) {
    if (queryData.assignedTo) {
      await validateAssignee(queryData.assignedTo);
    }

    const newQuery = await queryRepository.create({
      ...queryData,
      createdBy: createdBy._id,
    });

    return newQuery;
  },

  async getAllQueries(queryParams, requestingUser) {
    const { page, limit } = parsePaginationOptions(queryParams);
    const sort = buildSortOption(queryParams.sort);

    const filter = buildQueryFilter(queryParams);

    const result = await queryRepository.findAll({
      filter,
      page,
      limit,
      sort,
      includeDeleted: queryParams.deleted === 'true' && requestingUser.role === USER_ROLES.ADMIN,
    });

    return {
      queries: result.docs,
      meta: buildPaginationMeta(result),
    };
  },

  async getQueryById(queryId) {
    const query = await queryRepository.findById(queryId);

    if (!query) {
      throw new NotFoundError('Customer query not found');
    }

    return query;
  },

  async updateCustomerQuery(queryId, updateData, updatedBy) {
    const existingQuery = await queryRepository.findById(queryId);

    if (!existingQuery) {
      throw new NotFoundError('Customer query not found');
    }

    const isCreator = existingQuery.createdBy && existingQuery.createdBy._id.toString() === updatedBy._id.toString();
    const isStaff = updatedBy.role === USER_ROLES.ADMIN || updatedBy.role === USER_ROLES.SUPPORT;

    if (!isCreator && !isStaff) {
      throw new ForbiddenError('You do not have permission to update this query');
    }

    if (updateData.assignedTo) {
      await validateAssignee(updateData.assignedTo);
    }

    const updatedQuery = await queryRepository.updateById(queryId, {
      ...updateData,
      updatedBy: updatedBy._id,
    });

    return updatedQuery;
  },

  async deleteCustomerQuery(queryId) {
    const existingQuery = await queryRepository.findById(queryId);

    if (!existingQuery) {
      throw new NotFoundError('Customer query not found');
    }

    const deletedQuery = await queryRepository.softDeleteById(queryId);

    return deletedQuery;
  },

  async restoreCustomerQuery(queryId) {
    const query = await queryRepository.findById(queryId, true);

    if (!query) {
      throw new NotFoundError('Customer query not found');
    }

    if (!query.deleted) {
      throw new BadRequestError('Query is not deleted');
    }

    const restoredQuery = await queryRepository.restoreById(queryId);

    return restoredQuery;
  },

  async updateQueryStatus(queryId, status, updatedBy) {
    const existingQuery = await queryRepository.findById(queryId);

    if (!existingQuery) {
      throw new NotFoundError('Customer query not found');
    }

    const updatedQuery = await queryRepository.updateById(queryId, {
      status,
      updatedBy: updatedBy._id,
    });

    return updatedQuery;
  },

  async updateQueryPriority(queryId, priority, updatedBy) {
    const existingQuery = await queryRepository.findById(queryId);

    if (!existingQuery) {
      throw new NotFoundError('Customer query not found');
    }

    const updatedQuery = await queryRepository.updateById(queryId, {
      priority,
      updatedBy: updatedBy._id,
    });

    return updatedQuery;
  },

  async assignSupportAgent(queryId, assignedTo, updatedBy) {
    const existingQuery = await queryRepository.findById(queryId);

    if (!existingQuery) {
      throw new NotFoundError('Customer query not found');
    }

    await validateAssignee(assignedTo);

    const updatedQuery = await queryRepository.updateById(queryId, {
      assignedTo,
      updatedBy: updatedBy._id,
    });

    return updatedQuery;
  },

  async bulkDeleteQueries(ids) {
    if (!ids || ids.length === 0) {
      throw new BadRequestError('At least one query ID is required');
    }

    await queryRepository.bulkSoftDelete(ids);

    return { deletedCount: ids.length };
  },

  async bulkRestoreQueries(ids) {
    if (!ids || ids.length === 0) {
      throw new BadRequestError('At least one query ID is required');
    }

    await queryRepository.bulkRestore(ids);

    return { restoredCount: ids.length };
  },

  async getQueryStats() {
    const [total, open, inProgress, resolved, closed, rejected] = await Promise.all([
      queryRepository.countByFilter({}),
      queryRepository.countByFilter({ status: QUERY_STATUS.OPEN }),
      queryRepository.countByFilter({ status: QUERY_STATUS.IN_PROGRESS }),
      queryRepository.countByFilter({ status: QUERY_STATUS.RESOLVED }),
      queryRepository.countByFilter({ status: QUERY_STATUS.CLOSED }),
      queryRepository.countByFilter({ status: QUERY_STATUS.REJECTED }),
    ]);

    return {
      total,
      byStatus: { open, inProgress, resolved, closed, rejected },
    };
  },
};

async function validateAssignee(assigneeId) {
  const assignee = await userRepository.findById(assigneeId);

  if (!assignee) {
    throw new NotFoundError('Assigned user not found');
  }

  if (!assignee.isActive) {
    throw new BadRequestError('Cannot assign to an inactive user');
  }

  if (assignee.role === USER_ROLES.USER) {
    throw new ForbiddenError('Can only assign queries to Support or Admin users');
  }

  return assignee;
}
