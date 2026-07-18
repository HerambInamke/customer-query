import { verifyToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/userRepository.js';
import { UnauthorizedError, ForbiddenError } from '../errors/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new UnauthorizedError('Authentication required. Please log in.');
  }

  const decoded = verifyToken(token);

  const user = await userRepository.findById(decoded.id);

  if (!user) {
    throw new UnauthorizedError('User associated with this token no longer exists.');
  }

  if (!user.isActive) {
    throw new ForbiddenError('Your account has been deactivated.');
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`);
    }
    next();
  };
};
