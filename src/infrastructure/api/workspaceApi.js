import { apiClient } from './apiClient';

export const workspaceApi = {
  async getWorkspaces() {
    return apiClient.get('/workspaces');
  },

  async createWorkspace(name, slug) {
    return apiClient.post('/workspaces', { name, slug });
  },

  async getProjects(workspaceId) {
    return apiClient.get(`/workspaces/${workspaceId}/projects`);
  },

  async createProject(workspaceId, projectData) {
    return apiClient.post(`/workspaces/${workspaceId}/projects`, projectData);
  },

  async updateProject(projectId, projectData) {
    return apiClient.patch(`/projects/${projectId}`, projectData);
  },

  async deleteProject(projectId) {
    return apiClient.delete(`/projects/${projectId}`);
  },

  async reorderProjects(workspaceId, orderedIds) {
    return apiClient.patch(`/workspaces/${workspaceId}/projects/reorder`, { orderedIds });
  },
};
