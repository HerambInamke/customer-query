import { userService } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../responses/index.js';

export const userController = {
  getAllUsers: asyncHandler(async (req, res) => {
    const { users, meta } = await userService.getAllUsers(req.query);

    return sendSuccess(res, {
      message: 'Users retrieved successfully',
      data: { users },
      meta,
    });
  }),

  getUserById: asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    return sendSuccess(res, {
      message: 'User retrieved successfully',
      data: { user },
    });
  }),

  updateUser: asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body, req.user);

    return sendSuccess(res, {
      message: 'User updated successfully',
      data: { user },
    });
  }),

  deactivateUser: asyncHandler(async (req, res) => {
    const user = await userService.deactivateUser(req.params.id, req.user);

    return sendSuccess(res, {
      message: 'User deactivated successfully',
      data: { user },
    });
  }),

  getSupportAgents: asyncHandler(async (_req, res) => {
    const agents = await userService.getSupportAgents();

    return sendSuccess(res, {
      message: 'Support agents retrieved successfully',
      data: { agents },
    });
  }),
};
