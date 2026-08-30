export const IMAGE_PERSIST_FIELDS = [
  "type",
  "src",
  "x",
  "y",
  "width",
  "height",
  "rotation",
  "originX",
  "originY",
  "scaleX",
  "scaleY",
  "isPlaceholder",
  "strokeDashArray",
];

/**
 * Extract the fields that must survive slide switches, layout reapply, and undo/redo.
 */
export function pickImageSnapshot(el) {
  if (!el) return null;
  const snapshot = {};
  for (const field of IMAGE_PERSIST_FIELDS) {
    if (el[field] !== undefined) {
      snapshot[field] = el[field];
    }
  }
  snapshot.type = "image";
  return snapshot;
}

export function isRegistryImageCandidate(el) {
  if (!el) return false;
  return (
    el.type === "image" ||
    Boolean(el.src) ||
    el.isPlaceholder === true ||
    (typeof el.id === "string" && el.id.toLowerCase().includes("placeholder"))
  );
}

/**
 * Merge saved image snapshots back onto a document.
 * Safe with an empty registry — returns the original doc unchanged.
 */
export function restoreImagesFromRegistry(doc, registry) {
  if (!doc || !registry || Object.keys(registry).length === 0) {
    return doc;
  }

  return {
    ...doc,
    slides: (doc.slides || []).map((slide) => ({
      ...slide,
      elements: (slide.elements || []).map((el) => {
        const saved = registry[el.id];
        if (!saved) return el;

        const shouldRestore =
          el.type === "image" ||
          saved.type === "image" ||
          el.isPlaceholder === true ||
          (typeof el.id === "string" && el.id.toLowerCase().includes("placeholder"));

        if (!shouldRestore) return el;

        return {
          ...el,
          ...saved,
          type: "image",
          isPlaceholder: false,
          strokeDashArray: null,
        };
      }),
    })),
  };
}

/**
 * Seed / merge registry entries from image elements already present on a document.
 */
export function hydrateRegistryFromDocument(doc, registry = {}) {
  const next = { ...registry };
  if (!doc?.slides) return next;

  for (const slide of doc.slides) {
    for (const el of slide.elements || []) {
      if (el.type === "image" && el.src) {
        next[el.id] = {
          ...(next[el.id] || {}),
          ...pickImageSnapshot(el),
        };
      }
    }
  }

  return next;
}

export function snapshotSlideImages(slide, registry = {}) {
  const next = { ...registry };
  if (!slide?.elements) return next;

  for (const el of slide.elements) {
    if (el.type === "image" && el.src) {
      next[el.id] = pickImageSnapshot(el);
    }
  }

  return next;
}
