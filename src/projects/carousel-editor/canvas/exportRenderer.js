import { Canvas, Rect, Circle, Textbox, FabricImage, Pattern } from "fabric";
import { getPatternDataUrl } from "./patterns";
import { buildHeadlineStyles, buildBodyStyles } from "./textAnnotations";

/**
 * Renders a slide onto an offscreen Fabric canvas and waits for all images
 * to finish loading before resolving. Returns a high-res PNG data URL.
 *
 * @param {Object} slide - Slide JSON object
 * @param {Object} metadata - Carousel metadata (width, height, etc.)
 * @param {number} [multiplier=2] - Export resolution multiplier
 * @returns {Promise<string>} PNG data URL
 */
export async function renderSlideToDataUrl(slide, metadata, multiplier = 2) {
  const width = metadata?.width || 1080;
  const height = metadata?.height || 1350;

  const canvasEl = document.createElement("canvas");
  const fabric = new Canvas(canvasEl, { width, height });

  // Background color
  const bgColor = slide.backgroundColor || "#ffffff";
  fabric.backgroundColor = bgColor;

  // Background pattern (if any)
  const patternType = slide.bgPattern || metadata.bgPattern || "solid";
  if (patternType && patternType !== "solid") {
    const dataUrl = getPatternDataUrl(patternType, "#94a3b8");
    if (dataUrl) {
      await new Promise((resolve) => {
        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";
        imgEl.onload = () => {
          try {
            fabric.backgroundColor = new Pattern({ source: imgEl, repeat: "repeat" });
          } catch (e) {
            console.warn("Pattern creation failed:", e);
          }
          resolve();
        };
        imgEl.onerror = resolve;
        imgEl.src = dataUrl;
      });
    }
  }

  // Sort elements by zIndex
  const sorted = [...(slide.elements || [])].sort(
    (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
  );

  // Load all images in parallel, then add all objects
  const imageLoadPromises = [];

  for (const el of sorted) {
    if (!el.type) continue;

    if (el.type === "image" && el.src) {
      // Async image load — resolved once the HTMLImageElement fires onload
      const p = new Promise((resolve) => {
        const imgEl = document.createElement("img");
        imgEl.crossOrigin = "anonymous";

        imgEl.onload = () => {
          const fabricImg = new FabricImage(imgEl, {
            left: el.x,
            top: el.y,
            angle: el.rotation || 0,
            originX: el.originX || "left",
            originY: el.originY || "top",
            selectable: false,
            evented: false,
            data: { id: el.id, isChrome: Boolean(el.isChrome) },
          });

          // Scale to specified dimensions
          const natW = imgEl.naturalWidth || fabricImg.width;
          const natH = imgEl.naturalHeight || fabricImg.height;
          if (el.width && el.height && natW && natH) {
            fabricImg.set({ scaleX: el.width / natW, scaleY: el.height / natH });
          } else if (el.width) {
            fabricImg.scaleToWidth(el.width);
          } else if (el.height) {
            fabricImg.scaleToHeight(el.height);
          }

          fabric.add(fabricImg);
          resolve();
        };

        imgEl.onerror = () => {
          // Image failed to load — skip it but don't block export
          console.warn(`[export] Image failed to load for element ${el.id}:`, el.src?.slice(0, 60));
          resolve();
        };

        imgEl.src = el.src;
      });

      imageLoadPromises.push(p);
    } else {
      // Synchronous elements: rect, circle, text, headline, badge
      let fabricObj = null;

      if (el.type === "rect") {
        fabricObj = new Rect({
          left: el.x, top: el.y,
          width: el.width, height: el.height,
          fill: el.fill,
          stroke: el.stroke || "#000000",
          strokeWidth: el.strokeWidth || 0,
          strokeDashArray: el.strokeDashArray || null,
          angle: el.rotation || 0,
          originX: el.originX || "left",
          originY: el.originY || "top",
          scaleX: el.scaleX || 1, scaleY: el.scaleY || 1,
          selectable: false, evented: false,
          data: { id: el.id, isChrome: Boolean(el.isChrome) },
        });
      } else if (el.type === "circle") {
        fabricObj = new Circle({
          left: el.x, top: el.y,
          radius: el.radius,
          fill: el.fill,
          stroke: el.stroke || "#000000",
          strokeWidth: el.strokeWidth || 0,
          angle: el.rotation || 0,
          originX: el.originX || "left",
          originY: el.originY || "top",
          scaleX: el.scaleX || 1, scaleY: el.scaleY || 1,
          selectable: false, evented: false,
          data: { id: el.id, isChrome: Boolean(el.isChrome) },
        });
      } else if (
        el.type === "headline" ||
        el.type === "text" ||
        el.type === "badge"
      ) {
        const rawText = el.text || el.content || "";
        const annotationStyles =
          el.type === "headline"
            ? buildHeadlineStyles(rawText, el.accentColor || el._accent)
            : el.type === "text"
            ? buildBodyStyles(rawText, el.fill || el._primary)
            : {};

        fabricObj = new Textbox(rawText, {
          left: el.x, top: el.y,
          width: el.width || 840,
          fontSize: el.fontSize || 32,
          fontFamily: el.fontFamily || "Inter",
          fontWeight: el.fontWeight || "normal",
          fill: el.fill || "#000000",
          angle: el.rotation || 0,
          originX: el.originX || "left",
          originY: el.originY || "top",
          textAlign: el.textAlign || "left",
          splitByGrapheme: false,
          styles: annotationStyles,
          selectable: false, evented: false,
          data: { id: el.id, isChrome: Boolean(el.isChrome) },
        });
      }

      if (fabricObj) fabric.add(fabricObj);
    }
  }

  // Wait for ALL images to finish loading
  await Promise.all(imageLoadPromises);

  // Final render and export
  fabric.renderAll();

  // Small buffer to let Fabric finish compositing
  await new Promise((r) => setTimeout(r, 50));

  const dataUrl = fabric.toDataURL({ format: "png", multiplier });
  fabric.dispose();

  return dataUrl;
}
