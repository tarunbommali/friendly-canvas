/**
 * @interface IRendererAdapter
 * Decoupled Renderer Adapter contract for Canvas rendering implementations.
 */
export class RendererAdapter {
  /**
   * Mounts renderer to a DOM container or canvas element
   * @param {HTMLCanvasElement | HTMLElement} target
   */
  mount(target) {
    throw new Error('Method mount() must be implemented');
  }

  /**
   * Renders a computed slide layout
   * @param {Object} computedLayout
   * @param {Object} [options]
   */
  renderSlide(computedLayout, options) {
    throw new Error('Method renderSlide() must be implemented');
  }

  /**
   * Exports high-resolution image blob (e.g. 2x multiplier)
   * @param {number} [multiplier=2]
   * @returns {Promise<Blob | string>}
   */
  exportImage(multiplier = 2) {
    throw new Error('Method exportImage() must be implemented');
  }

  /**
   * Cleanly disposes canvas listeners, cached WebGL/2D contexts, and object hierarchies
   */
  dispose() {
    throw new Error('Method dispose() must be implemented');
  }
}
