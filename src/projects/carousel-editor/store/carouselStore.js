import { create } from "zustand";
import { initialCarousel } from "../data/initialCarousel";
import { THEME } from "../theme/theme";

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
  zoom: 1, // 1 = 100% Fit to Screen
  showSafeAreaGuides: false,
  snapToGuides: true,
  toggleSnapToGuides: () =>
    set((state) => ({ snapToGuides: !state.snapToGuides })),
  historyPast: [],
  historyFuture: [],

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

  // History & Undo / Redo Actions
  pushHistory: () => {
    const currentDoc = get().document;
    if (!currentDoc) return;
    const past = get().historyPast;
    set({
      historyPast: [...past.slice(-30), JSON.parse(JSON.stringify(currentDoc))],
      historyFuture: [],
    });
  },

  undo: () => {
    const past = get().historyPast;
    if (past.length === 0) return;
    const previousDoc = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const currentDoc = get().document;
    const registry = get().imageRegistry;

    set({
      document: restoreImagesFromRegistry(previousDoc, registry),
      historyPast: newPast,
      historyFuture: [JSON.parse(JSON.stringify(currentDoc)), ...get().historyFuture],
      selectedElementId: null,
    });
  },

  redo: () => {
    const future = get().historyFuture;
    if (future.length === 0) return;
    const nextDoc = future[0];
    const newFuture = future.slice(1);
    const currentDoc = get().document;
    const registry = get().imageRegistry;

    set({
      document: restoreImagesFromRegistry(nextDoc, registry),
      historyPast: [...get().historyPast, JSON.parse(JSON.stringify(currentDoc))],
      historyFuture: newFuture,
      selectedElementId: null,
    });
  },

  // Document actions
  setDocument: (newDocument) => {
    get().pushHistory();
    const registry = get().imageRegistry;
    set({
      document: restoreImagesFromRegistry(newDocument, registry),
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
      imageRegistry: {}, // Clear uploaded image registry on full reset
    }),

  // Slide actions
  setActiveSlide: (slideId) =>
    set((state) => {
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
        document: {
          ...state.document,
          activeSlideId: slideId,
        },
        selectedElementId: null,
      };
    }),

  addSlide: () =>
    set((state) => {
      const newSlideId = `slide_${Date.now()}`;
      const newSlide = {
        id: newSlideId,
        backgroundColor: "#ffffff",
        elements: [],
      };
      return {
        document: {
          ...state.document,
          slides: [...state.document.slides, newSlide],
          activeSlideId: newSlideId,
        },
        selectedElementId: null,
      };
    }),

  duplicateSlide: (slideId) =>
    set((state) => {
      const slideToDuplicate = state.document.slides.find(
        (s) => s.id === slideId
      );
      if (!slideToDuplicate) return state;

      const newSlideId = `slide_${Date.now()}`;
      const duplicatedSlide = {
        ...slideToDuplicate,
        id: newSlideId,
        elements: slideToDuplicate.elements.map((el) => ({
          ...el,
          id: `${el.type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        })),
      };

      const index = state.document.slides.findIndex((s) => s.id === slideId);
      const updatedSlides = [...state.document.slides];
      updatedSlides.splice(index + 1, 0, duplicatedSlide);

      return {
        document: {
          ...state.document,
          slides: updatedSlides,
          activeSlideId: newSlideId,
        },
        selectedElementId: null,
      };
    }),

  deleteSlide: (slideId) =>
    set((state) => {
      const filteredSlides = state.document.slides.filter(
        (s) => s.id !== slideId
      );
      if (filteredSlides.length === 0) return state;

      const nextActiveId =
        state.document.activeSlideId === slideId
          ? filteredSlides[0].id
          : state.document.activeSlideId;

      return {
        document: {
          ...state.document,
          slides: filteredSlides,
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
          slide.id === slideId
            ? { ...slide, backgroundColor: color }
            : slide
        ),
      },
    })),

  // Element actions
  addElement: (element) => {
    get().pushHistory();
    set((state) => {
      const { activeSlideId, slides } = state.document;
      // Persist full image snapshot (src + geometry) in registry when an image is added
      const newRegistry =
        element.type === "image" && element.src
          ? { ...state.imageRegistry, [element.id]: pickImageSnapshot(element) }
          : state.imageRegistry;
      return {
        imageRegistry: newRegistry,
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
                    zIndex: slide.elements.length + 1,
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
        document: {
          ...state.document,
          slides: slides.map((slide) => {
            if (slide.id !== activeSlideId) return slide;
            return {
              ...slide,
              elements: slide.elements.map((el) =>
                el.id === id ? { ...el, ...updates } : el
              ),
            };
          }),
        },
      };
    }),

  deleteElement: (id) => {
    get().pushHistory();
    set((state) => {
      const { activeSlideId, slides } = state.document;
      return {
        document: {
          ...state.document,
          slides: slides.map((slide) => {
            if (slide.id !== activeSlideId) return slide;
            return {
              ...slide,
              elements: slide.elements.filter((el) => el.id !== id),
            };
          }),
        },
        selectedElementId: null,
      };
    });
  },

  // Selection & Viewport
  selectElement: (id) => set({ selectedElementId: id }),
  setZoom: (zoom) => set({ zoom }),

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

  setGlobalLayoutConfig: (configUpdates) =>
    set((state) => ({
      globalLayoutConfig: { ...state.globalLayoutConfig, ...configUpdates },
    })),

  applyGlobalLayoutConfigToAllSlides: (customConfig = null) =>
    set((state) => {
      const config = customConfig || state.globalLayoutConfig;
      const { slides } = state.document;
      if (!slides || slides.length === 0) return state;

      let canvasWidth = 1080;
      let canvasHeight = 1350;
      if (config.aspectRatio === "1:1") {
        canvasWidth = 1080;
        canvasHeight = 1080;
      } else if (config.aspectRatio === "9:16") {
        canvasWidth = 1080;
        canvasHeight = 1920;
      } else if (config.aspectRatio === "16:9") {
        canvasWidth = 1920;
        canvasHeight = 1080;
      }

      // Dynamically update THEME bounds for guide overlays
      const saTop = config.safeAreaMarginTop ?? 80;
      const saBottom = config.safeAreaMarginBottom ?? 80;
      const saLeft = config.safeAreaMarginLeft ?? 80;
      const saRight = config.safeAreaMarginRight ?? 80;

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
          bgPattern: config.bgPattern,
          elements: updatedElements,
        };
      });

      const registry = state.imageRegistry;
      const slidesWithImages = restoreImagesFromRegistry(
        { ...state.document, slides: updatedSlides },
        registry
      ).slides;

      return {
        globalLayoutConfig: config,
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
      };
    }),
}));
