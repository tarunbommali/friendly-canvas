/**
 * routes.js
 * ─────────
 * Centralized, config-driven route definitions.
 * Eliminates raw string typing across components and navigation handlers.
 */

export const routes = {
  home: () => '/',
  search: (query = '') => (query ? `/search?q=${encodeURIComponent(query)}` : '/search'),

  // Project Content Hub
  contentHub: (projectSlug = 'swe-notebook') => `/${projectSlug}/content`,
  contentHubCollection: (projectSlug = 'swe-notebook', collectionId = '1') =>
    `/${projectSlug}/content/track/${collectionId}`,
  contentHubPost: (projectSlug = 'swe-notebook', collectionId = '1', postId = '1') =>
    `/${projectSlug}/content/track/${collectionId}/post/${postId}`,

  // Design Studio
  designStudioNew: () => '/design/new',
  designStudioForPost: (projectSlug = 'swe-notebook', collectionId = '1', postId = '1') =>
    `/${projectSlug}/design/track/${collectionId}/post/${postId}`,
  designStudioCustom: (postId) => `/design/${postId}`,

  // Brand Kit
  brandKit: (projectSlug = 'swe-notebook') => `/${projectSlug}/carousel-design`,

  // Templates
  templates: () => '/layout-builder',
  templateCollection: (collectionId) => `/layout-builder/collection/${collectionId}`,
  templateNew: (collectionId) => `/layout-builder/collection/${collectionId}/new`,
  templateEdit: (collectionId, layoutId) => `/layout-builder/collection/${collectionId}/edit/${layoutId}`,

  // Collection Browsing
  collection: (collectionId = '1') => `/track/${collectionId}`,
  collectionPost: (collectionId = '1', postId = '1') => `/track/${collectionId}/post/${postId}`,
}
