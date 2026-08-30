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

export const useCarouselStore = create((set, get) => ({
  document: initialCarousel,
  selectedElementId: null,
  zoom: 1,
  showSafeAreaGuides: false,
  snapToGuides: false,
  historyPast: [],
  historyFuture: [],
  clipboardElement: null,
  imageRegistry: {},
  globalLayoutConfig: { ...DEFAULT_GLOBAL_LAYOUT_CONFIG },

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
    const restored = restoreImagesFromRegistry(previousDoc, get().imageRegistry);

    set({
      document: restored,
      historyPast: past.slice(0, -1),
      historyFuture: [cloneDoc(currentDoc), ...get().historyFuture].slice(
        0,
        HISTORY_LIMIT
      ),
      selectedElementId: null,
    });
  },

  redo: () => {
    const future = get().historyFuture;
    if (future.length === 0) return;
    const nextDoc = future[0];
    const currentDoc = get().document;
    const restored = restoreImagesFromRegistry(nextDoc, get().imageRegistry);

    set({
      document: restored,
      historyPast: [...get().historyPast, cloneDoc(currentDoc)].slice(
        -HISTORY_LIMIT
      ),
      historyFuture: future.slice(1),
      selectedElementId: null,
    });
  },

  setDocument: (newDocument, { resetRegistry = false } = {}) => {
    get().pushHistory();
    const baseRegistry = resetRegistry ? {} : get().imageRegistry;
    const hydrated = hydrateRegistryFromDocument(newDocument, baseRegistry);
    const restored = restoreImagesFromRegistry(newDocument, hydrated);
    set({
      document: restored,
      imageRegistry: hydrated,
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
      imageRegistry: {},
      historyPast: [],
      historyFuture: [],
      clipboardElement: null,
    }),

  setActiveSlide: (slideId) =>
    set((state) => {
      const outgoing = state.document.slides.find(
        (s) => s.id === state.document.activeSlideId
      );
      const imageRegistry = snapshotSlideImages(outgoing, state.imageRegistry);

      return {
        imageRegistry,
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
      const imageRegistry = { ...state.imageRegistry };
      if (element.type === "image") {
        imageRegistry[element.id] = pickImageSnapshot(element);
      }

      return {
        imageRegistry,
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

      const nextDoc = {
        ...state.document,
        metadata: {
          ...state.document.metadata,
          aspectRatio: config.aspectRatio || "4:5",
          width: canvasWidth,
          height: canvasHeight,
          bgPattern: config.bgPattern,
          textAlign: config.textAlign,
        },
        slides: updatedSlides,
      };

      return {
        globalLayoutConfig: config,
        snapToGuides:
          config.snapToGuides !== undefined
            ? config.snapToGuides
            : state.snapToGuides,
        document: restoreImagesFromRegistry(nextDoc, state.imageRegistry),
      };
    }),
}));
