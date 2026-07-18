import api from './api.js';

export const userService = {
  async getSupportAgents() {
    return api.get('/users/agents');
  },
};

export default userService;
