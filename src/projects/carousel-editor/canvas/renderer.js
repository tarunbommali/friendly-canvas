import { createFabricObject } from "./fabricAdapter";

/**
 * Slide Renderer: Synchronizes a slide JSON document onto the Fabric Canvas.
 *
 * @param {import("fabric").Canvas} fabricCanvas - Active Fabric Canvas instance
 * @param {Object} slide - Slide JSON object containing elements
 * @param {Object} metadata - Carousel metadata containing width and height
 */
export function renderSlide(fabricCanvas, slide, metadata) {
  if (!fabricCanvas || !slide || !metadata) return;

  fabricCanvas.clear();

  fabricCanvas.setDimensions({
    width: metadata.width || 1080,
    height: metadata.height || 1080,
  });

  fabricCanvas.backgroundColor = slide.backgroundColor || "#ffffff";

  const sortedElements = [...(slide.elements || [])].sort(
    (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
  );

  for (const element of sortedElements) {
    const fabricObject = createFabricObject(element);
    if (!fabricObject) continue;

    fabricCanvas.add(fabricObject);
  }

  fabricCanvas.renderAll();
}
