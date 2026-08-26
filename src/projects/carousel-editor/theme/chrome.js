import { THEME } from "./theme";

/**
 * Builds standard chrome identity elements (Badge, Page Number, Swipe Indicator)
 *
 * @param {Object} params
 * @param {string} params.badgeText - Recurring category / slide badge text
 * @param {number} params.pageIndex - Active slide index (1-based)
 * @param {number} params.totalPages - Total slides count
 * @param {string} [params.accent] - Theme accent color for badge
 * @param {string} [params.textAlign] - Text alignment ('left' | 'center' | 'right')
 */
export function buildChrome({
  badgeText = "SWE NOTEBOOK",
  pageIndex = 1,
  totalPages = 1,
  accent = THEME.colors.accent,
  textAlign = "left",
}) {
  let badgeX = 140;
  let badgeOriginX = "left";
  if (textAlign === "center") {
    badgeX = 540;
    badgeOriginX = "center";
  } else if (textAlign === "right") {
    badgeX = 940;
    badgeOriginX = "right";
  }

  return [
    {
      id: `chrome_badge`,
      type: "text",
      x: badgeX,
      y: THEME.chrome.badge.y,
      text: badgeText,
      fontSize: THEME.typography.badge.fontSize,
      fontFamily: THEME.typography.badge.fontFamily,
      fill: accent,
      originX: badgeOriginX,
      textAlign: textAlign,
      rotation: 0,
      zIndex: 100,
      isChrome: true,
    },
    {
      id: `chrome_page_number`,
      type: "text",
      x: THEME.chrome.pageNumber.x,
      y: THEME.chrome.pageNumber.y,
      text: `${pageIndex}/${totalPages}`,
      fontSize: THEME.typography.footer.fontSize,
      fontFamily: THEME.typography.footer.fontFamily,
      fill: THEME.colors.footer,
      originX: "left",
      textAlign: "left",
      rotation: 0,
      zIndex: 100,
      isChrome: true,
    },
    {
      id: `chrome_swipe`,
      type: "text",
      x: THEME.chrome.swipeIndicator.x,
      y: THEME.chrome.swipeIndicator.y,
      text: pageIndex < totalPages ? "Swipe →" : "Follow for more →",
      fontSize: THEME.typography.footer.fontSize,
      fontFamily: THEME.typography.footer.fontFamily,
      fill: THEME.colors.footer,
      originX: "right",
      textAlign: "right",
      rotation: 0,
      zIndex: 100,
      isChrome: true,
    },
  ];
}
