import { create } from "zustand";
import { initialCarousel } from "../data/initialCarousel";
import { THEME } from "../theme/theme";
import { composeSlide } from "../theme/compose";
import { DEFAULT_GLOBAL_LAYOUT_CONFIG } from "../theme/defaultGlobalLayout";
import { getCanvasDimensions, getLayoutBounds } from "../theme/layoutBounds";
import {
  isChromeElement,
  isImageElement,
  isHeadlineElement,
  isBodyElement,
  isDirectiveTextElement,
  isDirectiveRectElement,
  isBackgroundRect,
  isPageNumberElement,
  isWatermarkElement,
  isSwipeElement,
  isChromeBadgeElement,
  formatPageLabel,
  createElementId,
} from "../theme/elementClassify";
import { wrapTextToLines } from "../canvas/textAnnotations";
import {
  pickImageSnapshot,
  restoreImagesFromRegistry,
  hydrateRegistryFromDocument,
  snapshotSlideImages,
} from "./imageRegistry";
import { contentApi } from "../../../infrastructure/api/contentApi";

let canvasSaveTimer = null;
function debounceCanvasSave(postId, slideId, canvasData) {
  if (!postId || !slideId || !canvasData) return;
  if (canvasSaveTimer) clearTimeout(canvasSaveTimer);
  canvasSaveTimer = setTimeout(() => {
    contentApi.updateSlideCanvas(postId, slideId, canvasData).catch((err) => {
      console.debug("Background canvas auto-save skipped or offline:", err.message);
    });
  }, 600);
}

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
          if (el.type === "image") {
            return el;
          }
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
  const avgCharWidth = fontSize * 0.44;
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

function applyConfigToSlide(slide, config, { isLastSlide, canvasWidth, canvasHeight = 1350 }) {
  const bounds = getLayoutBounds(config, { width: canvasWidth, height: canvasHeight });
  const { contentZone, safeArea } = bounds;

  const headlineEl = slide.elements.find(isHeadlineElement);
  const headlineText = headlineEl?.text || headlineEl?.content || "";
  const headlineFontSize = config.headlineFontSize || headlineEl?.fontSize || 92;
  const headlineY = config.headlineY ?? contentZone.top;
  const headlineLines = wrapTextToLines(headlineText, headlineFontSize, contentZone.width).length || 1;
  const headlineHeight = headlineLines * headlineFontSize * 1.15;

  const dynamicBodyY = Math.round(headlineY + headlineHeight + 28);

  const bodyEl = slide.elements.find(isBodyElement);
  const bodyText = bodyEl?.text || bodyEl?.content || "";
  const bodyFontSize = config.bodyFontSize || bodyEl?.fontSize || 64;
  const bodyHeight =
    Math.max(1, estimateLineCount(bodyText, bodyFontSize, contentZone.width)) *
    bodyFontSize *
    1.5;

  const dirEl = slide.elements.find(isDirectiveTextElement);
  const dirText = dirEl?.text || dirEl?.content || "";
  const dirFontSize = config.dirTextFontSize || dirEl?.fontSize || 24;
  const dirTextHeight =
    Math.max(1, estimateLineCount(dirText, dirFontSize, contentZone.width)) * dirFontSize * 1.4;
  const dynamicDirRectHeight = Math.max(config.dirRectHeight || 120, dirTextHeight + 60);
  const dynamicDirRectY = Math.max(
    config.dirRectY || 780,
    dynamicBodyY + bodyHeight + 40 + dynamicDirRectHeight / 2
  );
  const dynamicDirTextY = dynamicDirRectY - dynamicDirRectHeight / 2 + 30;

  const textAlign = config.textAlign || "left";
  let alignX = contentZone.left;
  let originX = "left";
  if (textAlign === "center") {
    alignX = Math.round(canvasWidth / 2);
    originX = "center";
  } else if (textAlign === "right") {
    alignX = contentZone.right;
    originX = "right";
  }

  const showSlideNumbers = Boolean(config.showSlideNumbers);
  const activeElements = (slide.elements || []).filter((el) => {
    if (isBackgroundRect(el)) return false;
    if (!showSlideNumbers && isPageNumberElement(el)) return false;
    return true;
  });
  const updatedElements = activeElements.map((el) => {
    if (isChromeBadgeElement(el)) {
      return {
        ...el,
        x: config.badgeX ?? alignX,
        y: config.badgeY ?? THEME.chrome.badge.y,
        fontSize: config.badgeFontSize ?? THEME.typography.badge.fontSize,
        fontFamily: config.badgeFont || el.fontFamily || THEME.typography.badge?.fontFamily || "Playfair Display",
        fill: config.badgeColor || config.primaryColor || el.fill,
        text: config.badgeText !== undefined && config.badgeText !== "" ? config.badgeText : el.text,
        originX,
        originY: "top",
        textAlign,
      };
    }
    if (isPageNumberElement(el)) {
      return {
        ...el,
        x: config.pageNumberX ?? contentZone.right,
        y: config.pageNumberY ?? (config.badgeY ?? THEME.chrome.badge.y),
        fontSize: config.pageNumberFontSize ?? (config.badgeFontSize ?? THEME.typography.badge.fontSize),
        fontFamily: config.pageNumberFont || (config.badgeFont || el.fontFamily || THEME.typography.badge.fontFamily || "Playfair Display"),
        fill: config.pageNumberColor || "#94a3b8",
        originX: "right",
        originY: "top",
        textAlign: "right",
      };
    }
    const bottomBadgeFontSize =
      config.footerFontSize ??
      config.swipeFontSize ??
      config.watermarkFontSize ??
      THEME.typography.footer.fontSize;

    const bottomBadgeFont =
      config.footerFont ??
      config.swipeFont ??
      config.watermarkFont ??
      THEME.typography.footer.fontFamily ??
      "Georgia";

    const bottomBadgeColor =
      config.footerColor ??
      config.swipeColor ??
      config.watermarkColor ??
      THEME.colors.footer;

    if (isWatermarkElement(el)) {
      return {
        ...el,
        x: config.watermarkX ?? contentZone.x,
        y: config.watermarkY ?? THEME.chrome.swipeIndicator.y,
        fontSize: bottomBadgeFontSize,
        fontFamily: bottomBadgeFont,
        fill: bottomBadgeColor,
        fontWeight: "normal",
        fontStyle: "normal",
        originX: "left",
        originY: "top",
        textAlign: "left",
      };
    }
    if (isSwipeElement(el)) {
      const isFollow =
        isLastSlide ||
        (typeof el.text === "string" && el.text.includes("Follow"));
      return {
        ...el,
        x: isFollow
          ? (config.followX ?? contentZone.right)
          : (config.swipeX ?? contentZone.right),
        originX: isFollow ? (config.followOriginX || "right") : (config.swipeOriginX || "right"),
        originY: "top",
        y: isFollow
          ? (config.followY ?? THEME.chrome.swipeIndicator.y)
          : (config.swipeY ?? THEME.chrome.swipeIndicator.y),
        fontSize: bottomBadgeFontSize,
        fontFamily: bottomBadgeFont,
        fill: bottomBadgeColor,
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: "right",
        text: isFollow
          ? config.followText || "Follow for more →"
          : config.swipeText || "Swipe →",
      };
    }

    if (isImageElement(el)) {
      return el;
    }

    let resEl = el;
    if (isHeadlineElement(el)) {
      resEl = {
        ...el,
        x: config.headlineX ?? alignX,
        y: config.headlineY ?? headlineY,
        width: config.headlineWidth || contentZone.width,
        fontSize: headlineFontSize,
        fontFamily: config.headlineFont || el.fontFamily,
        fill: config.headlineColor || el.fill,
        originX,
        textAlign,
      };
    } else if (isBodyElement(el)) {
      resEl = {
        ...el,
        x: config.bodyX ?? alignX,
        y: dynamicBodyY,
        width: config.bodyWidth || contentZone.width,
        fontSize: bodyFontSize,
        fontFamily: config.bodyFont || el.fontFamily,
        fill: config.bodyColor || el.fill,
        originX,
        textAlign,
      };
    } else if (isDirectiveTextElement(el)) {
      resEl = {
        ...el,
        x: textAlign === "left" ? contentZone.left : alignX,
        y: dynamicDirTextY,
        width: contentZone.width,
        fontSize: dirFontSize,
        fontFamily: config.bodyFont || el.fontFamily,
        fill: config.dirTextColor || config.primaryColor || el.fill,
        originX: textAlign === "left" ? "left" : originX,
        textAlign,
      };
    } else if (isDirectiveRectElement(el)) {
      resEl = {
        ...el,
        x: Math.round(canvasWidth / 2),
        y: dynamicDirRectY,
        width: Math.min(config.dirRectWidth || 760, contentZone.width),
        height: dynamicDirRectHeight,
        fill: config.dirRectFill || el.fill,
        stroke: config.dirRectStroke || config.primaryColor || el.stroke,
        strokeWidth: config.dirRectStrokeWidth || el.strokeWidth,
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
    backgroundColor: config.bgColor || slide.backgroundColor,
    bgPattern: config.bgPattern || slide.bgPattern,
    elements: updatedElements,
  };
}


export const useCarouselStore = create((set, get) => ({
  document: initialCarousel,
  selectedElementId: null,
  zoom: 1,
  isZoomLocked: true,
  showSafeAreaGuides: false,
  snapToGuides: false,
  historyPast: [],
  historyFuture: [],
  clipboardElement: null,
  imageRegistry: {},
  globalLayoutConfig: { ...DEFAULT_GLOBAL_LAYOUT_CONFIG },
  activeTextSelection: null,
  fabricCanvas: null,
  activeContext: null,

  setPostContext: (ctx) => set({ activeContext: ctx }),
  setActiveTextSelection: (selection) => set({ activeTextSelection: selection }),
  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),

  // Register a full image snapshot in the registry (exposed for external use if needed)
  registerImage: (elementId, snapshot) =>
    set((state) => ({
      imageRegistry: { ...state.imageRegistry, [elementId]: snapshot },
    })),

  setZoom: (zoomOrFn) =>
    set((state) => {
      if (state.isZoomLocked) return {};
      const nextZoom =
        typeof zoomOrFn === "function" ? zoomOrFn(state.zoom) : zoomOrFn;
      return {
        zoom: Math.min(3, Math.max(0.2, Number(nextZoom) || 1)),
      };
    }),

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

  toggleZoomLock: () =>
    set((state) => {
      const nextLocked = !state.isZoomLocked;
      return {
        isZoomLocked: nextLocked,
        zoom: nextLocked ? 1 : state.zoom,
      };
    }),

  setZoomLocked: (locked) =>
    set((state) => ({
      isZoomLocked: Boolean(locked),
      zoom: locked ? 1 : state.zoom,
    })),

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
    let cleanedDoc = newDocument;
    if (cleanedDoc?.slides) {
      cleanedDoc = {
        ...cleanedDoc,
        slides: cleanedDoc.slides.map((s) => ({
          ...s,
          elements: (s.elements || []).filter((el) => !isBackgroundRect(el)),
        })),
      };
    }
    const baseRegistry = resetRegistry ? {} : get().imageRegistry;
    const hydrated = hydrateRegistryFromDocument(cleanedDoc, baseRegistry);
    const restored = restoreImagesFromRegistry(cleanedDoc, hydrated);
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

  goToPreviousSlide: () => {
    const state = get();
    const slides = state.document?.slides || [];
    if (slides.length <= 1) return;
    const currentIndex = slides.findIndex((s) => s.id === state.document.activeSlideId);
    if (currentIndex > 0) {
      state.setActiveSlide(slides[currentIndex - 1].id);
    }
  },

  goToNextSlide: () => {
    const state = get();
    const slides = state.document?.slides || [];
    if (slides.length <= 1) return;
    const currentIndex = slides.findIndex((s) => s.id === state.document.activeSlideId);
    if (currentIndex >= 0 && currentIndex < slides.length - 1) {
      state.setActiveSlide(slides[currentIndex + 1].id);
    }
  },

  addSlide: (insertIndex = null) =>
    set((state) => {
      const existing = state.document.slides;
      const newSlideId = `slide_${Date.now()}`;
      const badgeEl = existing[0]?.elements?.find(isChromeBadgeElement);
      const targetIndex =
        insertIndex !== null && insertIndex >= 0 && insertIndex <= existing.length
          ? insertIndex
          : existing.length;

      const composed = composeSlide([], {
        slideId: newSlideId,
        pageIndex: targetIndex + 1,
        totalPages: existing.length + 1,
        badgeText: badgeEl?.text || "SWE NOTEBOOK",
        backgroundColor: existing[0]?.backgroundColor || "#ffffff",
        accent: state.globalLayoutConfig.primaryColor || THEME.colors.accent,
        textAlign: state.document.metadata?.textAlign || "left",
      });

      const updatedSlides = [...existing];
      if (insertIndex !== null && insertIndex >= 0 && insertIndex <= existing.length) {
        updatedSlides.splice(insertIndex, 0, composed);
      } else {
        updatedSlides.push(composed);
      }

      const slides = syncChromePagination(updatedSlides);

      return {
        document: {
          ...state.document,
          slides,
          activeSlideId: newSlideId,
        },
        selectedElementId: null,
      };
    }),

  moveSlide: (slideId, direction) =>
    set((state) => {
      const slides = [...state.document.slides];
      const index = slides.findIndex((s) => s.id === slideId);
      if (index === -1) return state;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= slides.length) return state;
      const [moved] = slides.splice(index, 1);
      slides.splice(targetIndex, 0, moved);
      return {
        document: {
          ...state.document,
          slides: syncChromePagination(slides),
          activeSlideId: moved.id,
        },
        selectedElementId: null,
      };
    }),

  reorderSlides: (sourceIndex, targetIndex) =>
    set((state) => {
      const slides = [...state.document.slides];
      if (
        sourceIndex < 0 ||
        sourceIndex >= slides.length ||
        targetIndex < 0 ||
        targetIndex >= slides.length ||
        sourceIndex === targetIndex
      ) {
        return state;
      }
      const [moved] = slides.splice(sourceIndex, 1);
      slides.splice(targetIndex, 0, moved);
      return {
        document: {
          ...state.document,
          slides: syncChromePagination(slides),
          activeSlideId: moved.id,
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

  applyBgColorToAllSlides: (color) =>
    set((state) => ({
      document: {
        ...state.document,
        slides: state.document.slides.map((slide) => ({
          ...slide,
          backgroundColor: color,
        })),
      },
      globalLayoutConfig: {
        ...state.globalLayoutConfig,
        bgColor: color,
      },
    })),

  updateSlideBgPattern: (slideId, bgPattern) =>
    set((state) => ({
      document: {
        ...state.document,
        metadata: {
          ...state.document.metadata,
          bgPattern,
        },
        slides: state.document.slides.map((slide) =>
          slide.id === slideId ? { ...slide, bgPattern } : slide
        ),
      },
      globalLayoutConfig: {
        ...state.globalLayoutConfig,
        bgPattern,
      },
    })),

  applyBgPatternToAllSlides: (pattern) =>
    set((state) => ({
      document: {
        ...state.document,
        metadata: {
          ...state.document.metadata,
          bgPattern: pattern,
        },
        slides: state.document.slides.map((slide) => ({
          ...slide,
          bgPattern: pattern,
        })),
      },
      globalLayoutConfig: {
        ...state.globalLayoutConfig,
        bgPattern: pattern,
      },
    })),

  applyPaletteToAllSlides: ({ primary, accent, bg } = {}) =>
    set((state) => {
      const nextConfig = {
        ...state.globalLayoutConfig,
        primaryColor: primary || state.globalLayoutConfig.primaryColor,
        accentColor: accent || state.globalLayoutConfig.accentColor,
        bgColor: bg || state.globalLayoutConfig.bgColor,
      };

      const canvasWidth = state.document.metadata.width || 1080;
      const canvasHeight = state.document.metadata.height || 1350;

      const updatedSlides = state.document.slides.map((slide, sIdx) => {
        const slideUpdated = {
          ...slide,
          backgroundColor: bg || slide.backgroundColor,
          elements: slide.elements.map((el) => {
            const elAccent = accent || el.accentColor || nextConfig.accentColor;
            const elPrimary = primary || el.fill || nextConfig.primaryColor;
            if (isHeadlineElement(el) || isDirectiveTextElement(el)) {
              return { ...el, accentColor: elAccent, fill: elPrimary };
            }
            if (isBodyElement(el)) {
              return { ...el, fill: elPrimary };
            }
            if (isChromeBadgeElement(el) || isDirectiveRectElement(el)) {
              return { ...el, fill: elPrimary, stroke: elPrimary };
            }
            return el;
          }),
        };
        return applyConfigToSlide(slideUpdated, nextConfig, {
          isLastSlide: sIdx === state.document.slides.length - 1,
          canvasWidth,
          canvasHeight,
        });
      });

      return {
        globalLayoutConfig: nextConfig,
        document: restoreImagesFromRegistry(
          { ...state.document, slides: updatedSlides },
          state.imageRegistry
        ),
      };
    }),

  updateGlobalLayoutConfig: (updates) =>
    set((state) => {
      const nextConfig = {
        ...state.globalLayoutConfig,
        ...updates,
      };

      const { slides } = state.document;
      if (!slides || slides.length === 0) {
        return { globalLayoutConfig: nextConfig };
      }

      const canvasWidth = state.document.metadata.width || 1080;
      const canvasHeight = state.document.metadata.height || 1350;

      const updatedSlides = slides.map((slide, sIdx) =>
        applyConfigToSlide(slide, nextConfig, {
          isLastSlide: sIdx === slides.length - 1,
          canvasWidth,
          canvasHeight,
        })
      );

      const nextDoc = {
        ...state.document,
        metadata: {
          ...state.document.metadata,
          bgPattern: nextConfig.bgPattern,
        },
        slides: updatedSlides,
      };

      return {
        globalLayoutConfig: nextConfig,
        document: restoreImagesFromRegistry(nextDoc, state.imageRegistry),
      };
    }),

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

      const activeSlide = slides.find((s) => s.id === state.document.activeSlideId);
      if (activeSlide && state.activeContext?.postId) {
        debounceCanvasSave(state.activeContext.postId, activeSlide.id, {
          version: 1,
          width: state.document.metadata?.width || 1080,
          height: state.document.metadata?.height || 1350,
          aspectRatio: state.document.metadata?.aspectRatio || '4:5',
          bgPattern: activeSlide.bgPattern || 'solid',
          objects: activeSlide.elements || [],
          background: { type: 'color', value: activeSlide.backgroundColor || '#ffffff' },
        });
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

  copySelectedElement: (elementToCopy = null) => {
    const state = get();
    let target = elementToCopy;
    if (!target) {
      const { selectedElementId, document: doc } = state;
      if (!selectedElementId || !doc) return;
      for (const slide of doc.slides) {
        const el = slide.elements.find((item) => item.id === selectedElementId);
        if (el && !isChromeElement(el)) {
          target = el;
          break;
        }
      }
    }
    if (target && !isChromeElement(target)) {
      const cloned = cloneDoc(target);
      cloned._sourceSlideId = state.document.activeSlideId;
      set({ clipboardElement: cloned });

      try {
        if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(
            JSON.stringify({
              __friendly_canvas_element: true,
              element: cloned,
            })
          );
        }
      } catch (err) {
        // Ignore clipboard permission issues
      }
    }
  },

  pasteClipboardElement: (pastedImageDataUrl, pastedText, elementToPaste = null) => {
    const state = get();
    const activeSlide = state.document.slides.find(
      (s) => s.id === state.document.activeSlideId
    );
    if (!activeSlide) return;

    const canvasWidth = state.document.metadata?.width || THEME.canvas.width;
    const canvasHeight = state.document.metadata?.height || THEME.canvas.height;

    // 1. Direct or store-based element paste
    const sourceEl = elementToPaste || state.clipboardElement;
    if (!pastedImageDataUrl && !pastedText && sourceEl) {
      const cloned = cloneDoc(sourceEl);
      const isSameSlide = cloned._sourceSlideId === activeSlide.id;
      cloned.id = createElementId(cloned.type || "el");
      if (isSameSlide) {
        cloned.x = (cloned.x || 0) + 24;
        cloned.y = (cloned.y || 0) + 24;
      }
      delete cloned._sourceSlideId;
      get().addElement(cloned);
      return;
    }

    // 2. Image Data URL / Image Web URL paste
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
        const newImageId = createElementId("image");
        get().addElement({
          id: newImageId,
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

        // Compute natural aspect ratio and update dimensions if possible
        if (typeof window !== "undefined") {
          const img = new Image();
          img.onload = () => {
            const natW = img.naturalWidth || 760;
            const natH = img.naturalHeight || 480;
            const maxW = Math.min(840, canvasWidth - 120);
            const maxH = Math.min(760, canvasHeight - 280);
            let w = natW;
            let h = natH;
            if (w > maxW || h > maxH) {
              const scale = Math.min(maxW / w, maxH / h);
              w = Math.round(w * scale);
              h = Math.round(h * scale);
            }
            get().updateElement(newImageId, { width: w, height: h });
          };
          img.src = pastedImageDataUrl;
        }
      }
      return;
    }

    // 3. Fallback: if clipboardElement exists, prioritize pasting it
    if (state.clipboardElement) {
      const cloned = cloneDoc(state.clipboardElement);
      const isSameSlide = cloned._sourceSlideId === activeSlide.id;
      cloned.id = createElementId(cloned.type || "el");
      if (isSameSlide) {
        cloned.x = (cloned.x || 0) + 24;
        cloned.y = (cloned.y || 0) + 24;
      }
      delete cloned._sourceSlideId;
      get().addElement(cloned);
      return;
    }

    // 4. Text or Serialized JSON Paste
    if (pastedText) {
      const trimmed = pastedText.trim();
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && parsed.__friendly_canvas_element && parsed.element) {
          const cloned = cloneDoc(parsed.element);
          cloned.id = createElementId(cloned.type || "el");
          delete cloned._sourceSlideId;
          get().addElement(cloned);
          return;
        }
      } catch {}

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
