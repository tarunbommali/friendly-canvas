import { create } from "zustand";
import { initialCarousel } from "../data/initialCarousel";
import { THEME } from "../theme/theme";
import { composeSlide } from "../theme/compose";
import { DEFAULT_GLOBAL_LAYOUT_CONFIG } from "../theme/defaultGlobalLayout";
import { getCanvasDimensions } from "../theme/layoutBounds";
import {
  isChromeElement,
  isImageElement,
  isHeadlineElement,
  isBodyElement,
  isDirectiveTextElement,
  isDirectiveRectElement,
  isBackgroundRect,
  isPageNumberElement,
  isSwipeElement,
  isChromeBadgeElement,
  formatPageLabel,
  createElementId,
} from "../theme/elementClassify";
import {
  pickImageSnapshot,
  restoreImagesFromRegistry,
  hydrateRegistryFromDocument,
  snapshotSlideImages,
} from "./imageRegistry";

const HISTORY_LIMIT = 30;

function cloneDoc(doc) {
  return JSON.parse(JSON.stringify(doc));
}

function maxZIndex(elements = []) {
  return elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);
}

function syncChromePagination(slides) {
  const total = slides.length;
  return slides.map((slide, index) => {
    const pageIndex = index + 1;
    const isLast = pageIndex === total;
    return {
      ...slide,
      elements: (slide.elements || []).map((el) => {
        if (isPageNumberElement(el)) {
          return { ...el, text: formatPageLabel(pageIndex, total) };
        }
        if (isSwipeElement(el)) {
          return {
            ...el,
            text: isLast ? "Follow for more →" : "Swipe →",
          };
        }
        return el;
      }),
    };
  });
}

function estimateLineCount(text = "", fontSize = 44, maxWidth = 680) {
  if (!text) return 1;
  const avgCharWidth = fontSize * 0.55;
  const charsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));
  const words = text.split(/\s+/).filter(Boolean);
  let lines = words.length ? 1 : 1;
  let current = 0;
  for (const word of words) {
    if (current + word.length + 1 > charsPerLine) {
      lines += 1;
      current = word.length + 1;
    } else {
      current += word.length + 1;
    }
  }
  return Math.max(1, lines);
}

function applyConfigToSlide(slide, config, { isLastSlide, canvasWidth }) {
  const headlineEl = slide.elements.find(isHeadlineElement);
  const headlineText = headlineEl?.text || headlineEl?.content || "";
  const headlineFontSize = config.headlineFontSize || headlineEl?.fontSize || 44;
  const headlineHeight =
    Math.max(1, estimateLineCount(headlineText, headlineFontSize, 680)) *
    headlineFontSize *
    1.2;
  const dynamicBodyY = Math.max(
    config.bodyY,
    config.headlineY + headlineHeight + 36
  );

  const bodyEl = slide.elements.find(isBodyElement);
  const bodyText = bodyEl?.text || bodyEl?.content || "";
  const bodyFontSize = config.bodyFontSize || bodyEl?.fontSize || 30;
  const bodyHeight =
    Math.max(1, estimateLineCount(bodyText, bodyFontSize, 680)) *
    bodyFontSize *
    1.5;

  const dirEl = slide.elements.find(isDirectiveTextElement);
  const dirText = dirEl?.text || dirEl?.content || "";
  const dirFontSize = config.dirTextFontSize || dirEl?.fontSize || 24;
  const dirTextHeight =
    Math.max(1, estimateLineCount(dirText, dirFontSize, 700)) * dirFontSize * 1.4;
  const dynamicDirRectHeight = Math.max(config.dirRectHeight, dirTextHeight + 60);
  const dynamicDirRectY = Math.max(
    config.dirRectY,
    dynamicBodyY + bodyHeight + 40 + dynamicDirRectHeight / 2
  );
  const dynamicDirTextY = dynamicDirRectY - dynamicDirRectHeight / 2 + 30;

  let alignX = config.headlineX;
  let originX = "left";
  if (config.textAlign === "center") {
    alignX = Math.round(canvasWidth / 2);
    originX = "center";
  } else if (config.textAlign === "right") {
    alignX = canvasWidth - 140;
    originX = "right";
  }

  const updatedElements = slide.elements.map((el) => {
    if (isChromeBadgeElement(el)) {
      return {
        ...el,
        fill: config.primaryColor,
        x: alignX,
        originX,
        textAlign: config.textAlign,
      };
    }
    if (isPageNumberElement(el)) {
      return {
        ...el,
        x: config.pageNumberX ?? THEME.chrome.pageNumber.x,
        y: config.pageNumberY ?? THEME.chrome.pageNumber.y,
        fontSize: config.pageNumberFontSize ?? THEME.typography.footer.fontSize,
        fill: config.pageNumberColor || THEME.colors.footer,
      };
    }
    if (isSwipeElement(el)) {
      const isFollow =
        isLastSlide ||
        (typeof el.text === "string" && el.text.includes("Follow"));
      return {
        ...el,
        x: isFollow ? (config.followX ?? 940) : (config.swipeX ?? 940),
        y: isFollow ? (config.followY ?? 1210) : (config.swipeY ?? 1210),
        fontSize: isFollow
          ? (config.followFontSize ?? 24)
          : (config.swipeFontSize ?? 24),
        fill: isFollow
          ? config.followColor || THEME.colors.footer
          : config.swipeColor || THEME.colors.footer,
        text: isFollow
          ? config.followText || "Follow for more →"
          : config.swipeText || "Swipe →",
      };
    }
    if (isBackgroundRect(el)) {
      return {
        ...el,
        stroke: config.accentColor,
      };
    }

    // Uploaded images must pass through untouched — registry restores them after.
    if (isImageElement(el)) {
      return el;
    }

    let resEl = el;
    if (isHeadlineElement(el)) {
      resEl = {
        ...el,
        x: config.textAlign === "left" ? config.headlineX : alignX,
        y: config.headlineY,
        fontSize: config.headlineFontSize,
        fontFamily: config.headlineFont,
        fill: config.headlineColor || el.fill,
        originX,
        textAlign: config.textAlign,
      };
    } else if (isBodyElement(el)) {
      resEl = {
        ...el,
        x: config.textAlign === "left" ? config.bodyX : alignX,
        y: dynamicBodyY,
        fontSize: config.bodyFontSize,
        fontFamily: config.bodyFont,
        fill: config.bodyColor || el.fill,
        originX,
        textAlign: config.textAlign,
      };
    } else if (isDirectiveTextElement(el)) {
      resEl = {
        ...el,
        x: config.textAlign === "left" ? config.dirTextX : alignX,
        y: dynamicDirTextY,
        fontSize: config.dirTextFontSize,
        fontFamily: config.bodyFont,
        fill: config.dirTextColor || config.primaryColor,
        originX: config.textAlign === "left" ? "left" : originX,
        textAlign: config.textAlign,
      };
    } else if (isDirectiveRectElement(el)) {
      resEl = {
        ...el,
        x: config.dirRectX,
        y: dynamicDirRectY,
        width: config.dirRectWidth,
        height: dynamicDirRectHeight,
        fill: config.dirRectFill,
        stroke: config.dirRectStroke || config.primaryColor,
        strokeWidth: config.dirRectStrokeWidth,
        originX: "center",
        originY: "center",
      };
    }

    if (resEl.positionOverride) {
      if (resEl.positionOverride.x !== undefined) resEl.x = resEl.positionOverride.x;
      if (resEl.positionOverride.y !== undefined) resEl.y = resEl.positionOverride.y;
      if (resEl.positionOverride.width !== undefined) {
        resEl.width = resEl.positionOverride.width;
      }
      if (resEl.positionOverride.height !== undefined) {
        resEl.height = resEl.positionOverride.height;
      }
    }

    return resEl;
  });

  return {
    ...slide,
    backgroundColor: config.bgColor,
    bgPattern: config.bgPattern,
    elements: updatedElements,
  };
}

// Fields that make up a complete image element snapshot to persist in the registry
const IMAGE_PERSIST_FIELDS = [
  "type", "src",
  "x", "y", "width", "height", "rotation",
  "originX", "originY", "scaleX", "scaleY",
  "isPlaceholder", "strokeDashArray",
];

// Extract only the persistable fields from an element into a snapshot
function pickImageSnapshot(el) {
  const snapshot = {};
  for (const key of IMAGE_PERSIST_FIELDS) {
    if (el[key] !== undefined) snapshot[key] = el[key];
  }
  return snapshot;
}

// Utility: Restore full image element state (src + geometry) from the registry into a document
function restoreImagesFromRegistry(doc, registry) {
  if (!doc || !registry || Object.keys(registry).length === 0) return doc;
  return {
    ...doc,
    slides: doc.slides.map((slide) => ({
      ...slide,
      elements: slide.elements.map((el) => {
        const saved = registry[el.id];
        if (!saved) return el;

        // Restore a fully-converted image element
        if (saved.type === "image" || el.type === "image") {
          return {
            ...el,
            ...saved,               // merge saved geometry + src on top
            type: "image",
            isPlaceholder: false,
            strokeDashArray: null,
          };
        }

        // Restore a placeholder rect that was converted to an image
        if (el.isPlaceholder || el.id?.includes("placeholder")) {
          return {
            ...el,
            ...saved,
            type: "image",
            isPlaceholder: false,
            strokeDashArray: null,
          };
        }

        return el;
      }),
    })),
  };
}

export const useCarouselStore = create((set, get) => ({
  document: initialCarousel,
  selectedElementId: null,
<<<<<<< HEAD
  zoom: 1,
  showSafeAreaGuides: false,
  snapToGuides: false,
=======
  zoom: 1, // 1 = 100% Fit to Screen
  showSafeAreaGuides: false,
  snapToGuides: true,
  toggleSnapToGuides: () =>
    set((state) => ({ snapToGuides: !state.snapToGuides })),
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
  historyPast: [],
  historyFuture: [],
  clipboardElement: null,
  imageRegistry: {},
  globalLayoutConfig: { ...DEFAULT_GLOBAL_LAYOUT_CONFIG },

  // Registry that persists uploaded image element state (src + full geometry) independently of
  // document state. Key: element id, Value: full image snapshot. Survives setDocument,
  // undo/redo, applyGlobalLayout, and slide switches.
  imageRegistry: {},

  // Register a full image snapshot in the registry (exposed for external use if needed)
  registerImage: (elementId, snapshot) =>
    set((state) => ({
      imageRegistry: { ...state.imageRegistry, [elementId]: snapshot },
    })),

  toggleSafeAreaGuides: () =>
    set((state) => ({ showSafeAreaGuides: !state.showSafeAreaGuides })),

  toggleSnapToGuides: () =>
    set((state) => {
      const next = !state.snapToGuides;
      return {
        snapToGuides: next,
        globalLayoutConfig: { ...state.globalLayoutConfig, snapToGuides: next },
      };
    }),

  pushHistory: () => {
    const currentDoc = get().document;
    if (!currentDoc) return;
    const past = get().historyPast;
    set({
      historyPast: [...past, cloneDoc(currentDoc)].slice(-HISTORY_LIMIT),
      historyFuture: [],
    });
  },

  undo: () => {
    const past = get().historyPast;
    if (past.length === 0) return;
    const previousDoc = past[past.length - 1];
    const currentDoc = get().document;
<<<<<<< HEAD
    const restored = restoreImagesFromRegistry(previousDoc, get().imageRegistry);

    set({
      document: restored,
      historyPast: past.slice(0, -1),
      historyFuture: [cloneDoc(currentDoc), ...get().historyFuture].slice(
        0,
        HISTORY_LIMIT
      ),
=======
    const registry = get().imageRegistry;

    set({
      document: restoreImagesFromRegistry(previousDoc, registry),
      historyPast: newPast,
      historyFuture: [JSON.parse(JSON.stringify(currentDoc)), ...get().historyFuture],
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
      selectedElementId: null,
    });
  },

  redo: () => {
    const future = get().historyFuture;
    if (future.length === 0) return;
    const nextDoc = future[0];
    const currentDoc = get().document;
<<<<<<< HEAD
    const restored = restoreImagesFromRegistry(nextDoc, get().imageRegistry);

    set({
      document: restored,
      historyPast: [...get().historyPast, cloneDoc(currentDoc)].slice(
        -HISTORY_LIMIT
      ),
      historyFuture: future.slice(1),
=======
    const registry = get().imageRegistry;

    set({
      document: restoreImagesFromRegistry(nextDoc, registry),
      historyPast: [...get().historyPast, JSON.parse(JSON.stringify(currentDoc))],
      historyFuture: newFuture,
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
      selectedElementId: null,
    });
  },

  setDocument: (newDocument, { resetRegistry = false } = {}) => {
    get().pushHistory();
<<<<<<< HEAD
    const baseRegistry = resetRegistry ? {} : get().imageRegistry;
    const hydrated = hydrateRegistryFromDocument(newDocument, baseRegistry);
    const restored = restoreImagesFromRegistry(newDocument, hydrated);
    set({
      document: restored,
      imageRegistry: hydrated,
=======
    const registry = get().imageRegistry;
    set({
      document: restoreImagesFromRegistry(newDocument, registry),
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
      selectedElementId: null,
    });
  },

  updateCarouselMetadata: (updates) =>
    set((state) => ({
      document: {
        ...state.document,
        metadata: {
          ...state.document.metadata,
          ...updates,
        },
      },
    })),

  resetToInitial: () =>
    set({
      document: initialCarousel,
      selectedElementId: null,
<<<<<<< HEAD
      imageRegistry: {},
      historyPast: [],
      historyFuture: [],
      clipboardElement: null,
=======
      imageRegistry: {}, // Clear uploaded image registry on full reset
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
    }),

  setActiveSlide: (slideId) =>
    set((state) => {
<<<<<<< HEAD
      const outgoing = state.document.slides.find(
        (s) => s.id === state.document.activeSlideId
      );
      const imageRegistry = snapshotSlideImages(outgoing, state.imageRegistry);

      return {
        imageRegistry,
=======
      // Before leaving the current slide, snapshot ALL image elements into the registry
      // so their src + geometry survive any document rewrite after the switch.
      const currentSlide = state.document.slides.find(
        (s) => s.id === state.document.activeSlideId
      );
      let updatedRegistry = state.imageRegistry;
      if (currentSlide) {
        for (const el of currentSlide.elements) {
          if (el.type === "image" && el.src) {
            updatedRegistry = { ...updatedRegistry, [el.id]: pickImageSnapshot(el) };
          }
          // Also capture placeholder rects that have been converted to images
          if ((el.isPlaceholder === false || el.id?.includes("placeholder")) && el.src) {
            updatedRegistry = { ...updatedRegistry, [el.id]: pickImageSnapshot(el) };
          }
        }
      }
      return {
        imageRegistry: updatedRegistry,
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
        document: {
          ...state.document,
          activeSlideId: slideId,
        },
        selectedElementId: null,
      };
    }),

  addSlide: () =>
    set((state) => {
      const existing = state.document.slides;
      const newSlideId = `slide_${Date.now()}`;
      const badgeEl = existing[0]?.elements?.find(isChromeBadgeElement);
      const composed = composeSlide([], {
        slideId: newSlideId,
        pageIndex: existing.length + 1,
        totalPages: existing.length + 1,
        badgeText: badgeEl?.text || "SWE NOTEBOOK",
        backgroundColor: existing[0]?.backgroundColor || "#ffffff",
        accent: state.globalLayoutConfig.primaryColor || THEME.colors.accent,
        textAlign: state.document.metadata?.textAlign || "left",
      });

      const slides = syncChromePagination([...existing, composed]);

      return {
        document: {
          ...state.document,
          slides,
          activeSlideId: newSlideId,
        },
        selectedElementId: null,
      };
    }),

  duplicateSlide: (slideId) =>
    set((state) => {
      const slideToDuplicate = state.document.slides.find((s) => s.id === slideId);
      if (!slideToDuplicate) return state;

      const newSlideId = `slide_${Date.now()}`;
      const imageRegistry = { ...state.imageRegistry };

      const duplicatedSlide = {
        ...slideToDuplicate,
        id: newSlideId,
        elements: slideToDuplicate.elements.map((el, index) => {
          let newId;
          if (isChromeElement(el)) {
            newId = el.id.includes(slideId)
              ? el.id.replace(slideId, newSlideId)
              : `${el.id.replace(/_slide_.*$/, "")}_${newSlideId}`;
          } else {
            newId = `${el.type}_${Date.now()}_${index}_${Math.random()
              .toString(36)
              .slice(2, 4)}`;
          }

          const cloned = { ...el, id: newId };
          if (el.type === "image" && el.src) {
            imageRegistry[newId] = pickImageSnapshot(cloned);
          }
          return cloned;
        }),
      };

      const index = state.document.slides.findIndex((s) => s.id === slideId);
      const updatedSlides = [...state.document.slides];
      updatedSlides.splice(index + 1, 0, duplicatedSlide);

      return {
        imageRegistry,
        document: {
          ...state.document,
          slides: syncChromePagination(updatedSlides),
          activeSlideId: newSlideId,
        },
        selectedElementId: null,
      };
    }),

  deleteSlide: (slideId) =>
    set((state) => {
      const filteredSlides = state.document.slides.filter((s) => s.id !== slideId);
      if (filteredSlides.length === 0) return state;

      const nextActiveId =
        state.document.activeSlideId === slideId
          ? filteredSlides[0].id
          : state.document.activeSlideId;

      return {
        document: {
          ...state.document,
          slides: syncChromePagination(filteredSlides),
          activeSlideId: nextActiveId,
        },
        selectedElementId: null,
      };
    }),

  updateSlideBackground: (slideId, color) =>
    set((state) => ({
      document: {
        ...state.document,
        slides: state.document.slides.map((slide) =>
          slide.id === slideId ? { ...slide, backgroundColor: color } : slide
        ),
      },
    })),

  addElement: (element) => {
    get().pushHistory();
    set((state) => {
      const { activeSlideId, slides } = state.document;
<<<<<<< HEAD
      const imageRegistry = { ...state.imageRegistry };
      if (element.type === "image") {
        imageRegistry[element.id] = pickImageSnapshot(element);
      }

      return {
        imageRegistry,
=======
      // Persist full image snapshot (src + geometry) in registry when an image is added
      const newRegistry =
        element.type === "image" && element.src
          ? { ...state.imageRegistry, [element.id]: pickImageSnapshot(element) }
          : state.imageRegistry;
      return {
        imageRegistry: newRegistry,
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
        document: {
          ...state.document,
          slides: slides.map((slide) =>
            slide.id === activeSlideId
              ? {
                  ...slide,
                  elements: [
                    ...slide.elements,
                    {
                      ...element,
                      zIndex: maxZIndex(slide.elements) + 1,
                    },
                  ],
                }
              : slide
          ),
        },
        selectedElementId: element.id,
      };
    });
  },

  updateElement: (id, updates) =>
    set((state) => {
<<<<<<< HEAD
      let matched = null;
      const slides = state.document.slides.map((slide) => ({
        ...slide,
        elements: slide.elements.map((el) => {
          if (el.id !== id) return el;
          matched = { ...el, ...updates };
          return matched;
        }),
      }));

      const imageRegistry = { ...state.imageRegistry };
      if (
        matched &&
        (matched.type === "image" ||
          updates.type === "image" ||
          imageRegistry[id] ||
          Boolean(matched.src))
      ) {
        imageRegistry[id] = {
          ...(imageRegistry[id] || {}),
          ...pickImageSnapshot(matched),
        };
      }

      return {
        imageRegistry,
=======
      const { activeSlideId, slides } = state.document;

      // Search ALL slides for the existing element so any slide's image geometry is tracked,
      // not just the currently active one.
      let existingEl = null;
      for (const slide of slides) {
        const found = slide.elements.find((el) => el.id === id);
        if (found) { existingEl = found; break; }
      }

      const isImageEl =
        existingEl?.type === "image" ||
        updates.type === "image" ||
        (existingEl?.isPlaceholder && updates.src);

      const newRegistry = isImageEl
        ? { ...state.imageRegistry, [id]: pickImageSnapshot({ ...existingEl, ...updates }) }
        : state.imageRegistry;

      return {
        imageRegistry: newRegistry,
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
        document: {
          ...state.document,
          slides,
        },
      };
    }),

  deleteElement: (id) => {
    get().pushHistory();
    set((state) => ({
      document: {
        ...state.document,
        slides: state.document.slides.map((slide) => {
          if (!slide.elements.some((el) => el.id === id)) return slide;
          return {
            ...slide,
            elements: slide.elements.filter((el) => el.id !== id),
          };
        }),
      },
      selectedElementId: null,
    }));
  },

  registerImage: (elementId, snapshot) =>
    set((state) => ({
      imageRegistry: {
        ...state.imageRegistry,
        [elementId]: snapshot,
      },
    })),

  copySelectedElement: () => {
    const { selectedElementId, document: doc } = get();
    if (!selectedElementId || !doc) return;
    for (const slide of doc.slides) {
      const el = slide.elements.find((item) => item.id === selectedElementId);
      if (el && !isChromeElement(el)) {
        set({ clipboardElement: cloneDoc(el) });
        return;
      }
    }
  },

  pasteClipboardElement: (pastedImageDataUrl, pastedText) => {
    const state = get();
    const activeSlide = state.document.slides.find(
      (s) => s.id === state.document.activeSlideId
    );
    if (!activeSlide) return;

    const canvasWidth = state.document.metadata?.width || THEME.canvas.width;
    const canvasHeight = state.document.metadata?.height || THEME.canvas.height;

    if (pastedImageDataUrl) {
      const placeholder = activeSlide.elements.find(
        (el) =>
          el.isPlaceholder ||
          (typeof el.id === "string" && el.id.includes("placeholder"))
      );
      if (placeholder) {
        get().updateElement(placeholder.id, {
          type: "image",
          src: pastedImageDataUrl,
          isPlaceholder: false,
          strokeDashArray: null,
        });
      } else {
        get().addElement({
          id: createElementId("image"),
          type: "image",
          src: pastedImageDataUrl,
          x: Math.round(canvasWidth / 2),
          y: Math.round(canvasHeight * 0.55),
          width: 760,
          height: 480,
          originX: "center",
          originY: "center",
          rotation: 0,
          zIndex: 10,
        });
      }
      return;
    }

    if (state.clipboardElement) {
      const cloned = cloneDoc(state.clipboardElement);
      cloned.id = createElementId(cloned.type || "el");
      cloned.x = (cloned.x || 0) + 24;
      cloned.y = (cloned.y || 0) + 24;
      get().addElement(cloned);
      return;
    }

    if (pastedText) {
      get().addElement({
        id: createElementId("text"),
        type: "text",
        x: THEME.contentZone.x,
        y: THEME.contentZone.y + 180,
        width: THEME.contentZone.width,
        text: pastedText,
        fontSize: THEME.typography.body.fontSize,
        fontFamily: THEME.typography.body.fontFamily,
        fill: THEME.colors.textSecondary,
        rotation: 0,
        zIndex: 10,
      });
    }
  },

  duplicateSelectedElement: () => {
    const { selectedElementId, document: doc, copySelectedElement, pasteClipboardElement } =
      get();
    if (!selectedElementId || !doc) return;
    copySelectedElement();
    pasteClipboardElement();
  },

  nudgeElementLayer: (id, direction) =>
    set((state) => ({
      document: {
        ...state.document,
        slides: state.document.slides.map((slide) => {
          const target = slide.elements.find((el) => el.id === id);
          if (!target || isChromeElement(target)) return slide;

          const editable = slide.elements.filter((el) => !isChromeElement(el));
          const zValues = editable.map((el) => el.zIndex || 0);
          const current = target.zIndex || 0;

          let nextZ = current;
          if (direction === "front") {
            nextZ = Math.max(0, ...zValues) + 1;
          } else if (direction === "back") {
            nextZ = Math.min(...zValues) - 1;
          } else if (direction === "forward") {
            const higher = zValues.filter((z) => z > current).sort((a, b) => a - b);
            nextZ = higher[0] !== undefined ? higher[0] + 0.5 : current + 1;
          } else if (direction === "backward") {
            const lower = zValues.filter((z) => z < current).sort((a, b) => b - a);
            nextZ = lower[0] !== undefined ? lower[0] - 0.5 : current - 1;
          }

          const updated = slide.elements.map((el) =>
            el.id === id ? { ...el, zIndex: nextZ } : el
          );
          const ordered = [...updated].sort(
            (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
          );
          return {
            ...slide,
            elements: ordered.map((el, index) => ({
              ...el,
              zIndex: isChromeElement(el) ? Math.max(el.zIndex || 0, 100) : index + 1,
            })),
          };
        }),
      },
    })),

  selectElement: (id) => set({ selectedElementId: id }),
  setZoom: (zoom) => set({ zoom }),

<<<<<<< HEAD
=======
  // Clipboard & Copy / Paste Actions
  clipboardElement: null,

  copySelectedElement: () => {
    const { selectedElementId, document: doc } = get();
    if (!selectedElementId || !doc) return;
    const activeSlide = doc.slides.find((s) => s.id === doc.activeSlideId);
    if (!activeSlide) return;
    const targetElement = activeSlide.elements.find((el) => el.id === selectedElementId);
    if (targetElement) {
      const copy = JSON.parse(JSON.stringify(targetElement));
      set({ clipboardElement: copy });
      if (copy.text && navigator.clipboard) {
        try {
          navigator.clipboard.writeText(copy.text);
        } catch (e) {
          // Ignore browser clipboard write permissions
        }
      }
    }
  },

  pasteClipboardElement: (pastedImageDataUrl = null, pastedText = null) => {
    const { clipboardElement, document: doc, addElement, updateElement } = get();
    const activeSlide = doc.slides.find((s) => s.id === doc.activeSlideId);
    if (!activeSlide) return;

    // 1. Handle Pasted Image Data URL / Image File
    if (pastedImageDataUrl) {
      const existingPlaceholder = activeSlide.elements.find(
        (el) => el.isPlaceholder || el.id?.includes("placeholder")
      );
      if (existingPlaceholder) {
        updateElement(existingPlaceholder.id, {
          type: "image",
          src: pastedImageDataUrl,
          isPlaceholder: false,
          strokeDashArray: null,
        });
        set({ selectedElementId: existingPlaceholder.id });
      } else {
        const newImgId = `img_${Date.now()}`;
        addElement({
          id: newImgId,
          type: "image",
          src: pastedImageDataUrl,
          x: 540,
          y: 794,
          width: 760,
          height: 480,
          originX: "center",
          originY: "center",
          rotation: 0,
          zIndex: 10,
        });
        set({ selectedElementId: newImgId });
      }
      return;
    }

    // 2. Handle Copied Internal Element (Ctrl+C -> Ctrl+V)
    if (clipboardElement) {
      const newId = `${clipboardElement.type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const pastedElement = {
        ...clipboardElement,
        id: newId,
        x: (clipboardElement.x || 160) + 24,
        y: (clipboardElement.y || 210) + 24,
        zIndex: activeSlide.elements.length + 10,
      };
      addElement(pastedElement);
      set({ selectedElementId: newId });
      return;
    }

    // 3. Handle Plain Text from Clipboard
    if (pastedText && typeof pastedText === "string" && pastedText.trim()) {
      const newTextId = `text_${Date.now()}`;
      addElement({
        id: newTextId,
        type: "text",
        text: pastedText.trim(),
        x: 160,
        y: 350,
        width: 760,
        fontSize: 32,
        fontFamily: "Inter",
        fill: "#0f172a",
        rotation: 0,
        zIndex: 10,
      });
      set({ selectedElementId: newTextId });
    }
  },

  // Global Layout & Theme Configuration
  globalLayoutConfig: {
    aspectRatio: "4:5",
    primaryColor: "#C84B31",
    accentColor: "#FAD4C0",
    bgColor: "#ffffff",
    bgPattern: "solid",
    headlineFont: "Inter",
    bodyFont: "Inter",
    textAlign: "left",
    headlineX: 187,
    headlineY: 273,
    headlineFontSize: 44,
    headlineColor: "#0f172a",
    bodyX: 179,
    bodyY: 409,
    bodyFontSize: 30,
    bodyColor: "#475569",
    dirRectX: 544,
    dirRectY: 865,
    dirRectWidth: 760,
    dirRectHeight: 340,
    dirRectFill: "#eff6ff",
    dirRectStroke: "#8e5c29",
    dirRectStrokeWidth: 2,
    dirTextX: 200,
    dirTextY: 770,
    dirTextFontSize: 24,
    dirTextColor: "#8e5c29",
    // Slide Number, Swipe & Follow CTA Configurations
    pageNumberX: 140,
    pageNumberY: 1210,
    pageNumberFontSize: 24,
    pageNumberColor: "#64748b",
    swipeX: 940,
    swipeY: 1210,
    swipeFontSize: 24,
    swipeColor: "#64748b",
    swipeText: "Swipe →",
    followX: 940,
    followY: 1210,
    followFontSize: 24,
    followColor: "#64748b",
    followText: "Follow for more →",
    // Global Grid, Margin, Gutter & Element Padding Controls
    showGrid: false,
    snapToGuides: true,
    marginTop: 80,
    marginRight: 80,
    marginBottom: 80,
    marginLeft: 80,
    gridColumns: 4,
    gutterWidth: 16,
    elementPadding: 14,
    // Safe Area Margins & Content Zone Clearance / Paddings
    safeAreaMarginTop: 80,
    safeAreaMarginBottom: 80,
    safeAreaMarginLeft: 80,
    safeAreaMarginRight: 80,
    contentTopClearance: 210,
    contentBottomClearance: 1180,
    contentPaddingLeft: 60,
    contentPaddingRight: 60,
  },

>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
  setGlobalLayoutConfig: (configUpdates) =>
    set((state) => ({
      globalLayoutConfig: { ...state.globalLayoutConfig, ...configUpdates },
    })),

  applyGlobalLayoutConfigToAllSlides: (customConfig = null) =>
    set((state) => {
      const config = customConfig || state.globalLayoutConfig;
      const { slides } = state.document;
      if (!slides || slides.length === 0) return state;

      const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(
        config.aspectRatio || "4:5"
      );

      const updatedSlides = slides.map((slide, sIdx) =>
        applyConfigToSlide(slide, config, {
          isLastSlide: sIdx === slides.length - 1,
          canvasWidth,
        })
      );

<<<<<<< HEAD
      const nextDoc = {
        ...state.document,
        metadata: {
          ...state.document.metadata,
          aspectRatio: config.aspectRatio || "4:5",
          width: canvasWidth,
          height: canvasHeight,
=======
      THEME.safeArea = {
        top: saTop,
        bottom: saBottom,
        left: saLeft,
        right: saRight,
        width: canvasWidth - saLeft - saRight,
        height: canvasHeight - saTop - saBottom,
      };

      THEME.contentZone = {
        top: config.contentTopClearance ?? 210,
        bottom: config.contentBottomClearance ?? 1180,
        paddingTop: saTop + 130,
        paddingBottom: saBottom + 60,
        paddingLeft: config.contentPaddingLeft ?? 60,
        paddingRight: config.contentPaddingRight ?? 60,
        width: canvasWidth - saLeft * 2 - (config.contentPaddingLeft ?? 60) * 2,
        height: (config.contentBottomClearance ?? 1180) - (config.contentTopClearance ?? 210),
      };

      let alignX = config.headlineX;
      let originX = "left";
      if (config.textAlign === "center") {
        alignX = Math.round(canvasWidth / 2);
        originX = "center";
      } else if (config.textAlign === "right") {
        alignX = canvasWidth - 140;
        originX = "right";
      }

      const updatedSlides = slides.map((slide, sIdx) => {
        const isLastSlide = sIdx === slides.length - 1;

        // 1. Estimate Headline height & wrapped lines
        const headlineEl = slide.elements.find(
          (el) =>
            el.type === "headline" ||
            el.id.includes("title") ||
            el.id.includes("headline") ||
            el.id.startsWith("el_head_")
        );
        const headlineText = headlineEl?.text || headlineEl?.content || "";
        const headlineFontSize = config.headlineFontSize || headlineEl?.fontSize || 44;
        const avgHeadCharWidth = headlineFontSize * 0.55;
        const headCharsPerLine = Math.max(1, Math.floor(680 / avgHeadCharWidth));
        const headWords = headlineText.split(/\s+/).filter(Boolean);
        let headLines = headWords.length ? 1 : 1;
        let curHeadLen = 0;
        for (const w of headWords) {
          if (curHeadLen + w.length + 1 > headCharsPerLine) {
            headLines++;
            curHeadLen = w.length + 1;
          } else {
            curHeadLen += w.length + 1;
          }
        }
        const headlineHeight = Math.max(1, headLines) * headlineFontSize * 1.2;
        const dynamicBodyY = Math.max(config.bodyY, config.headlineY + headlineHeight + 36);

        // 2. Estimate Body text height & wrapped lines
        const bodyEl = slide.elements.find(
          (el) =>
            (el.type === "text" &&
              !el.id.includes("chrome") &&
              !el.id.includes("title") &&
              !el.id.includes("headline") &&
              !el.id.startsWith("el_head_")) ||
            el.id.includes("body") ||
            el.id.startsWith("el_body_")
        );
        const bodyText = bodyEl?.text || bodyEl?.content || "";
        const bodyFontSize = config.bodyFontSize || bodyEl?.fontSize || 30;
        const avgBodyCharWidth = bodyFontSize * 0.55;
        const bodyCharsPerLine = Math.max(1, Math.floor(680 / avgBodyCharWidth));
        const bodyWords = bodyText.split(/\s+/).filter(Boolean);
        let bodyLines = bodyWords.length ? 1 : 1;
        let curBodyLen = 0;
        for (const w of bodyWords) {
          if (curBodyLen + w.length + 1 > bodyCharsPerLine) {
            bodyLines++;
            curBodyLen = w.length + 1;
          } else {
            curBodyLen += w.length + 1;
          }
        }
        const bodyHeight = Math.max(1, bodyLines) * bodyFontSize * 1.5;

        // 3. Estimate Directive text height & dynamic Directive Rect Box sizing
        const dirEl = slide.elements.find(
          (el) =>
            (typeof el.text === "string" && el.text.includes("Visual:")) ||
            (typeof el.content === "string" && el.content.includes("Visual:")) ||
            el.id.includes("visual") ||
            el.id.includes("dir_text")
        );
        const dirText = dirEl?.text || dirEl?.content || "";
        const dirFontSize = config.dirTextFontSize || dirEl?.fontSize || 24;
        const avgDirCharWidth = dirFontSize * 0.55;
        const dirCharsPerLine = Math.max(1, Math.floor(700 / avgDirCharWidth));
        const dirWords = dirText.split(/\s+/).filter(Boolean);
        let dirLines = dirWords.length ? 1 : 1;
        let curDirLen = 0;
        for (const w of dirWords) {
          if (curDirLen + w.length + 1 > dirCharsPerLine) {
            dirLines++;
            curDirLen = w.length + 1;
          } else {
            curDirLen += w.length + 1;
          }
        }
        const dirTextHeight = Math.max(1, dirLines) * dirFontSize * 1.4;
        const dynamicDirRectHeight = Math.max(config.dirRectHeight, dirTextHeight + 60);
        const dynamicDirRectY = Math.max(
          config.dirRectY,
          dynamicBodyY + bodyHeight + 40 + dynamicDirRectHeight / 2
        );
        const dynamicDirTextY = dynamicDirRectY - dynamicDirRectHeight / 2 + 30;

        const updatedElements = slide.elements.map((el) => {
          // Chrome Badge
          if (el.id === "chrome_badge") {
            return {
              ...el,
              fill: config.primaryColor,
              x: alignX,
              originX,
              textAlign: config.textAlign,
            };
          }
          // Slide Number / Page Number Badge
          if (el.id === "chrome_page_number" || el.id.includes("page_number") || el.id.includes("slide_no")) {
            return {
              ...el,
              x: config.pageNumberX ?? 140,
              y: config.pageNumberY ?? 1210,
              fontSize: config.pageNumberFontSize ?? 24,
              fill: config.pageNumberColor || "#64748b",
            };
          }
          // Swipe Indicator or Follow CTA Text Element
          if (el.id === "chrome_swipe" || el.id.includes("swipe") || el.id.includes("follow")) {
            const isFollow = isLastSlide || (typeof el.text === "string" && el.text.includes("Follow"));
            return {
              ...el,
              x: isFollow ? (config.followX ?? 940) : (config.swipeX ?? 940),
              y: isFollow ? (config.followY ?? 1210) : (config.swipeY ?? 1210),
              fontSize: isFollow ? (config.followFontSize ?? 24) : (config.swipeFontSize ?? 24),
              fill: isFollow ? (config.followColor || "#64748b") : (config.swipeColor || "#64748b"),
              text: isFollow ? (config.followText || "Follow for more →") : (config.swipeText || "Swipe →"),
            };
          }
          // Background Frame Card
          if (el.id.includes("_bg") || el.id === "rect_bg") {
            return {
              ...el,
              stroke: config.accentColor,
            };
          }

          const isHeadline =
            el.type === "headline" ||
            el.id.includes("title") ||
            el.id.includes("headline") ||
            el.id.startsWith("el_head_");
          const isDirectiveText =
            (typeof el.text === "string" && el.text.includes("Visual:")) ||
            (typeof el.content === "string" && el.content.includes("Visual:")) ||
            el.id.includes("visual") ||
            el.id.includes("dir_text");
          const isBody =
            (el.type === "text" && !isHeadline && !isDirectiveText && !el.id.includes("chrome")) ||
            el.id.includes("body") ||
            el.id.startsWith("el_body_");
          const isDirectiveRect =
            el.type === "badge" ||
            el.id.includes("visual_card") ||
            el.id.includes("dir") ||
            (el.type === "rect" && !el.id.includes("_bg"));

          let resEl = el;
          if (isHeadline) {
            resEl = {
              ...el,
              x: config.textAlign === "left" ? (config.headlineX || THEME.contentZone.x) : alignX,
              y: config.headlineY,
              width: THEME.contentZone.width,
              fontSize: config.headlineFontSize,
              fontFamily: config.headlineFont,
              fill: config.headlineColor || el.fill,
              originX,
              textAlign: config.textAlign,
            };
          } else if (isBody) {
            resEl = {
              ...el,
              x: config.textAlign === "left" ? (config.bodyX || THEME.contentZone.x) : alignX,
              y: dynamicBodyY,
              width: THEME.contentZone.width,
              fontSize: config.bodyFontSize,
              fontFamily: config.bodyFont,
              fill: config.bodyColor || el.fill,
              originX,
              textAlign: config.textAlign,
            };
          } else if (isDirectiveText) {
            resEl = {
              ...el,
              x: config.textAlign === "left" ? config.dirTextX : alignX,
              y: dynamicDirTextY,
              fontSize: config.dirTextFontSize,
              fontFamily: config.bodyFont,
              fill: config.dirTextColor || config.primaryColor,
              originX: config.textAlign === "left" ? "left" : originX,
              textAlign: config.textAlign,
            };
          } else if (isDirectiveRect) {
            resEl = {
              ...el,
              x: config.dirRectX,
              y: dynamicDirRectY,
              width: config.dirRectWidth,
              height: dynamicDirRectHeight,
              fill: config.dirRectFill,
              stroke: config.dirRectStroke || config.primaryColor,
              strokeWidth: config.dirRectStrokeWidth,
              originX: "center",
              originY: "center",
            };
          }

          if (el.positionOverride) {
            if (el.positionOverride.x !== undefined) resEl.x = el.positionOverride.x;
            if (el.positionOverride.y !== undefined) resEl.y = el.positionOverride.y;
            if (el.positionOverride.width !== undefined) resEl.width = el.positionOverride.width;
            if (el.positionOverride.height !== undefined) resEl.height = el.positionOverride.height;
          }

          return resEl;
        });

        return {
          ...slide,
          backgroundColor: config.bgColor,
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
          bgPattern: config.bgPattern,
          textAlign: config.textAlign,
        },
        slides: updatedSlides,
      };

      const registry = state.imageRegistry;
      const slidesWithImages = restoreImagesFromRegistry(
        { ...state.document, slides: updatedSlides },
        registry
      ).slides;

      return {
        globalLayoutConfig: config,
<<<<<<< HEAD
        snapToGuides:
          config.snapToGuides !== undefined
            ? config.snapToGuides
            : state.snapToGuides,
        document: restoreImagesFromRegistry(nextDoc, state.imageRegistry),
=======
        document: {
          ...state.document,
          metadata: {
            ...state.document.metadata,
            aspectRatio: config.aspectRatio || "4:5",
            width: canvasWidth,
            height: canvasHeight,
            bgPattern: config.bgPattern,
            textAlign: config.textAlign,
          },
          slides: slidesWithImages,
        },
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
      };
    }),
}));
