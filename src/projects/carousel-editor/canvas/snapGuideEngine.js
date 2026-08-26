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
  };
}
