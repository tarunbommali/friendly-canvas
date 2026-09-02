import { create } from 'zustand';
import { workspaceApi } from '../../infrastructure/api/workspaceApi';
import { contentApi } from '../../infrastructure/api/contentApi';

export const useWorkspaceStore = create((set, get) => ({
  projects: [],
  activeProject: null,
  tracks: [],
  activeTrack: null,
  posts: [],
  activePost: null,
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
        activeProject: state.activeProject?._id === projectId ? null : state.activeProject,
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

  // Tracks
  loadTracks: async (projectId) => {
    if (!projectId) return;
    set({ isLoading: true, error: null });
    try {
      const tracks = await contentApi.getTracks(projectId);
      set({ tracks, isLoading: false });
      return tracks;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  createTrack: async (projectId, trackData) => {
    try {
      const newTrack = await contentApi.createTrack(projectId, trackData);
      set((state) => ({ tracks: [...state.tracks, newTrack] }));
      return newTrack;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateTrack: async (trackId, trackData) => {
    try {
      const updated = await contentApi.updateTrack(trackId, trackData);
      set((state) => ({
        tracks: state.tracks.map((t) => (t._id === trackId ? { ...t, ...updated } : t)),
      }));
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteTrack: async (trackId) => {
    try {
      await contentApi.deleteTrack(trackId);
      set((state) => ({
        tracks: state.tracks.filter((t) => t._id !== trackId),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  reorderTracks: async (projectId, orderedIds) => {
    const prev = get().tracks;
    const trackMap = new Map(prev.map((t) => [t._id, t]));
    const reordered = orderedIds.map((id, idx) => ({ ...trackMap.get(id), sortOrder: idx })).filter(Boolean);
    set({ tracks: reordered });

    try {
      await contentApi.reorderTracks(projectId, orderedIds);
    } catch (err) {
      set({ tracks: prev, error: err.message });
    }
  },

  // Posts
  loadPosts: async (trackId) => {
    if (!trackId) return;
    set({ isLoading: true, error: null });
    try {
      const posts = await contentApi.getPosts(trackId);
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
            return {
              ...s,
              ...updates,
              headline: updates.headline ?? updates.title ?? s.headline,
              text: updates.text ?? updates.body ?? s.text,
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
