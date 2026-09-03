import { THEME } from "./theme";
import { buildChrome } from "./chrome";
import {
  isChromeElement,
  isImageElement,
  isHeadlineElement,
  isBodyElement,
  isDirectiveTextElement,
  isDirectiveRectElement,
  isBackgroundRect,
} from "./elementClassify";
import { wrapTextToLines } from "../canvas/textAnnotations";

/**
 * Calculates safe content bounds respecting THEME.contentZone + paddings
 */
export function getContentZoneBounds() {
  const { contentZone } = THEME;
  const startX = contentZone.left + contentZone.paddingLeft;
  const endX = contentZone.right - contentZone.paddingRight;
  const width = endX - startX;

  const startY = contentZone.top + contentZone.paddingTop;
  const endY = contentZone.bottom - contentZone.paddingBottom;
  const height = endY - startY;

  return { startX, endX, width, startY, endY, height };
}

const AVG_CHAR_WIDTH_RATIO = 0.44;

function estimateLineCount(text = "", fontSize = 44, maxWidth = 680) {
  if (!text) return 1;

  const avgCharWidth = fontSize * AVG_CHAR_WIDTH_RATIO;
  const charsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));

  const explicitLines = text.split("\n");
  let totalLines = 0;

  for (const line of explicitLines) {
    const words = line.split(" ").filter(Boolean);
    let currentLineLength = 0;
    let linesForSegment = words.length ? 1 : 1;

    for (const word of words) {
      const wordLength = word.length + 1;
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
 */
export function autoLayoutContent(elements = []) {
  const HEADLINE_X = THEME.contentZone.x;
  const HEADLINE_Y = THEME.contentZone.y;
  const HEADLINE_MAX_WIDTH = THEME.contentZone.width;

  const BODY_X = THEME.contentZone.x;
  const BODY_MAX_WIDTH = THEME.contentZone.width;
  const BODY_LINE_HEIGHT_RATIO = 1.6;
  const BODY_TO_DIRECTIVE_GAP = 50;

  const DIRECTIVE_RECT_X = THEME.canvas.width / 2;
  const DIRECTIVE_RECT_MIN_Y = 700;

  const headlineEl = elements.find(isHeadlineElement);
  const headlineFontSize =
    headlineEl?.fontSize ||
    headlineEl?.font?.size ||
    THEME.typography?.headline?.fontSize ||
    92;
  const headlineText = headlineEl?.text || headlineEl?.content || "";

  const headlineLines = wrapTextToLines(headlineText, headlineFontSize, HEADLINE_MAX_WIDTH).length || 1;
  const headlineHeight = headlineLines * headlineFontSize * 1.15;
  const bodyY = Math.round(HEADLINE_Y + headlineHeight + 28);

  const bodyEl = elements.find(isBodyElement);
  const bodyFontSize =
    bodyEl?.fontSize || bodyEl?.font?.size || THEME.typography?.body?.fontSize || 64;
  const bodyText = bodyEl?.text || bodyEl?.content || "";

  const bodyHeight = estimateTextBlockHeight(
    bodyText,
    bodyFontSize,
    BODY_LINE_HEIGHT_RATIO,
    BODY_MAX_WIDTH
  );

  const dirTextEl = elements.find(isDirectiveTextElement);
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
    if (isChromeElement(el) || isImageElement(el)) {
      return el;
    }

    const updated = { ...el };

    if (!updated.text && updated.content) {
      updated.text = updated.content;
    }

    if (isHeadlineElement(updated)) {
      updated.x = HEADLINE_X;
      updated.y = HEADLINE_Y;
      updated.width = HEADLINE_MAX_WIDTH; // Enforce 800px Content Zone wrap boundary
      if (!updated.fontSize && updated.font?.size) updated.fontSize = updated.font.size;
      updated.fontSize = updated.fontSize || 92;
      if (!updated.fontFamily && updated.font?.family) {
        updated.fontFamily = updated.font.family;
      }
      updated.fontFamily = updated.fontFamily || THEME.typography.headline.fontFamily || "Instrument Serif";
      if (!updated.fill && updated.font?.color) updated.fill = updated.font.color;
      updated.fill = updated.fill || THEME.colors.textPrimary;
      updated.textAlign = updated.align || updated.textAlign || "left";
    } else if (isBodyElement(updated)) {
      updated.x = BODY_X;
      updated.y = bodyY;
      if (!updated.fontSize && updated.font?.size) updated.fontSize = updated.font.size;
      updated.fontSize = updated.fontSize || 64;
      if (!updated.fontFamily && updated.font?.family) {
        updated.fontFamily = updated.font.family;
      }
      updated.fontFamily = updated.fontFamily || THEME.typography.body.fontFamily || "Georgia";
      if (!updated.fill && updated.font?.color) updated.fill = updated.font.color;
      updated.fill = updated.fill || THEME.colors.textSecondary;
      updated.textAlign = updated.align || updated.textAlign || "left";
    } else if (isDirectiveTextElement(updated)) {
      updated.x = THEME.contentZone.left + THEME.contentZone.paddingLeft;
      updated.y = directiveTextY;
      if (!updated.fontSize && updated.font?.size) updated.fontSize = updated.font.size;
      updated.fontSize = updated.fontSize || 24;
      if (!updated.fontFamily && updated.font?.family) {
        updated.fontFamily = updated.font.family;
      }
      updated.fontFamily = updated.fontFamily || "Georgia";
      if (!updated.fill && updated.font?.color) updated.fill = updated.font.color;
      updated.fill = updated.fill || "#8e5c29";
      updated.textAlign = updated.align || updated.textAlign || "left";
    } else if (isDirectiveRectElement(updated)) {
      updated.x = DIRECTIVE_RECT_X;
      updated.y = directiveY;
      updated.height = directiveRectHeight;
      updated.originX = "center";
      updated.originY = "center";
      updated.fill = updated.backgroundColor || updated.fill || "#eff6ff";
      updated.stroke = updated.borderColor || updated.stroke || "#8e5c29";
      updated.strokeWidth = updated.strokeWidth || 2;
    }

    if (updated.positionOverride) {
      if (updated.positionOverride.x !== undefined) updated.x = updated.positionOverride.x;
      if (updated.positionOverride.y !== undefined) updated.y = updated.positionOverride.y;
      if (updated.positionOverride.width !== undefined) {
        updated.width = updated.positionOverride.width;
      }
      if (updated.positionOverride.height !== undefined) {
        updated.height = updated.positionOverride.height;
      }
    }

    return updated;
  });
}

/**
 * Composes content elements with theme chrome layer elements at render time
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
    textAlign = "left",
    watermarkBadge,
  } = {}
) {
  let elements = autoLayout ? autoLayoutContent(contentElements) : [...contentElements];

  // Remove any default background rect elements completely
  elements = elements.filter((el) => !isBackgroundRect(el));

  const nonChromeElements = elements.filter((el) => !isChromeElement(el));

  const chromeElements = buildChrome({
    badgeText,
    pageIndex,
    totalPages,
    accent,
    textAlign,
    slideId,
    watermarkBadge,
  });

  return {
    id: slideId,
    backgroundColor,
    elements: [...nonChromeElements, ...chromeElements],
  };
}
