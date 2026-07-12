import { authService } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../responses/index.js';
import { createTokenCookie, clearTokenCookie } from '../utils/jwt.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { user, token } = await authService.register(req.body);

    createTokenCookie(res, token);

    return sendCreated(res, {
      message: 'Account created successfully',
      data: { user },          // token stays in HttpOnly cookie only
    });
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    createTokenCookie(res, token);

    return sendSuccess(res, {
      message: 'Login successful',
      data: { user },           // token stays in HttpOnly cookie only
    });
  }),

  logout: asyncHandler(async (_req, res) => {
    clearTokenCookie(res);

    return sendSuccess(res, { message: 'Logged out successfully' });
  }),

  getMe: asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user._id);

    return sendSuccess(res, {
      message: 'User profile retrieved successfully',
      data: { user },
    });
  }),
};
