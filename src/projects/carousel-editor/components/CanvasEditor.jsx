import { useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";
import { useCarouselStore } from "../store/carouselStore";
import { renderSlide } from "../canvas/renderer";
import { initSnapGuides } from "../canvas/snapGuideEngine";
import { THEME } from "../theme/theme";

export function CanvasEditor() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const isRenderingRef = useRef(false);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const document = useCarouselStore((state) => state.document);
  const zoom = useCarouselStore((state) => state.zoom);
  const selectElement = useCarouselStore((state) => state.selectElement);
  const updateElement = useCarouselStore((state) => state.updateElement);
  const showSafeAreaGuides = useCarouselStore(
    (state) => state.showSafeAreaGuides
  );

  const activeSlide = document.slides.find(
    (s) => s.id === document.activeSlideId
  );

  const canvasWidth = document.metadata.width || 1080;
  const canvasHeight = document.metadata.height || 1350;

  // 1. Measure parent container with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate fit scale so canvas fits 100% inside container bounds with padding
  const padding = 48;
  const availableWidth = Math.max(100, containerSize.width - padding);
  const availableHeight = Math.max(100, containerSize.height - padding);

  const fitScale = Math.min(
    availableWidth / canvasWidth,
    availableHeight / canvasHeight
  );

  // Effective scale combines auto-fit scale with user zoom setting
  const effectiveScale = (fitScale > 0 ? fitScale : 0.45) * zoom;

  // 2. Initialize Fabric Canvas once
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      selection: true,
    });

    fabricRef.current = canvas;

    // Attach real-time snap guides and edge alignment listener
    const cleanupSnapGuides = initSnapGuides(canvas);

    // Selection handlers
    canvas.on("selection:created", (event) => {
      if (isRenderingRef.current) return;
      const id = event.selected?.[0]?.get("data")?.id;
      if (id) selectElement(id);
    });

    canvas.on("selection:updated", (event) => {
      if (isRenderingRef.current) return;
      const id = event.selected?.[0]?.get("data")?.id;
      if (id) selectElement(id);
    });

    canvas.on("selection:cleared", () => {
      if (isRenderingRef.current) return;
      selectElement(null);
    });

    // Object modification sync back to Zustand
    canvas.on("object:modified", (event) => {
      const target = event.target;
      const id = target?.get("data")?.id;
      if (!id) return;

      const updates = {
        x: Math.round(target.left ?? 0),
        y: Math.round(target.top ?? 0),
        rotation: Math.round(target.angle ?? 0),
      };

      if (target.type === "rect") {
        const scaledW = Math.round(target.getScaledWidth());
        const scaledH = Math.round(target.getScaledHeight());
        updates.width = scaledW;
        updates.height = scaledH;
        target.scaleX = 1;
        target.scaleY = 1;
        target.width = scaledW;
        target.height = scaledH;
      } else if (target.type === "circle") {
        const scaledR = Math.round((target.radius || 50) * Math.max(target.scaleX || 1, target.scaleY || 1));
        updates.radius = scaledR;
        target.scaleX = 1;
        target.scaleY = 1;
        target.radius = scaledR;
      } else if (target.type === "textbox" || target.type === "i-text" || target.type === "text") {
        updates.text = target.text;
        const scaledW = Math.round(target.getScaledWidth());
        updates.width = scaledW;
        target.scaleX = 1;
        target.scaleY = 1;
        target.width = scaledW;
      } else if (target.type === "image" || target.isType?.("image")) {
        const scaledW = Math.round(target.getScaledWidth());
        const scaledH = Math.round(target.getScaledHeight());
        updates.width = scaledW;
        updates.height = scaledH;
        if (typeof target.scaleToWidth === "function" && typeof target.scaleToHeight === "function") {
          target.scaleToWidth(scaledW);
          target.scaleToHeight(scaledH);
        }
      }

      updateElement(id, updates);
    });

    canvas.on("text:changed", (event) => {
      const target = event.target;
      const id = target?.get("data")?.id;
      if (id && target.text !== undefined) {
        updateElement(id, { text: target.text });
      }
    });

    return () => {
      cleanupSnapGuides();
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // 3. Sync JSON -> Fabric Canvas whenever active slide or its elements change
  useEffect(() => {
    if (!fabricRef.current || !activeSlide) return;

    isRenderingRef.current = true;

    renderSlide(fabricRef.current, activeSlide, document.metadata);

    // Re-highlight active selection if element is selected
    const selectedId = useCarouselStore.getState().selectedElementId;
    if (selectedId) {
      const obj = fabricRef.current
        .getObjects()
        .find((o) => o.get("data")?.id === selectedId);
      if (obj) {
        fabricRef.current.setActiveObject(obj);
        fabricRef.current.renderAll();
      }
    }

    const timer = setTimeout(() => {
      isRenderingRef.current = false;
    }, 50);

    return () => clearTimeout(timer);
  }, [activeSlide, document.metadata]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 p-4"
    >
      <div
        className="transition-transform duration-150 ease-out shadow-2xl rounded-xl border border-slate-700 bg-white flex items-center justify-center flex-shrink-0 relative"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `scale(${effectiveScale})`,
          transformOrigin: "center center",
        }}
      >
        <canvas ref={canvasRef} />

        {/* Safe Area & Content Zone Visual Guide Overlay */}
        {showSafeAreaGuides && (
          <div
            className="absolute border-2 border-dashed border-cyan-400/50 pointer-events-none rounded-2xl flex flex-col justify-between p-2"
            style={{
              top: `${THEME.safeArea.top}px`,
              left: `${THEME.safeArea.left}px`,
              width: `${THEME.safeArea.width}px`,
              height: `${THEME.safeArea.height}px`,
            }}
          >
            <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded w-max border border-cyan-500/30">
              <span>SAFE AREA (Top/Bottom: {THEME.safeArea.top}px, L/R: {THEME.safeArea.left}px)</span>
            </div>

            {/* Inner Content Zone Boundary with 4-Column Grid Guides */}
            <div
              className="absolute border border-dashed border-amber-400/60 pointer-events-none rounded-xl overflow-hidden"
              style={{
                top: `${THEME.contentZone.paddingTop}px`,
                left: `${THEME.contentZone.paddingLeft}px`,
                width: `${THEME.contentZone.width}px`,
                height: `${THEME.contentZone.height}px`,
              }}
            >
              <span className="absolute top-1 left-2 text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30 z-10">
                CONTENT ZONE (Top: {THEME.contentZone.top}px, Bottom: {THEME.contentZone.bottom}px)
              </span>

              {/* 4 Column Grid Overlay Lines */}
              <div className="w-full h-full grid grid-cols-4 gap-4 px-2 opacity-15 pointer-events-none">
                <div className="bg-amber-400/20 border-x border-amber-400/40 h-full" />
                <div className="bg-amber-400/20 border-x border-amber-400/40 h-full" />
                <div className="bg-amber-400/20 border-x border-amber-400/40 h-full" />
                <div className="bg-amber-400/20 border-x border-amber-400/40 h-full" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded w-max self-end border border-cyan-500/30">
              <span>Safe Area ({THEME.safeArea.width}x{THEME.safeArea.height})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
