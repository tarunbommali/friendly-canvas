import { Rect, Circle, Textbox, FabricImage, FabricObject } from "fabric";
import { THEME } from "../theme/theme";

// High-visibility dark selection controls and resize handles
export const SELECTION_CONTROL_CONFIG = {
  transparentCorners: false,
  cornerColor: "#2563eb",       // Vibrant solid blue fill
  cornerStrokeColor: "#ffffff", // Crisp white outline ring around handles
  cornerSize: 16,               // Prominent size for easy grabbing & resizing
  cornerStyle: "circle",        // Sleek circular handles
  borderColor: "#2563eb",       // Crisp vibrant blue selection border line
  borderScaleFactor: 2,         // Crisp selection border line
  padding: 4,                   // Comfortable spacing around object
  touchCornerSize: 32,          // Generous hit target area for easy drag & resize
};

// Apply default selection styling globally to FabricObject prototype
if (FabricObject && FabricObject.prototype) {
  Object.assign(FabricObject.prototype, SELECTION_CONTROL_CONFIG);
}

/**
 * Fabric Adapter: Transforms JSON element definitions into runtime Fabric.js Objects.
 *
 * @param {Object} element - JSON element definition from carousel store
 * @returns {import("fabric").FabricObject | null}
 */
export function createFabricObject(element) {
  if (!element) return null;

  switch (element.type) {
    case "rect":
      return new Rect({
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        fill: element.fill,
        stroke: element.stroke || "#000000",
        strokeWidth: element.strokeWidth || 0,
        strokeDashArray: element.strokeDashArray || null,
        angle: element.rotation || 0,
        originX: element.originX || "left",
        originY: element.originY || "top",
        data: { id: element.id },
        ...SELECTION_CONTROL_CONFIG,
      });

    case "circle":
      return new Circle({
        left: element.x,
        top: element.y,
        radius: element.radius,
        fill: element.fill,
        stroke: element.stroke || "#000000",
        strokeWidth: element.strokeWidth || 0,
        angle: element.rotation || 0,
        data: { id: element.id },
        ...SELECTION_CONTROL_CONFIG,
      });

    case "headline":
    case "badge":
    case "text":
      return new Textbox(element.text || element.content || "", {
        left: element.x,
        top: element.y,
        width: element.width || THEME.contentZone.width,
        fontSize: element.fontSize || 32,
        fontFamily: element.fontFamily || "Inter",
        fill: element.fill || "#000000",
        angle: element.rotation || 0,
        originX: element.originX || "left",
        originY: element.originY || "top",
        textAlign: element.textAlign || "left",
        splitByGrapheme: false,
        breakWords: false,
        data: { id: element.id },
        ...SELECTION_CONTROL_CONFIG,
      });

    case "image": {
      const imgElement = document.createElement("img");
      imgElement.crossOrigin = "anonymous";
      imgElement.src = element.src;

      const fabricImg = new FabricImage(imgElement, {
        left: element.x,
        top: element.y,
        angle: element.rotation || 0,
        data: { id: element.id },
        ...SELECTION_CONTROL_CONFIG,
      });

      if (element.width && element.height) {
        fabricImg.scaleToWidth(element.width);
        fabricImg.scaleToHeight(element.height);
      }

      imgElement.onload = () => {
        if (element.width && element.height) {
          fabricImg.scaleToWidth(element.width);
          fabricImg.scaleToHeight(element.height);
        }
        if (fabricImg.canvas) {
          fabricImg.canvas.renderAll();
        }
      };

      return fabricImg;
    }

    default:
      return null;
  }
}
