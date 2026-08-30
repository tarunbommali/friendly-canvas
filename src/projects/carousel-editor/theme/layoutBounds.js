import { THEME } from "./theme";

export const ASPECT_RATIO_DIMENSIONS = {
  "4:5": { width: 1080, height: 1350 },
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
};

export function getCanvasDimensions(aspectRatio = "4:5", metadata = {}) {
  const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];
  if (dims) {
    return { width: dims.width, height: dims.height };
  }
  return {
    width: metadata.width || THEME.canvas.width,
    height: metadata.height || THEME.canvas.height,
  };
}

/**
 * Derive safe-area and content-zone bounds from global layout config + metadata.
 * Never mutates THEME.
 */
export function getLayoutBounds(config = {}, metadata = {}) {
  const aspectRatio =
    config.aspectRatio || metadata.aspectRatio || THEME.canvas.aspectRatio;
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(
    aspectRatio,
    metadata
  );

  const saTop = config.safeAreaMarginTop ?? THEME.safeArea.top;
  const saBottom = config.safeAreaMarginBottom ?? THEME.safeArea.bottom;
  const saLeft = config.safeAreaMarginLeft ?? THEME.safeArea.left;
  const saRight = config.safeAreaMarginRight ?? THEME.safeArea.right;
  const padLeft = config.contentPaddingLeft ?? THEME.contentZone.paddingLeft;
  const padRight = config.contentPaddingRight ?? THEME.contentZone.paddingRight;
  const contentTop = config.contentTopClearance ?? THEME.contentZone.top;
  const contentBottom = config.contentBottomClearance ?? THEME.contentZone.bottom;

  const safeWidth = canvasWidth - saLeft - saRight;
  const safeHeight = canvasHeight - saTop - saBottom;

  return {
    canvas: {
      width: canvasWidth,
      height: canvasHeight,
      aspectRatio,
    },
    safeArea: {
      x: saLeft,
      y: saTop,
      top: saTop,
      bottom: saBottom,
      left: saLeft,
      right: saRight,
      width: safeWidth,
      height: safeHeight,
    },
    contentZone: {
      x: saLeft + padLeft,
      y: contentTop,
      top: contentTop,
      bottom: contentBottom,
      left: saLeft + padLeft,
      right: canvasWidth - saRight - padRight,
      paddingTop: THEME.contentZone.paddingTop,
      paddingBottom: THEME.contentZone.paddingBottom,
      paddingLeft: padLeft,
      paddingRight: padRight,
      width: Math.max(0, canvasWidth - saLeft * 2 - padLeft * 2),
      height: Math.max(0, contentBottom - contentTop),
    },
  };
}
