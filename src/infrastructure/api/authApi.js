import { apiClient } from './apiClient';

export const authApi = {
  async login(email, password) {
    const data = await apiClient.post('/auth/login', { email, password });
    if (data.token) {
      apiClient.setToken(data.token);
    }
    return data;
  },

  async register(name, email, password) {
    const data = await apiClient.post('/auth/register', { name, email, password });
    if (data.token) {
      apiClient.setToken(data.token);
    }
    return data;
  },

  async getMe() {
    return apiClient.get('/auth/me');
  },

  logout() {
    apiClient.clearToken();
  },
};
