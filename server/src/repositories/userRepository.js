import User from '../models/User.js';

export const userRepository = {
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  },

  async findById(id) {
    return User.findById(id).exec();
  },

  async create(userData) {
    return User.create(userData);
  },

  async findAll({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 } } = {}) {
    return User.paginate(filter, { page, limit, sort });
  },

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async existsByEmail(email) {
    return User.exists({ email });
  },
};
