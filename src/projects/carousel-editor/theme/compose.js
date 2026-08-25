import { THEME } from "./theme";
import { buildChrome } from "./chrome";

/**
 * Composes content elements with theme chrome layer elements at render time
 *
 * @param {Array} contentElements - Layout-specific content elements inside contentZone
 * @param {Object} options
 * @param {string} [options.badgeText] - Badge header text
 * @param {number} [options.pageIndex] - Active slide index
 * @param {number} [options.totalPages] - Total number of slides
 * @param {string} [options.accent] - Theme accent color
 * @param {string} [options.slideId] - Slide ID
 * @param {string} [options.backgroundColor] - Slide background color
 */
export function composeSlide(
  contentElements = [],
  {
    badgeText = "SWE NOTEBOOK",
    pageIndex = 1,
    totalPages = 1,
    accent = THEME.colors.accent,
    slideId = "slide_1",
    backgroundColor = "#ffffff",
  } = {}
) {
  let elements = [...contentElements];

  // 1. Ensure standard background card frame sits in safeArea
  const hasBg = elements.some((el) => el.id.includes("_bg") || el.id === "rect_bg");
  if (!hasBg) {
    elements.unshift({
      id: `rect_${slideId}_bg`,
      type: "rect",
      x: THEME.safeArea.x,
      y: THEME.safeArea.y,
      width: THEME.safeArea.width,
      height: THEME.safeArea.height,
      fill: THEME.colors.cardBg,
      stroke: THEME.colors.cardBorder,
      strokeWidth: 2,
      rotation: 0,
      zIndex: 1,
    });
  }

  // 2. Remove any previous chrome elements to prevent duplicates
  const nonChromeElements = elements.filter(
    (el) => !el.isChrome && !el.id.startsWith("chrome_")
  );

  // 3. Build fresh chrome layer
  const chromeElements = buildChrome({
    badgeText,
    pageIndex,
    totalPages,
    accent,
  });

  return {
    id: slideId,
    backgroundColor,
    elements: [...nonChromeElements, ...chromeElements],
  };
}
