import { apiClient } from './apiClient';

export const contentApi = {
  // Collections
  async getCollections(projectId) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return apiClient.get(`/collections${query}`);
  },

  async getCollection(collectionId) {
    return apiClient.get(`/collections/${collectionId}`);
  },

  async createCollection(projectId, collectionData) {
    return apiClient.post('/collections', { ...collectionData, projectId });
  },

  async updateCollection(collectionId, collectionData) {
    return apiClient.patch(`/collections/${collectionId}`, collectionData);
  },

  async deleteCollection(collectionId) {
    return apiClient.delete(`/collections/${collectionId}`);
  },

  async reorderCollections(projectId, orderedIds) {
    return apiClient.patch('/collections/reorder/bulk', { projectId, orderedIds });
  },

  // Posts
  async getPosts(collectionId) {
    const query = collectionId ? `?collectionId=${collectionId}` : '';
    return apiClient.get(`/posts${query}`);
  },

  async getPost(postId) {
    return apiClient.get(`/posts/${postId}`);
  },

  async createPost(collectionId, postData) {
    return apiClient.post('/posts', { ...postData, collectionId });
  },

  async updatePost(postId, postData) {
    return apiClient.patch(`/posts/${postId}`, postData);
  },

  async deletePost(postId) {
    return apiClient.delete(`/posts/${postId}`);
  },

  async reorderPosts(collectionId, orderedIds) {
    return apiClient.patch('/posts/reorder/bulk', { collectionId, orderedIds });
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
