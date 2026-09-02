/**
 * taxonomy.js
 * ───────────
 * Config-driven terminology for the multi-project workspace.
 * Allows project-level overrides (e.g. "Collection" -> "Module" / "Chapter" / "Series").
 */

export const defaultTaxonomy = {
  project: { singular: 'Project', plural: 'Projects' },
  collection: { singular: 'Collection', plural: 'Collections' },
  design: { singular: 'Design', plural: 'Designs' },
  post: { singular: 'Post', plural: 'Posts' },
  slide: { singular: 'Slide', plural: 'Slides' },
  template: { singular: 'Template', plural: 'Templates' },
  brandKit: { singular: 'Brand Kit', plural: 'Brand Kits' },
}

export function getProjectTaxonomy(project) {
  if (!project?.taxonomy) return defaultTaxonomy
  return {
    ...defaultTaxonomy,
    ...project.taxonomy,
  }
}
