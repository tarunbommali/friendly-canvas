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
    detach() {
      fabricCanvas.off("object:moving", onMoving);
      fabricCanvas.off("mouse:up", onMouseUp);
      clearGuides();
    },
  };
}
