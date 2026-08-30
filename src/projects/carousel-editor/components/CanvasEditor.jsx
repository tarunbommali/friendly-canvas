import { useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";
import { useCarouselStore } from "../store/carouselStore";
import { renderSlide } from "../canvas/renderer";
import { attachSnapGuideEngine } from "../canvas/snapGuideEngine";
import { getLayoutBounds } from "../theme/layoutBounds";

export function CanvasEditor() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const isRenderingRef = useRef(false);
  const snapEngineRef = useRef(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const document = useCarouselStore((state) => state.document);
  const zoom = useCarouselStore((state) => state.zoom);
  const selectElement = useCarouselStore((state) => state.selectElement);
  const updateElement = useCarouselStore((state) => state.updateElement);
  const deleteElement = useCarouselStore((state) => state.deleteElement);
  const showSafeAreaGuides = useCarouselStore(
    (state) => state.showSafeAreaGuides
  );
  const globalLayoutConfig = useCarouselStore(
    (state) => state.globalLayoutConfig
  );

  const activeSlide = document.slides.find(
    (s) => s.id === document.activeSlideId
  );

  const layoutBounds = getLayoutBounds(globalLayoutConfig, document.metadata);
  const canvasWidth = layoutBounds.canvas.width;
  const canvasHeight = layoutBounds.canvas.height;

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

  // ── Keyboard: arrow-key nudge + Delete/Backspace ─────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in an input / textarea / contenteditable
      const tag = e.target?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        e.target?.isContentEditable
      ) {
        return;
      }

      const { selectedElementId, document: doc } = useCarouselStore.getState();
      if (!selectedElementId) return;

      // Find active element
      const activeSlideNow = doc.slides.find(
        (s) => s.id === doc.activeSlideId
      );
      const el = activeSlideNow?.elements.find(
        (el) => el.id === selectedElementId
      );
      if (!el) return;

      const step = e.shiftKey ? 10 : 1;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        updateElement(selectedElementId, { x: (el.x ?? 0) - step });
        syncFabricPosition(selectedElementId, (el.x ?? 0) - step, el.y ?? 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        updateElement(selectedElementId, { x: (el.x ?? 0) + step });
        syncFabricPosition(selectedElementId, (el.x ?? 0) + step, el.y ?? 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        updateElement(selectedElementId, { y: (el.y ?? 0) - step });
        syncFabricPosition(selectedElementId, el.x ?? 0, (el.y ?? 0) - step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        updateElement(selectedElementId, { y: (el.y ?? 0) + step });
        syncFabricPosition(selectedElementId, el.x ?? 0, (el.y ?? 0) + step);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteElement(selectedElementId);
      }
    };

    const syncFabricPosition = (id, x, y) => {
      if (!fabricRef.current) return;
      const obj = fabricRef.current
        .getObjects()
        .find((o) => (o.get?.("data")?.id || o.data?.id) === id);
      if (obj) {
        obj.set({ left: x, top: y });
        fabricRef.current.renderAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [updateElement, deleteElement]);

  const padding = 48;
  const availableWidth = Math.max(100, containerSize.width - padding);
  const availableHeight = Math.max(100, containerSize.height - padding);

  const fitScale = Math.min(
    availableWidth / canvasWidth,
    availableHeight / canvasHeight
  );

  const effectiveScale = (fitScale > 0 ? fitScale : 0.45) * zoom;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      selection: true,
    });

    fabricRef.current = canvas;

    const onSelectionCreated = (event) => {
      if (isRenderingRef.current) return;
      const obj = event.selected?.[0];
      if (obj?.data?.isChrome) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        return;
      }
      const id = obj?.get?.("data")?.id || obj?.data?.id;
      if (id) selectElement(id);
    };

    const onSelectionUpdated = (event) => {
      if (isRenderingRef.current) return;
      const obj = event.selected?.[0];
      if (obj?.data?.isChrome) return;
      const id = obj?.get?.("data")?.id || obj?.data?.id;
      if (id) selectElement(id);
    };

    const onSelectionCleared = () => {
      if (isRenderingRef.current) return;
      selectElement(null);
    };

    const onObjectModified = (event) => {
      if (isRenderingRef.current) return;
      const target = event.target;
      if (!target || target.data?.isGuide || target.data?.isChrome) return;
      const id = target?.get?.("data")?.id || target?.data?.id;
      if (!id) return;

      const updates = {
        x: Math.round(target.left ?? 0),
        y: Math.round(target.top ?? 0),
        rotation: Math.round(target.angle ?? 0),
      };

      const type = target.type;

      if (type === "rect") {
        updates.width = Math.round(target.width * (target.scaleX || 1));
        updates.height = Math.round(target.height * (target.scaleY || 1));
        target.set({ width: updates.width, height: updates.height, scaleX: 1, scaleY: 1 });
      } else if (type === "circle") {
        updates.radius = Math.round(target.radius * (target.scaleX || 1));
        target.set({ radius: updates.radius, scaleX: 1, scaleY: 1 });
      } else if (type === "textbox" || type === "i-text" || type === "text") {
        updates.text = target.text;
        updates.width = Math.round(target.width * (target.scaleX || 1));
        updates.fontSize = Math.round(target.fontSize * (target.scaleY || 1));
        target.set({
          width: updates.width,
          fontSize: updates.fontSize,
          scaleX: 1,
          scaleY: 1,
        });
      } else if (type === "image" || type === "Image") {
        updates.width = Math.round(target.getScaledWidth?.() ?? target.width * (target.scaleX || 1));
        updates.height = Math.round(target.getScaledHeight?.() ?? target.height * (target.scaleY || 1));
        updates.scaleX = target.scaleX || 1;
        updates.scaleY = target.scaleY || 1;
        updates.originX = target.originX;
        updates.originY = target.originY;
      }

      updateElement(id, updates);
    };

    const onTextChanged = (event) => {
      if (isRenderingRef.current) return;
      const target = event.target;
      const id = target?.get?.("data")?.id || target?.data?.id;
      if (id && target.text !== undefined) {
        updateElement(id, { text: target.text });
      }
    };

    canvas.on("selection:created", onSelectionCreated);
    canvas.on("selection:updated", onSelectionUpdated);
    canvas.on("selection:cleared", onSelectionCleared);
    canvas.on("object:modified", onObjectModified);
    canvas.on("text:changed", onTextChanged);

    snapEngineRef.current = attachSnapGuideEngine(canvas, {
      isEnabled: () => useCarouselStore.getState().snapToGuides,
    });

    return () => {
      canvas.off("selection:created", onSelectionCreated);
      canvas.off("selection:updated", onSelectionUpdated);
      canvas.off("selection:cleared", onSelectionCleared);
      canvas.off("object:modified", onObjectModified);
      canvas.off("text:changed", onTextChanged);
      snapEngineRef.current?.dispose();
      snapEngineRef.current = null;
      canvas.dispose();
      fabricRef.current = null;
    };
    // Fabric canvas must be constructed once; dimensions sync in the render effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fabricRef.current || !activeSlide) return;

    isRenderingRef.current = true;

    renderSlide(fabricRef.current, activeSlide, {
      ...document.metadata,
      width: canvasWidth,
      height: canvasHeight,
    });

    const selectedId = useCarouselStore.getState().selectedElementId;
    if (selectedId) {
      const obj = fabricRef.current
        .getObjects()
        .find((o) => (o.get?.("data")?.id || o.data?.id) === selectedId);
      if (obj && !obj.data?.isChrome) {
        fabricRef.current.setActiveObject(obj);
        fabricRef.current.renderAll();
      }
    }

    const timer = setTimeout(() => {
      isRenderingRef.current = false;
    }, 50);

    return () => clearTimeout(timer);
  }, [activeSlide, document.metadata, canvasWidth, canvasHeight]);

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

        {showSafeAreaGuides && (
          <div
            className="absolute border-2 border-dashed border-cyan-400/50 pointer-events-none rounded-2xl flex flex-col justify-between p-2"
            style={{
              top: `${layoutBounds.safeArea.top}px`,
              left: `${layoutBounds.safeArea.left}px`,
              width: `${layoutBounds.safeArea.width}px`,
              height: `${layoutBounds.safeArea.height}px`,
            }}
          >
            <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded w-max border border-cyan-500/30">
              <span>
                SAFE AREA (Top/Bottom: {layoutBounds.safeArea.top}px, L/R:{" "}
                {layoutBounds.safeArea.left}px)
              </span>
            </div>

            <div
              className="absolute border border-dashed border-amber-400/60 pointer-events-none rounded-xl"
              style={{
                top: `${layoutBounds.contentZone.paddingTop}px`,
                left: `${layoutBounds.contentZone.paddingLeft}px`,
                width: `${layoutBounds.contentZone.width}px`,
                height: `${layoutBounds.contentZone.height}px`,
              }}
            >
              <span className="absolute top-1 left-2 text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                CONTENT ZONE (Top: {layoutBounds.contentZone.top}px, Bottom:{" "}
                {layoutBounds.contentZone.bottom}px)
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded w-max self-end border border-cyan-500/30">
              <span>
                Safe Area ({layoutBounds.safeArea.width}x
                {layoutBounds.safeArea.height})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
