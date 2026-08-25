import { useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";
import { useCarouselStore } from "../store/carouselStore";
import { renderSlide } from "../canvas/renderer";

export function CanvasEditor() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  const document = useCarouselStore((state) => state.document);
  const zoom = useCarouselStore((state) => state.zoom);
  const selectElement = useCarouselStore((state) => state.selectElement);
  const updateElement = useCarouselStore((state) => state.updateElement);

  const activeSlide = document.slides.find(
    (s) => s.id === document.activeSlideId
  );

  const canvasWidth = document.metadata.width || 1080;
  const canvasHeight = document.metadata.height || 1080;

  // 1. Measure container size with ResizeObserver for fluid 100% auto-fit
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute auto-fit scale so canvas fits 100% inside container bounds with padding
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

    // Selection handlers
    canvas.on("selection:created", (event) => {
      const id = event.selected?.[0]?.get("data")?.id;
      if (id) selectElement(id);
    });

    canvas.on("selection:updated", (event) => {
      const id = event.selected?.[0]?.get("data")?.id;
      if (id) selectElement(id);
    });

    canvas.on("selection:cleared", () => {
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
        updates.width = Math.round(target.width * (target.scaleX || 1));
        updates.height = Math.round(target.height * (target.scaleY || 1));
        target.scaleX = 1;
        target.scaleY = 1;
      } else if (target.type === "circle") {
        updates.radius = Math.round(target.radius * (target.scaleX || 1));
        target.scaleX = 1;
        target.scaleY = 1;
      } else if (target.type === "i-text" || target.type === "text") {
        updates.text = target.text;
        updates.fontSize = Math.round(target.fontSize * (target.scaleY || 1));
        target.scaleX = 1;
        target.scaleY = 1;
      } else if (target.type === "image" || target.type === "FabricImage") {
        updates.width = Math.round(target.width * (target.scaleX || 1));
        updates.height = Math.round(target.height * (target.scaleY || 1));
        target.scaleX = 1;
        target.scaleY = 1;
      }

      updateElement(id, updates);
    });

    canvas.on("text:changed", (event) => {
      const target = event.target;
      const id = target?.get("data")?.id;
      if (id) {
        updateElement(id, { text: target.text });
      }
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // 3. Sync JSON -> Fabric Canvas whenever active slide or its elements change
  useEffect(() => {
    if (!fabricRef.current || !activeSlide) return;

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
  }, [activeSlide, document.metadata]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 p-4"
    >
      <div
        className="transition-transform duration-150 ease-out shadow-2xl rounded-xl border border-slate-700 bg-white flex items-center justify-center flex-shrink-0"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `scale(${effectiveScale})`,
          transformOrigin: "center center",
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
