import { THEME } from "./theme";
import { buildChrome } from "./chrome";

/**
 * Calculates safe content bounds respecting THEME.contentZone + paddings
 */
export function getContentZoneBounds() {
  const { contentZone } = THEME;
  const startX = contentZone.left + contentZone.paddingLeft; // 200
  const endX = contentZone.right - contentZone.paddingRight; // 880
  const width = endX - startX; // 680

  const startY = contentZone.top + contentZone.paddingTop; // 340
  const endY = contentZone.bottom - contentZone.paddingBottom; // 1040
  const height = endY - startY; // 700

  return { startX, endX, width, startY, endY, height };
}

/**
 * Rough character-width heuristic for wrap estimation.
 * Good enough for layout purposes — doesn't need to be pixel-perfect,
 * just needs to correctly predict 1-line vs 2-line vs 3-line headlines.
 */
const AVG_CHAR_WIDTH_RATIO = 0.55; // avg glyph width ≈ 0.55 * fontSize for most sans/serif faces

function estimateLineCount(text = "", fontSize = 44, maxWidth = 680) {
  if (!text) return 1;

  const avgCharWidth = fontSize * AVG_CHAR_WIDTH_RATIO;
  const charsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));

  // Respect explicit newlines, then wrap each segment by estimated char count
  const explicitLines = text.split("\n");
  let totalLines = 0;

  for (const line of explicitLines) {
    const words = line.split(" ").filter(Boolean);
    let currentLineLength = 0;
    let linesForSegment = words.length ? 1 : 1;

    for (const word of words) {
      const wordLength = word.length + 1; // +1 for the space
      if (currentLineLength + wordLength > charsPerLine) {
        linesForSegment += 1;
        currentLineLength = wordLength;
      } else {
        currentLineLength += wordLength;
      }
    }
    totalLines += linesForSegment;
  }

  return Math.max(1, totalLines);
}

function estimateTextBlockHeight(text, fontSize, lineHeightRatio, maxWidth) {
  const lines = estimateLineCount(text, fontSize, maxWidth);
  return lines * fontSize * lineHeightRatio;
}

/**
 * Auto-positions layout elements (headline, text/body, directive/badge)
 * inside safe contentZone bounds.
 *
 * Body/directive Y positions are now derived from the headline's actual
 * wrapped height instead of a fixed constant, so multi-line headlines no
 * longer collide with the body copy underneath them.
 *
 * @param {Array} elements - Input slide elements
 * @returns {Array} Position-normalized elements
 */
export function autoLayoutContent(elements = []) {
  const HEADLINE_X = 187;
  const HEADLINE_Y = 273;
  const HEADLINE_MAX_WIDTH = 680; // matches contentZone width
  const HEADLINE_LINE_HEIGHT_RATIO = 1.2;
  const HEADLINE_TO_BODY_GAP = 40; // breathing room below the last headline line

  const BODY_X = 179;
  const BODY_MAX_WIDTH = 680;
  const BODY_LINE_HEIGHT_RATIO = 1.6;
  const BODY_TO_DIRECTIVE_GAP = 60;

  const DIRECTIVE_RECT_X = 544;
  const DIRECTIVE_RECT_MIN_Y = 700; // never let the visual box climb above this

  // Pass 1: find the headline (if any) among the elements so we can compute
  // how tall it will actually render.
  const headlineEl = elements.find(
    (el) => el.type === "headline" || el.id?.includes("head") || el.id?.includes("title")
  );
  const headlineFontSize =
    headlineEl?.fontSize || headlineEl?.font?.size || THEME.typography?.headline?.fontSize || 44;
  const headlineText = headlineEl?.text || headlineEl?.content || "";

  const headlineHeight = estimateTextBlockHeight(
    headlineText,
    headlineFontSize,
    HEADLINE_LINE_HEIGHT_RATIO,
    HEADLINE_MAX_WIDTH
  );

  const bodyY = HEADLINE_Y + headlineHeight + HEADLINE_TO_BODY_GAP;

  // Pass 2: find the body so we can compute where the directive box should start.
  const bodyEl = elements.find(
    (el) =>
      (el.type === "text" && !el.text?.includes("Visual:") && !el.id?.includes("dir")) ||
      el.id?.includes("body")
  );
  const bodyFontSize = bodyEl?.fontSize || bodyEl?.font?.size || THEME.typography?.body?.fontSize || 30;
  const bodyText = bodyEl?.text || bodyEl?.content || "";

  const bodyHeight = estimateTextBlockHeight(
    bodyText,
    bodyFontSize,
    BODY_LINE_HEIGHT_RATIO,
    BODY_MAX_WIDTH
  );

  const dirTextEl = elements.find(
    (el) =>
      (el.type === "text" && el.text?.includes("Visual:")) ||
      el.id?.includes("dir_text") ||
      el.id?.includes("directive_text")
  );
  const dirText = dirTextEl?.text || dirTextEl?.content || "";
  const dirFontSize = dirTextEl?.fontSize || dirTextEl?.font?.size || 24;
  const dirTextHeight = estimateTextBlockHeight(dirText, dirFontSize, 1.4, 700);
  const directiveRectHeight = Math.max(100, dirTextHeight + 60);

  const directiveY = Math.max(
    DIRECTIVE_RECT_MIN_Y,
    bodyY + bodyHeight + BODY_TO_DIRECTIVE_GAP + directiveRectHeight / 2
  );
  const directiveTextY = directiveY - directiveRectHeight / 2 + 30;

  return elements.map((el) => {
    const updated = { ...el };

    if (!updated.text && updated.content) {
      updated.text = updated.content;
    }

    const isHeadline = updated.type === "headline" || updated.id?.includes("head") || updated.id?.includes("title");
    const isDirectiveText =
      (updated.type === "text" && updated.text?.includes("Visual:")) ||
      updated.id?.includes("dir_text") ||
      updated.id?.includes("directive_text");
    const isBody =
      (updated.type === "text" && !isHeadline && !isDirectiveText) || updated.id?.includes("body");
    const isDirectiveRect =
      updated.type === "badge" ||
      updated.id?.includes("dir") ||
      (updated.type === "rect" && !updated.id?.includes("_bg"));

    if (isHeadline) {
      updated.x = HEADLINE_X;
      updated.y = HEADLINE_Y;
      if (!updated.fontSize && updated.font?.size) updated.fontSize = updated.font.size;
      updated.fontSize = updated.fontSize || 44;
      if (!updated.fontFamily && updated.font?.family) updated.fontFamily = updated.font.family;
      updated.fontFamily = updated.fontFamily || "Inter";
      if (!updated.fill && updated.font?.color) updated.fill = updated.font.color;
      updated.fill = updated.fill || "#0f172a";
      updated.textAlign = updated.align || updated.textAlign || "left";
    } else if (isBody) {
      updated.x = BODY_X;
      updated.y = bodyY; // <-- now dynamic, derived from headline height
      if (!updated.fontSize && updated.font?.size) updated.fontSize = updated.font.size;
      updated.fontSize = updated.fontSize || 30;
      if (!updated.fontFamily && updated.font?.family) updated.fontFamily = updated.font.family;
      updated.fontFamily = updated.fontFamily || "Inter";
      if (!updated.fill && updated.font?.color) updated.fill = updated.font.color;
      updated.fill = updated.fill || "#475569";
      updated.textAlign = updated.align || updated.textAlign || "left";
    } else if (isDirectiveText) {
      updated.x = 200;
      updated.y = directiveTextY; // <-- now dynamic too
      if (!updated.fontSize && updated.font?.size) updated.fontSize = updated.font.size;
      updated.fontSize = updated.fontSize || 24;
      if (!updated.fontFamily && updated.font?.family) updated.fontFamily = updated.font.family;
      updated.fontFamily = updated.fontFamily || "Inter";
      if (!updated.fill && updated.font?.color) updated.fill = updated.font.color;
      updated.fill = updated.fill || "#8e5c29";
      updated.textAlign = updated.align || updated.textAlign || "left";
    } else if (isDirectiveRect) {
      updated.x = DIRECTIVE_RECT_X;
      updated.y = directiveY; // <-- now dynamic too
      updated.height = directiveRectHeight;
      updated.originX = "center";
      updated.originY = "center";
      updated.fill = updated.backgroundColor || updated.fill || "#eff6ff";
      updated.stroke = updated.borderColor || updated.stroke || "#8e5c29";
      updated.strokeWidth = updated.strokeWidth || 2;
    }

    // Optional per-slide positionOverride escape hatch
    if (updated.positionOverride) {
      if (updated.positionOverride.x !== undefined) updated.x = updated.positionOverride.x;
      if (updated.positionOverride.y !== undefined) updated.y = updated.positionOverride.y;
      if (updated.positionOverride.width !== undefined) updated.width = updated.positionOverride.width;
      if (updated.positionOverride.height !== undefined) updated.height = updated.positionOverride.height;
    }

    return updated;
  });
}

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
 * @param {boolean} [options.autoLayout] - Whether to apply auto-layout bounds normalization (default: true)
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
    autoLayout = true,
  } = {}
) {
  let elements = autoLayout ? autoLayoutContent(contentElements) : [...contentElements];

  const hasBg = elements.some((el) => el.id.includes("_bg") || el.id === "rect_bg");
  if (!hasBg) {
    elements.unshift({
      id: `rect_${slideId}_bg`,
      type: "rect",
      x: 540,
      y: 678,
      width: THEME.safeArea.width,
      height: THEME.safeArea.height,
      originX: "center",
      originY: "center",
      fill: THEME.colors.cardBg,
      stroke: THEME.colors.cardBorder,
      strokeWidth: 2,
      rotation: 0,
      zIndex: 1,
    });
  }

  const nonChromeElements = elements.filter(
    (el) => !el.isChrome && !el.id.startsWith("chrome_")
  );

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