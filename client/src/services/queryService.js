import api from './api.js';

export const queryService = {
  async getStats() {
    return api.get('/queries/stats');
  },

  async getAllQueries(params = {}) {
    // Standardize passing params to Axios
    return api.get('/queries', { params });
  },

  async getQueryById(id) {
    return api.get(`/queries/${id}`);
  },

  async createQuery(queryData) {
    return api.post('/queries', queryData);
  },

  async updateQuery(id, queryData) {
    return api.patch(`/queries/${id}`, queryData);
  },

  async deleteQuery(id) {
    return api.delete(`/queries/${id}`);
  },

  async updateStatus(id, status) {
    return api.patch(`/queries/${id}/status`, { status });
  },

  async updatePriority(id, priority) {
    return api.patch(`/queries/${id}/priority`, { priority });
  },

  async assignAgent(id, assignedTo) {
    return api.patch(`/queries/${id}/assign`, { assignedTo });
  },

  async bulkDelete(ids) {
    return api.post('/queries/bulk-delete', { ids });
  },

  async bulkRestore(ids) {
    return api.post('/queries/bulk-restore', { ids });
  },
};

export default queryService;
