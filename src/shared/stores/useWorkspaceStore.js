import { create } from 'zustand';
import { workspaceApi } from '../../infrastructure/api/workspaceApi';
import { contentApi } from '../../infrastructure/api/contentApi';

export const useWorkspaceStore = create((set, get) => ({
  projects: [],
  collections: [],
  posts: [],
  isLoading: false,
  error: null,

  // Projects
  loadProjects: async (workspaceId) => {
    if (!workspaceId) return;
    set({ isLoading: true, error: null });
    try {
      const projects = await workspaceApi.getProjects(workspaceId);
      set({ projects, isLoading: false });
      return projects;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  createProject: async (workspaceId, projectData) => {
    try {
      const newProj = await workspaceApi.createProject(workspaceId, projectData);
      set((state) => ({ projects: [...state.projects, newProj] }));
      return newProj;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteProject: async (projectId) => {
    try {
      await workspaceApi.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== projectId),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  reorderProjects: async (workspaceId, orderedIds) => {
    // Optimistic update
    const prev = get().projects;
    const projectMap = new Map(prev.map((p) => [p._id, p]));
    const reordered = orderedIds.map((id, idx) => ({ ...projectMap.get(id), sortOrder: idx })).filter(Boolean);
    set({ projects: reordered });

    try {
      await workspaceApi.reorderProjects(workspaceId, orderedIds);
    } catch (err) {
      // Rollback on failure
      set({ projects: prev, error: err.message });
    }
  },

  // Collections (formerly Collections)
  loadCollections: async (projectId) => {
    if (!projectId) return;
    set({ isLoading: true, error: null });
    try {
      const collections = await contentApi.getCollections(projectId);
      set({ collections, isLoading: false });
      return collections;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  createCollection: async (projectId, collectionData) => {
    try {
      const newCollection = await contentApi.createCollection(projectId, collectionData);
      set((state) => ({ collections: [...state.collections, newCollection] }));
      return newCollection;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateCollection: async (collectionId, collectionData) => {
    try {
      const updated = await contentApi.updateCollection(collectionId, collectionData);
      set((state) => ({
        collections: state.collections.map((c) => (c._id === collectionId ? { ...c, ...updated } : c)),
      }));
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteCollection: async (collectionId) => {
    try {
      await contentApi.deleteCollection(collectionId);
      set((state) => ({
        collections: state.collections.filter((c) => c._id !== collectionId),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  reorderCollections: async (projectId, orderedIds) => {
    const prev = get().collections;
    const collectionMap = new Map(prev.map((c) => [c._id, c]));
    const reordered = orderedIds.map((id, idx) => ({ ...collectionMap.get(id), sortOrder: idx })).filter(Boolean);
    set({ collections: reordered });

    try {
      await contentApi.reorderCollections(projectId, orderedIds);
    } catch (err) {
      set({ collections: prev, error: err.message });
    }
  },

  // Posts
  loadPosts: async (collectionId) => {
    if (!collectionId) return;
    set({ isLoading: true, error: null });
    try {
      const posts = await contentApi.getPosts(collectionId);
      set({ posts, isLoading: false });
      return posts;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateSlideContent: async (postId, slideId, updates) => {
    // Optimistic local state update
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post._id !== postId && post.externalId !== postId) return post;
        return {
          ...post,
          slides: post.slides.map((s) => {
            if (s._id !== slideId && s.externalId !== slideId) return s;
            const resolvedHeading = updates.heading ?? s.heading;
            const resolvedBodyText = updates.bodyText ?? s.bodyText;
            return {
              ...s,
              ...updates,
              heading: resolvedHeading,
              bodyText: resolvedBodyText,
              visualDirective: updates.visualDirective ?? s.visualDirective,
            };
          }),
        };
      }),
    }));

    try {
      await contentApi.updateSlide(postId, slideId, updates);
    } catch (err) {
      console.warn('Background slide sync failed:', err.message);
    }
  },

  updateSlideCanvas: async (postId, slideId, canvasData) => {
    try {
      await contentApi.updateSlideCanvas(postId, slideId, canvasData);
    } catch (err) {
      console.warn('Background canvas sync failed:', err.message);
      throw err;
    }
  },
}));
