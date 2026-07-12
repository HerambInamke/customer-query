import CustomerQuery from '../models/CustomerQuery.js';

const POPULATE_ASSIGNED_TO = { path: 'assignedTo', select: 'name email role' };
const POPULATE_CREATED_BY = { path: 'createdBy', select: 'name email role' };
const POPULATE_UPDATED_BY = { path: 'updatedBy', select: 'name email role' };

export const queryRepository = {
  async create(queryData) {
    const query = await CustomerQuery.create(queryData);
    return query.populate([POPULATE_ASSIGNED_TO, POPULATE_CREATED_BY]);
  },

  async findById(id, includeDeleted = false) {
    const query = includeDeleted
      ? CustomerQuery.findOneWithDeleted({ _id: id })
      : CustomerQuery.findById(id);

    return query
      .populate([POPULATE_ASSIGNED_TO, POPULATE_CREATED_BY, POPULATE_UPDATED_BY])
      .exec();
  },

  async findAll({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }, includeDeleted = false } = {}) {
    const paginateMethod = includeDeleted
      ? CustomerQuery.paginateWithDeleted.bind(CustomerQuery)
      : CustomerQuery.paginate.bind(CustomerQuery);

    return paginateMethod(filter, {
      page,
      limit,
      sort,
      populate: [POPULATE_ASSIGNED_TO, POPULATE_CREATED_BY],
      lean: false,
    });
  },

  async updateById(id, updateData) {
    return CustomerQuery.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate([POPULATE_ASSIGNED_TO, POPULATE_CREATED_BY, POPULATE_UPDATED_BY])
      .exec();
  },

  async softDeleteById(id) {
    await CustomerQuery.delete({ _id: id });
    return CustomerQuery.findOneWithDeleted({ _id: id })
      .populate([POPULATE_ASSIGNED_TO, POPULATE_CREATED_BY])
      .exec();
  },

  async restoreById(id) {
    await CustomerQuery.restore({ _id: id });
    return CustomerQuery.findById(id)
      .populate([POPULATE_ASSIGNED_TO, POPULATE_CREATED_BY])
      .exec();
  },

  async bulkSoftDelete(ids) {
    return CustomerQuery.delete({ _id: { $in: ids } });
  },

  async bulkRestore(ids) {
    return CustomerQuery.restore({ _id: { $in: ids } });
  },

  async countByFilter(filter = {}) {
    return CustomerQuery.countDocuments(filter);
  },
};
