<<<<<<< HEAD
import { Line } from "fabric";

const SNAP_THRESHOLD = 6;
const GUIDE_COLOR = "#22d3ee";

function isGuideObject(obj) {
  return Boolean(obj?.data?.isGuide) || obj?.excludeFromExport === true;
}

function boundsOf(obj) {
  const rect =
    typeof obj.getBoundingRect === "function" ? obj.getBoundingRect() : null;
  if (rect && Number.isFinite(rect.left) && Number.isFinite(rect.width)) {
    return {
      left: rect.left,
      top: rect.top,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  }
  const width = (obj.width || 0) * (obj.scaleX || 1);
  const height = (obj.height || 0) * (obj.scaleY || 1);
  const left = obj.left || 0;
  const top = obj.top || 0;
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    centerX: left + width / 2,
    centerY: top + height / 2,
    width,
    height,
  };
}

function nearest(value, candidates, threshold) {
  let best = null;
  let bestDist = threshold + 1;
  for (const candidate of candidates) {
    const dist = Math.abs(value - candidate);
    if (dist <= threshold && dist < bestDist) {
      best = candidate;
      bestDist = dist;
    }
  }
  return best;
}

/**
 * Real-time snap lines during drag: canvas center, canvas edges, and other element edges/centers.
 */
export function attachSnapGuideEngine(fabricCanvas, options = {}) {
  if (!fabricCanvas) {
    return { dispose() {} };
  }

  let guides = [];

  const isEnabled = () => {
    if (typeof options.isEnabled === "function") return options.isEnabled();
    return options.isEnabled !== false;
  };

  const clearGuides = () => {
    if (!guides.length) return;
    for (const line of guides) {
      fabricCanvas.remove(line);
    }
    guides = [];
  };

  const addGuide = (x1, y1, x2, y2) => {
    const line = new Line([x1, y1, x2, y2], {
      stroke: GUIDE_COLOR,
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      hoverCursor: "default",
      data: { isGuide: true },
    });
    fabricCanvas.add(line);
    if (typeof fabricCanvas.bringObjectToFront === "function") {
      fabricCanvas.bringObjectToFront(line);
    }
    guides.push(line);
  };

  const onMoving = (event) => {
    const obj = event.target;
    if (!obj || isGuideObject(obj) || !isEnabled()) {
      clearGuides();
      return;
    }

    clearGuides();

    const canvasWidth = fabricCanvas.getWidth?.() ?? fabricCanvas.width ?? 1080;
    const canvasHeight = fabricCanvas.getHeight?.() ?? fabricCanvas.height ?? 1350;

    const others = fabricCanvas
      .getObjects()
      .filter((item) => item !== obj && !isGuideObject(item));

    const verticalStops = [0, canvasWidth / 2, canvasWidth];
    const horizontalStops = [0, canvasHeight / 2, canvasHeight];

    for (const other of others) {
      const b = boundsOf(other);
      verticalStops.push(b.left, b.centerX, b.right);
      horizontalStops.push(b.top, b.centerY, b.bottom);
    }

    const self = boundsOf(obj);
    let dx = 0;
    let dy = 0;
    const snappedX = [];
    const snappedY = [];

    const snapLeft = nearest(self.left, verticalStops, SNAP_THRESHOLD);
    const snapCenterX = nearest(self.centerX, verticalStops, SNAP_THRESHOLD);
    const snapRight = nearest(self.right, verticalStops, SNAP_THRESHOLD);

    if (snapLeft !== null) {
      dx = snapLeft - self.left;
      snappedX.push(snapLeft);
    } else if (snapCenterX !== null) {
      dx = snapCenterX - self.centerX;
      snappedX.push(snapCenterX);
    } else if (snapRight !== null) {
      dx = snapRight - self.right;
      snappedX.push(snapRight);
    }

    const snapTop = nearest(self.top, horizontalStops, SNAP_THRESHOLD);
    const snapCenterY = nearest(self.centerY, horizontalStops, SNAP_THRESHOLD);
    const snapBottom = nearest(self.bottom, horizontalStops, SNAP_THRESHOLD);

    if (snapTop !== null) {
      dy = snapTop - self.top;
      snappedY.push(snapTop);
    } else if (snapCenterY !== null) {
      dy = snapCenterY - self.centerY;
      snappedY.push(snapCenterY);
    } else if (snapBottom !== null) {
      dy = snapBottom - self.bottom;
      snappedY.push(snapBottom);
    }

    if (dx !== 0 || dy !== 0) {
      obj.left = (obj.left ?? 0) + dx;
      obj.top = (obj.top ?? 0) + dy;
      obj.setCoords();
    }

    for (const x of snappedX) {
      addGuide(x, 0, x, canvasHeight);
    }
    for (const y of snappedY) {
      addGuide(0, y, canvasWidth, y);
    }
  };

  const onMouseUp = () => {
    clearGuides();
    fabricCanvas.requestRenderAll?.() ?? fabricCanvas.renderAll();
  };

  fabricCanvas.on("object:moving", onMoving);
  fabricCanvas.on("mouse:up", onMouseUp);

  return {
    clearGuides,
    dispose() {
      fabricCanvas.off("object:moving", onMoving);
      fabricCanvas.off("mouse:up", onMouseUp);
      clearGuides();
    },
=======
import { Line, Textbox } from "fabric";
import { THEME } from "../theme/theme";
import { useCarouselStore } from "../store/carouselStore";

const SNAP_THRESHOLD = 10; // Snap distance tolerance in pixels
const GUIDE_COLOR = "#ec4899"; // Vibrant pink/magenta alignment line color

/**
 * Attaches real-time snap guides and edge alignment listeners to a Fabric.js Canvas.
 *
 * @param {import("fabric").Canvas} fabricCanvas - Active Fabric Canvas instance
 */
export function initSnapGuides(fabricCanvas) {
  if (!fabricCanvas) return () => {};

  let activeGuideObjects = [];

  const clearGuides = () => {
    activeGuideObjects.forEach((obj) => fabricCanvas.remove(obj));
    activeGuideObjects = [];
    fabricCanvas.renderAll();
  };

  const drawLine = (x1, y1, x2, y2) => {
    const line = new Line([x1, y1, x2, y2], {
      stroke: GUIDE_COLOR,
      strokeWidth: 1.5,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
    });
    line.isGuideLine = true;
    fabricCanvas.add(line);
    activeGuideObjects.push(line);
  };

  const drawGapBadge = (x, y, labelText) => {
    const badge = new Textbox(labelText, {
      left: x,
      top: y,
      fontSize: 11,
      fontFamily: "monospace",
      fill: "#ffffff",
      backgroundColor: "#ec4899",
      padding: 3,
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
    });
    badge.isGuideLine = true;
    fabricCanvas.add(badge);
    activeGuideObjects.push(badge);
  };

  const handleObjectMoving = (e) => {
    const target = e.target;
    if (!target) return;

    clearGuides();

    const { snapToGuides, globalLayoutConfig } = useCarouselStore.getState();
    if (snapToGuides === false || globalLayoutConfig?.snapToGuides === false) return;

    const canvasWidth = fabricCanvas.width || 1080;
    const canvasHeight = fabricCanvas.height || 1350;

    const targetWidth = target.width * (target.scaleX || 1);
    const targetHeight = target.height * (target.scaleY || 1);

    // Compute target edges & center
    let targetLeft = target.left;
    if (target.originX === "center") targetLeft -= targetWidth / 2;
    else if (target.originX === "right") targetLeft -= targetWidth;

    let targetTop = target.top;
    if (target.originY === "center") targetTop -= targetHeight / 2;
    else if (target.originY === "bottom") targetTop -= targetHeight;

    const targetRight = targetLeft + targetWidth;
    const targetBottom = targetTop + targetHeight;
    const targetCenterX = targetLeft + targetWidth / 2;
    const targetCenterY = targetTop + targetHeight / 2;

    // Collect candidate snap targets
    const xTargets = [
      { pos: canvasWidth / 2, type: "canvas_center_x" },
      { pos: THEME.safeArea.left, type: "safe_area_left" },
      { pos: THEME.safeArea.left + THEME.safeArea.width, type: "safe_area_right" },
      { pos: THEME.contentZone.x, type: "content_zone_x" },
      { pos: THEME.contentZone.right, type: "content_zone_right" },
    ];

    const yTargets = [
      { pos: canvasHeight / 2, type: "canvas_center_y" },
      { pos: THEME.safeArea.top, type: "safe_area_top" },
      { pos: THEME.safeArea.top + THEME.safeArea.height, type: "safe_area_bottom" },
      { pos: THEME.contentZone.y, type: "content_zone_y" },
      { pos: THEME.contentZone.bottom, type: "content_zone_bottom" },
    ];

    // Add other canvas elements' bounds as targets
    const otherObjects = fabricCanvas
      .getObjects()
      .filter((obj) => obj !== target && !obj.isGuideLine && obj.selectable !== false);

    otherObjects.forEach((obj) => {
      const w = obj.width * (obj.scaleX || 1);
      const h = obj.height * (obj.scaleY || 1);
      let l = obj.left;
      if (obj.originX === "center") l -= w / 2;
      else if (obj.originX === "right") l -= w;

      let t = obj.top;
      if (obj.originY === "center") t -= h / 2;
      else if (obj.originY === "bottom") t -= h;

      const r = l + w;
      const b = t + h;
      const cx = l + w / 2;
      const cy = t + h / 2;

      xTargets.push({ pos: l, type: "obj_left", obj });
      xTargets.push({ pos: cx, type: "obj_cx", obj });
      xTargets.push({ pos: r, type: "obj_right", obj });

      yTargets.push({ pos: t, type: "obj_top", obj });
      yTargets.push({ pos: cy, type: "obj_cy", obj });
      yTargets.push({ pos: b, type: "obj_bottom", obj });
    });

    // Check X snap alignments
    for (const xt of xTargets) {
      if (Math.abs(targetLeft - xt.pos) < SNAP_THRESHOLD) {
        let newLeft = xt.pos;
        if (target.originX === "center") newLeft += targetWidth / 2;
        else if (target.originX === "right") newLeft += targetWidth;
        target.left = newLeft;
        drawLine(xt.pos, 0, xt.pos, canvasHeight);
        break;
      }
      if (Math.abs(targetCenterX - xt.pos) < SNAP_THRESHOLD) {
        let newLeft = xt.pos;
        if (target.originX === "left") newLeft -= targetWidth / 2;
        else if (target.originX === "right") newLeft += targetWidth / 2;
        target.left = newLeft;
        drawLine(xt.pos, 0, xt.pos, canvasHeight);
        break;
      }
      if (Math.abs(targetRight - xt.pos) < SNAP_THRESHOLD) {
        let newLeft = xt.pos;
        if (target.originX === "left") newLeft -= targetWidth;
        else if (target.originX === "center") newLeft -= targetWidth / 2;
        target.left = newLeft;
        drawLine(xt.pos, 0, xt.pos, canvasHeight);
        break;
      }
    }

    // Check Y snap alignments & live vertical gap labels
    for (const yt of yTargets) {
      if (Math.abs(targetTop - yt.pos) < SNAP_THRESHOLD) {
        let newTop = yt.pos;
        if (target.originY === "center") newTop += targetHeight / 2;
        else if (target.originY === "bottom") newTop += targetHeight;
        target.top = newTop;
        drawLine(0, yt.pos, canvasWidth, yt.pos);

        if (yt.type === "obj_bottom" && yt.obj) {
          const gap = Math.round(targetTop - yt.pos);
          if (gap > 0) {
            drawGapBadge(targetCenterX, yt.pos + gap / 2, `${gap}px`);
          }
        }
        break;
      }
      if (Math.abs(targetCenterY - yt.pos) < SNAP_THRESHOLD) {
        let newTop = yt.pos;
        if (target.originY === "top") newTop -= targetHeight / 2;
        else if (target.originY === "bottom") newTop += targetHeight / 2;
        target.top = newTop;
        drawLine(0, yt.pos, canvasWidth, yt.pos);
        break;
      }
      if (Math.abs(targetBottom - yt.pos) < SNAP_THRESHOLD) {
        let newTop = yt.pos;
        if (target.originY === "top") newTop -= targetHeight;
        else if (target.originY === "center") newTop -= targetHeight / 2;
        target.top = newTop;
        drawLine(0, yt.pos, canvasWidth, yt.pos);
        break;
      }
    }

    fabricCanvas.renderAll();
  };

  fabricCanvas.on("object:moving", handleObjectMoving);
  fabricCanvas.on("object:modified", clearGuides);
  fabricCanvas.on("mouse:up", clearGuides);

  return () => {
    fabricCanvas.off("object:moving", handleObjectMoving);
    fabricCanvas.off("object:modified", clearGuides);
    fabricCanvas.off("mouse:up", clearGuides);
    clearGuides();
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
  };
}
