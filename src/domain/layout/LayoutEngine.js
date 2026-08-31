import { globalCacheManager } from '../../platform/cache/CacheManager.js';

/**
 * Standard content zone constraints for 1080x1350 Instagram Carousel Canvas.
 */
export const DEFAULT_CANVAS_BOUNDS = {
  width: 1080,
  height: 1350,
  contentZone: {
    x: 140,
    y: 210,
    width: 800,
    maxHeight: 980,
    bottomLimit: 1190,
  },
};

const AVG_CHAR_WIDTH_RATIO = 0.46;

/**
 * Pure Mathematical Dynamic Layout Engine.
 * Computes cascading element geometries, line wrapping, and safe-zone flow
 * with LRU caching and zero direct DOM/Fabric coupling.
 */
export class LayoutEngine {
  /**
   * @param {Object} [options]
   * @param {import('../../platform/cache/CacheManager.js').CacheManager} [options.cacheManager]
   */
  constructor(options = {}) {
    this.cacheManager = options.cacheManager || globalCacheManager;
  }

  /**
   * Generates a deterministic cache key based on slide element content & styles
   * @param {Object} slide
   * @param {Object} [theme]
   * @returns {string}
   */
  static generateLayoutHash(slide, theme = {}) {
    const elSummaries = (slide.elements || []).map(
      (el) => `${el.id}:${el.type}:${el.content || el.text || ''}:${el.fontSize || 0}:${el.align || 'left'}`
    );
    return `slide_${slide.id || 'temp'}_${elSummaries.join('|')}_${theme.id || 'default'}`;
  }

  /**
   * Estimate line count for wrapped text
   * @param {string} text
   * @param {number} fontSize
   * @param {number} maxWidth
   * @returns {number}
   */
  estimateLineCount(text = '', fontSize = 44, maxWidth = 800) {
    if (!text || typeof text !== 'string') return 1;

    const avgCharWidth = fontSize * AVG_CHAR_WIDTH_RATIO;
    const charsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));
    const lines = text.split('\n');
    let totalLines = 0;

    for (const line of lines) {
      const words = line.split(' ').filter(Boolean);
      if (words.length === 0) {
        totalLines += 1;
        continue;
      }

      let currentLineLength = 0;
      let lineCount = 1;

      for (const word of words) {
        const wordLen = word.length + 1;
        if (currentLineLength + wordLen > charsPerLine) {
          lineCount += 1;
          currentLineLength = wordLen;
        } else {
          currentLineLength += wordLen;
        }
      }
      totalLines += lineCount;
    }

    return Math.max(1, totalLines);
  }

  /**
   * Estimate bounding block height for text elements
   * @param {string} text
   * @param {number} fontSize
   * @param {number} lineHeightRatio
   * @param {number} maxWidth
   * @returns {number}
   */
  estimateTextBlockHeight(text, fontSize, lineHeightRatio = 1.3, maxWidth = 800) {
    const lines = this.estimateLineCount(text, fontSize, maxWidth);
    return Math.round(lines * fontSize * lineHeightRatio);
  }

  /**
   * Compute flow positions for slide elements
   * @param {Object} slide
   * @param {Object} [theme]
   * @param {Object} [bounds]
   * @returns {Object} Computed layout with positioned elements and bounding boxes
   */
  computeSlideLayout(slide, theme = {}, bounds = DEFAULT_CANVAS_BOUNDS) {
    if (!slide) throw new Error('Slide model is required for layout computation');

    const cacheKey = LayoutEngine.generateLayoutHash(slide, theme);

    // 1. Check cache
    const cached = this.cacheManager.get('layout', cacheKey);
    if (cached) {
      return cached;
    }

    const { contentZone } = bounds;
    const elements = slide.elements || [];
    let currentY = contentZone.y;

    const positionedElements = [];

    // Separate by semantic types
    const badgeEl = elements.find((e) => e.type === 'badge');
    const headlineEl = elements.find((e) => e.type === 'headline' || e.type === 'title');
    const bodyEl = elements.find((e) => e.type === 'body' || e.type === 'text');
    const otherElements = elements.filter(
      (e) => e !== badgeEl && e !== headlineEl && e !== bodyEl
    );

    // 1. Position Badge (if present)
    if (badgeEl) {
      const badgeHeight = 44;
      positionedElements.push({
        ...badgeEl,
        x: contentZone.x,
        y: currentY,
        width: Math.min(contentZone.width, 320),
        height: badgeHeight,
      });
      currentY += badgeHeight + 24;
    }

    // 2. Position Headline
    if (headlineEl) {
      const fontSize = headlineEl.fontSize || 80;
      const text = headlineEl.content || headlineEl.text || '';
      const headlineHeight = this.estimateTextBlockHeight(text, fontSize, 1.18, contentZone.width);

      positionedElements.push({
        ...headlineEl,
        x: contentZone.x,
        y: currentY,
        width: contentZone.width,
        height: headlineHeight,
        fontSize,
      });
      currentY += headlineHeight + 36;
    }

    // 3. Position Body
    if (bodyEl) {
      const fontSize = bodyEl.fontSize || 54;
      const text = bodyEl.content || bodyEl.text || '';
      const bodyHeight = this.estimateTextBlockHeight(text, fontSize, 1.45, contentZone.width);

      positionedElements.push({
        ...bodyEl,
        x: contentZone.x,
        y: currentY,
        width: contentZone.width,
        height: bodyHeight,
        fontSize,
      });
      currentY += bodyHeight + 40;
    }

    // 4. Position Directive Cards / Images / Containers
    for (const el of otherElements) {
      if (el.type === 'directive_card' || el.type === 'image') {
        const availableHeight = Math.max(200, contentZone.bottomLimit - currentY);
        const cardHeight = Math.min(availableHeight, el.height || 420);

        positionedElements.push({
          ...el,
          x: contentZone.x,
          y: currentY,
          width: contentZone.width,
          height: cardHeight,
        });
        currentY += cardHeight + 30;
      } else {
        // Fallback for custom placed elements
        positionedElements.push({
          ...el,
          x: el.x !== undefined ? el.x : contentZone.x,
          y: el.y !== undefined ? el.y : currentY,
          width: el.width || contentZone.width,
          height: el.height || 100,
        });
      }
    }

    const computedResult = {
      slideId: slide.id,
      canvasWidth: bounds.width,
      canvasHeight: bounds.height,
      contentZone,
      totalContentHeight: currentY - contentZone.y,
      isOverflowing: currentY > contentZone.bottomLimit,
      elements: positionedElements,
      computedAt: Date.now(),
    };

    // Store in cache with dependency on slide
    this.cacheManager.set('layout', cacheKey, computedResult, {
      dependencies: [`slide:${slide.id}`],
    });

    return computedResult;
  }
}

// Global Singleton Instance
export const globalLayoutEngine = new LayoutEngine();
