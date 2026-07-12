import { userRepository } from '../repositories/userRepository.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../errors/index.js';
import { buildSortOption } from '../utils/queryBuilder.js';
import { parsePaginationOptions, buildPaginationMeta } from '../utils/pagination.js';
import { USER_ROLES } from '../constants/index.js';

export const userService = {
  async getAllUsers(queryParams) {
    const { page, limit } = parsePaginationOptions(queryParams);
    const sort = buildSortOption(queryParams.sort);

    const filter = {};
    if (queryParams.role) {
      filter.role = queryParams.role;
    }
    if (queryParams.isActive !== undefined) {
      filter.isActive = queryParams.isActive === 'true';
    }

    const result = await userRepository.findAll({ filter, page, limit, sort });

    return {
      users: result.docs,
      meta: buildPaginationMeta(result),
    };
  },

  async getUserById(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  async updateUser(targetUserId, updateData, requestingUser) {
    const user = await userRepository.findById(targetUserId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isUpdatingSelf = targetUserId === requestingUser._id.toString();
    const isAdmin = requestingUser.role === USER_ROLES.ADMIN;

    if (!isAdmin && !isUpdatingSelf) {
      throw new ForbiddenError('You can only update your own profile');
    }

    if (updateData.role && !isAdmin) {
      throw new ForbiddenError('Only admins can change user roles');
    }

    if (updateData.email) {
      const existing = await userRepository.existsByEmail(updateData.email);
      if (existing && existing._id.toString() !== targetUserId) {
        throw new ConflictError('Email already in use');
      }
    }

    const updatedUser = await userRepository.updateById(targetUserId, updateData);

    return updatedUser;
  },

  async deactivateUser(targetUserId, requestingUser) {
    if (targetUserId === requestingUser._id.toString()) {
      throw new ForbiddenError('You cannot deactivate your own account');
    }

    const user = await userRepository.findById(targetUserId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return userRepository.updateById(targetUserId, { isActive: false });
  },

  async getSupportAgents() {
    const result = await userRepository.findAll({
      filter: { role: { $in: [USER_ROLES.SUPPORT, USER_ROLES.ADMIN] }, isActive: true },
      limit: 100,
    });

    return result.docs;
  },
};
