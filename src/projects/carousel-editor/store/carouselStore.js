import { create } from "zustand";
import { initialCarousel } from "../data/initialCarousel";

export const useCarouselStore = create((set, get) => ({
  document: initialCarousel,
  selectedElementId: null,
  zoom: 1, // 1 = 100% Fit to Screen


  // Document actions
  setDocument: (newDocument) =>
    set({
      document: newDocument,
      selectedElementId: null,
    }),

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
    }),

  // Slide actions
  setActiveSlide: (slideId) =>
    set((state) => ({
      document: {
        ...state.document,
        activeSlideId: slideId,
      },
      selectedElementId: null,
    })),

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
  addElement: (element) =>
    set((state) => {
      const { activeSlideId, slides } = state.document;
      return {
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
    }),

  updateElement: (id, updates) =>
    set((state) => {
      const { activeSlideId, slides } = state.document;
      return {
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

  deleteElement: (id) =>
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
    }),

  // Selection & Viewport
  selectElement: (id) => set({ selectedElementId: id }),
  setZoom: (zoom) => set({ zoom }),
}));
