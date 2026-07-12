import { userRepository } from '../repositories/userRepository.js';
import { signToken } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../errors/index.js';

export const authService = {
  async register(userData) {
    const existingUser = await userRepository.existsByEmail(userData.email);

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const user = await userRepository.create(userData);

    const token = signToken({ id: user._id, role: user.role });

    return { user, token };
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email, true);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({ id: user._id, role: user.role });

    const userWithoutPassword = user.toJSON();

    return { user: userWithoutPassword, token };
  },

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    return user;
  },
};
