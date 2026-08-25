import { THEME } from "../theme/theme";
import { composeSlide } from "../theme/compose";

const slide1 = composeSlide(
  [
    {
      id: "text_01",
      type: "text",
      x: THEME.contentZone.x,
      y: THEME.contentZone.y,
      text: "5 Principles of Great Code",
      fontSize: THEME.typography.headline.fontSize,
      fontFamily: THEME.typography.headline.fontFamily,
      fill: THEME.colors.textPrimary,
      rotation: 0,
      zIndex: 2,
    },
    {
      id: "text_02",
      type: "text",
      x: THEME.contentZone.x,
      y: THEME.contentZone.y + 180,
      text: "Crafting maintainable, resilient software architecture.",
      fontSize: THEME.typography.body.fontSize,
      fontFamily: THEME.typography.body.fontFamily,
      fill: THEME.colors.textSecondary,
      rotation: 0,
      zIndex: 3,
    },
  ],
  {
    badgeText: "SWE NOTEBOOK",
    pageIndex: 1,
    totalPages: 2,
    slideId: "slide_1",
  }
);

const slide2 = composeSlide(
  [
    {
      id: "text_03",
      type: "text",
      x: THEME.contentZone.x,
      y: THEME.contentZone.y,
      text: "1. Single Responsibility",
      fontSize: THEME.typography.headline.fontSize,
      fontFamily: THEME.typography.headline.fontFamily,
      fill: "#2563eb",
      rotation: 0,
      zIndex: 2,
    },
    {
      id: "text_04",
      type: "text",
      x: THEME.contentZone.x,
      y: THEME.contentZone.y + 130,
      text: "Each module should do one thing, and do it well.",
      fontSize: THEME.typography.body.fontSize,
      fontFamily: THEME.typography.body.fontFamily,
      fill: THEME.colors.textSecondary,
      rotation: 0,
      zIndex: 3,
    },
    {
      id: "circle_01",
      type: "circle",
      x: 420,
      y: THEME.contentZone.y + 360,
      radius: 120,
      fill: "#dbeafe",
      stroke: "#2563eb",
      strokeWidth: 3,
      rotation: 0,
      zIndex: 4,
    },
  ],
  {
    badgeText: "SWE NOTEBOOK",
    pageIndex: 2,
    totalPages: 2,
    slideId: "slide_2",
  }
);

export const initialCarousel = {
  schemaVersion: 1,
  metadata: {
    title: "New Carousel Design",
    width: THEME.canvas.width,
    height: THEME.canvas.height,
    aspectRatio: "4:5",
  },
  activeSlideId: "slide_1",
  slides: [slide1, slide2],
};
