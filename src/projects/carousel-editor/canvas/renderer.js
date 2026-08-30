import { Pattern } from "fabric";
import { createFabricObject } from "./fabricAdapter";
import { getPatternDataUrl } from "./patterns";

/**
 * Slide Renderer: Synchronizes a slide JSON document onto the Fabric Canvas.
 *
 * @param {import("fabric").Canvas} fabricCanvas - Active Fabric Canvas instance
 * @param {Object} slide - Slide JSON object containing elements
 * @param {Object} metadata - Carousel metadata containing width and height
 */
export function renderSlide(fabricCanvas, slide, metadata, options = {}) {
  if (!fabricCanvas || !slide || !metadata) return;

  fabricCanvas.clear();

  fabricCanvas.setDimensions({
    width: metadata.width || 1080,
    height: metadata.height || 1350,
  });

  const bgColor = slide.backgroundColor || "#ffffff";
  fabricCanvas.backgroundColor = bgColor;

  // Add pattern background if configured
  const patternType = slide.bgPattern || metadata.bgPattern || "solid";
  if (patternType && patternType !== "solid") {
    const dataUrl = getPatternDataUrl(patternType, "#94a3b8");
    if (dataUrl) {
      const imgEl = new Image();
      imgEl.crossOrigin = "anonymous";
      imgEl.src = dataUrl;
      imgEl.onload = () => {
        try {
          const pattern = new Pattern({
            source: imgEl,
            repeat: "repeat",
          });
          fabricCanvas.backgroundColor = pattern;
          fabricCanvas.renderAll();
        } catch (e) {
          console.warn("Pattern creation failed:", e);
        }
      };
    }
  }

  const sortedElements = [...(slide.elements || [])].sort(
    (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
  );

  for (const element of sortedElements) {
    const fabricObject = createFabricObject(element, options);
    if (!fabricObject) continue;

    fabricCanvas.add(fabricObject);
  }

  fabricCanvas.renderAll();
}
