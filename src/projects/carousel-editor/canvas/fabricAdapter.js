import { Rect, Circle, Textbox, FabricImage, FabricObject } from "fabric";
import { buildHeadlineStyles, buildBodyStyles } from "./textAnnotations";

export const SELECTION_CONTROL_CONFIG = {
  transparentCorners: false,
  cornerColor: "#2563eb",
  cornerStrokeColor: "#ffffff",
  cornerSize: 16,
  cornerStyle: "circle",
  borderColor: "#2563eb",
  borderScaleFactor: 2,
  padding: 4,
  touchCornerSize: 32,
};

if (FabricObject && FabricObject.prototype) {
  Object.assign(FabricObject.prototype, SELECTION_CONTROL_CONFIG);
}

function chromeLock(element) {
  if (!element?.isChrome) return {};
  return {
    selectable: false,
    evented: false,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    hoverCursor: "default",
    hasControls: false,
    hasBorders: false,
  };
}

function withMeta(element, extras = {}) {
  return {
    data: { id: element.id, isChrome: Boolean(element.isChrome) },
    ...SELECTION_CONTROL_CONFIG,
    ...chromeLock(element),
    ...extras,
  };
}

function applyImageSize(fabricImg, element, imgElement) {
  const natW = imgElement.naturalWidth || fabricImg.width;
  const natH = imgElement.naturalHeight || fabricImg.height;
  if (element.width && element.height && natW && natH) {
    fabricImg.set({
      scaleX: element.width / natW,
      scaleY: element.height / natH,
    });
    return;
  }
  if (element.width) {
    fabricImg.scaleToWidth(element.width);
  } else if (element.height) {
    fabricImg.scaleToHeight(element.height);
  }
}

/**
 * Fabric Adapter: Transforms JSON element definitions into runtime Fabric.js Objects.
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
        scaleX: element.scaleX || 1,
        scaleY: element.scaleY || 1,
        ...withMeta(element),
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
        originX: element.originX || "left",
        originY: element.originY || "top",
        scaleX: element.scaleX || 1,
        scaleY: element.scaleY || 1,
        ...withMeta(element),
      });

    case "headline":
    case "badge":
    case "text": {
      const rawText = element.text || element.content || "";
      // Build editorial annotation styles:
      // • headline → last word highlighted with accent background
      // • body/text → first 2 important words underlined in primary color
      const annotationStyles =
        element.type === "headline"
          ? buildHeadlineStyles(rawText, element.accentColor || element._accent)
          : element.type === "text"
          ? buildBodyStyles(rawText, element.fill || element._primary)
          : {};

      return new Textbox(rawText, {
        left: element.x,
        top: element.y,
        width: element.width || THEME.contentZone.width,
        fontSize: element.fontSize || 32,
        fontFamily: element.fontFamily || "Inter",
        fontWeight: element.fontWeight || "normal",
        fill: element.fill || "#000000",
        angle: element.rotation || 0,
        originX: element.originX || "left",
        originY: element.originY || "top",
        textAlign: element.textAlign || "left",
        splitByGrapheme: false,
        styles: annotationStyles,
        ...withMeta(element),
      });
    }

    case "image": {
      const imgElement = document.createElement("img");
      imgElement.crossOrigin = "anonymous";
      imgElement.src = element.src;

      const fabricImg = new FabricImage(imgElement, {
        left: element.x,
        top: element.y,
        angle: element.rotation || 0,
        originX: element.originX || "left",
        originY: element.originY || "top",
        ...withMeta(element),
      });

      applyImageSize(fabricImg, element, imgElement);

      imgElement.onload = () => {
        applyImageSize(fabricImg, element, imgElement);
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
