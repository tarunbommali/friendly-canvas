import { apiClient } from './apiClient';

export const contentApi = {
  // Tracks
  async getTracks(projectId) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return apiClient.get(`/tracks${query}`);
  },

  async getTrack(trackId) {
    return apiClient.get(`/tracks/${trackId}`);
  },

  async createTrack(projectId, trackData) {
    return apiClient.post('/tracks', { ...trackData, projectId });
  },

  async updateTrack(trackId, trackData) {
    return apiClient.patch(`/tracks/${trackId}`, trackData);
  },

  async deleteTrack(trackId) {
    return apiClient.delete(`/tracks/${trackId}`);
  },

  async reorderTracks(projectId, orderedIds) {
    return apiClient.patch('/tracks/reorder/bulk', { projectId, orderedIds });
  },

  // Posts
  async getPosts(trackId) {
    const query = trackId ? `?trackId=${trackId}` : '';
    return apiClient.get(`/posts${query}`);
  },

  async getPost(postId) {
    return apiClient.get(`/posts/${postId}`);
  },

  async createPost(trackId, postData) {
    return apiClient.post('/posts', { ...postData, trackId });
  },

  async updatePost(postId, postData) {
    return apiClient.patch(`/posts/${postId}`, postData);
  },

  async deletePost(postId) {
    return apiClient.delete(`/posts/${postId}`);
  },

  async reorderPosts(trackId, orderedIds) {
    return apiClient.patch('/posts/reorder/bulk', { trackId, orderedIds });
  },

  // Slides & Canvas
  async addSlide(postId, slideData) {
    return apiClient.post(`/posts/${postId}/slides`, slideData);
  },

  async updateSlide(postId, slideId, slideData) {
    return apiClient.patch(`/posts/${postId}/slides/${slideId}`, slideData);
  },

  async deleteSlide(postId, slideId) {
    return apiClient.delete(`/posts/${postId}/slides/${slideId}`);
  },

  async updateSlideCanvas(postId, slideId, canvasData) {
    return apiClient.patch(`/posts/${postId}/slides/${slideId}/canvas`, { canvas: canvasData });
  },

  async reorderSlides(postId, orderedSlideIds) {
    return apiClient.patch(`/posts/${postId}/slides/reorder/bulk`, { orderedSlideIds });
  },
};
