import { useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";
import { useCarouselStore } from "../store/carouselStore";
import { renderSlide } from "../canvas/renderer";
import { attachSnapGuideEngine } from "../canvas/snapGuideEngine";
import { getLayoutBounds } from "../theme/layoutBounds";

export function CanvasEditor({ isLayoutMode = false, onLayoutChange }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const isRenderingRef = useRef(false);
  const isEditingTextRef = useRef(false);
  const snapEngineRef = useRef(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const document = useCarouselStore((state) => state.document);
  const zoom = useCarouselStore((state) => state.zoom);
  const setZoom = useCarouselStore((state) => state.setZoom);
  const selectElement = useCarouselStore((state) => state.selectElement);
  const updateElement = useCarouselStore((state) => state.updateElement);
  const deleteElement = useCarouselStore((state) => state.deleteElement);
  const showSafeAreaGuides = useCarouselStore(
    (state) => state.showSafeAreaGuides
  );
  const isZoomLocked = useCarouselStore((state) => state.isZoomLocked);
  const globalLayoutConfig = useCarouselStore(
    (state) => state.globalLayoutConfig
  );

  const activeSlide = document.slides.find(
    (s) => s.id === document.activeSlideId
  );

  const layoutBounds = getLayoutBounds(globalLayoutConfig, document.metadata);
  const canvasWidth = layoutBounds.canvas.width;
  const canvasHeight = layoutBounds.canvas.height;

  const isLayoutModeRef = useRef(isLayoutMode);
  const onLayoutChangeRef = useRef(onLayoutChange);

  useEffect(() => {
    isLayoutModeRef.current = isLayoutMode;
    onLayoutChangeRef.current = onLayoutChange;
  }, [isLayoutMode, onLayoutChange]);

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

  // ── Mouse Wheel: prevent window scroll & adjust canvas zoom if unlocked ────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (isZoomLocked) return;
      const delta = e.deltaY;
      const factor = delta > 0 ? 0.9 : 1.1;
      const nextZoom = Math.min(Math.max(zoom * factor, 0.2), 3);
      setZoom(Number(nextZoom.toFixed(2)));
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [zoom, setZoom, isZoomLocked]);

  // ── Window Scroll Lock: Ensure window never scrolls out of viewport bounds ──
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  // ── Keyboard: arrow-key nudge + Delete/Backspace + Enter to edit ─────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditingTextRef.current) return;
      
      // Don't intercept when typing in an input / textarea / contenteditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const selectedElementId = useCarouselStore.getState().selectedElementId;
      if (!selectedElementId) return;

      const currentSlide = useCarouselStore
        .getState()
        .document.slides.find(
          (s) => s.id === useCarouselStore.getState().document.activeSlideId
        );
      const el = currentSlide?.elements.find((el) => el.id === selectedElementId);
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
        if (!isLayoutMode) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
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
  }, [updateElement, deleteElement, isLayoutMode]);

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

    if (fabricRef.current) {
      try {
        fabricRef.current.dispose();
      } catch {
        // ignore
      }
      fabricRef.current = null;
    }

    const canvas = new Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      selection: true,
    });

    fabricRef.current = canvas;
    useCarouselStore.getState().setFabricCanvas(canvas);

    const onTextSelectionChanged = () => {
      const activeObj = canvas.getActiveObject();
      if (
        activeObj &&
        (activeObj.type === "textbox" ||
          activeObj.type === "i-text" ||
          activeObj.type === "text")
      ) {
        const start = activeObj.selectionStart;
        const end = activeObj.selectionEnd;
        const id = activeObj.get?.("data")?.id || activeObj.data?.id;
        if (id && typeof start === "number" && typeof end === "number" && start !== end) {
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          const selectedText = (activeObj.text || "").slice(min, max);
          useCarouselStore.getState().setActiveTextSelection({
            elementId: id,
            selectionStart: min,
            selectionEnd: max,
            selectedText,
          });
          return;
        }
      }
    };

    const onSelectionCreated = (event) => {
      if (isRenderingRef.current) return;
      const obj = event.selected?.[0];
      if (isLayoutModeRef.current) {
        if (!obj?.data?.isHeadline && !obj?.data?.isPageNumber && !obj?.data?.isSwipe) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          return;
        }
      } else {
        if (obj?.data?.isChrome) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          return;
        }
      }
      const id = obj?.get?.("data")?.id || obj?.data?.id;
      if (id) {
        selectElement(id);
        if (id !== useCarouselStore.getState().activeTextSelection?.elementId) {
          useCarouselStore.getState().setActiveTextSelection(null);
        }
      }
    };

    const onSelectionUpdated = (event) => {
      if (isRenderingRef.current) return;
      const obj = event.selected?.[0];
      if (isLayoutModeRef.current) {
        if (!obj?.data?.isHeadline && !obj?.data?.isPageNumber && !obj?.data?.isSwipe) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          return;
        }
      } else {
        if (obj?.data?.isChrome) return;
      }
      const id = obj?.get?.("data")?.id || obj?.data?.id;
      if (id) {
        selectElement(id);
        if (id !== useCarouselStore.getState().activeTextSelection?.elementId) {
          useCarouselStore.getState().setActiveTextSelection(null);
        }
      }
    };

    const onSelectionCleared = () => {
      if (isRenderingRef.current) return;
      selectElement(null);
      useCarouselStore.getState().setActiveTextSelection(null);
    };

    const onObjectModified = (event) => {
      if (isRenderingRef.current) return;
      const target = event.target;
      if (!target || target.data?.isGuide) return;

      if (isLayoutModeRef.current) {
        const posX = Math.round(target.left ?? 0);
        const posY = Math.round(target.top ?? 0);
        const layoutUpdates = {};

        if (target.data?.isHeadline) {
          layoutUpdates.headlineX = posX;
          layoutUpdates.headlineY = posY;
          if (target.width && target.scaleX) {
            layoutUpdates.headlineWidth = Math.round(target.width * target.scaleX);
          }
        } else if (target.data?.isPageNumber) {
          layoutUpdates.pageNumberX = posX;
          layoutUpdates.pageNumberY = posY;
        } else if (target.data?.isSwipe) {
          layoutUpdates.swipeX = posX;
          layoutUpdates.swipeY = posY;
          layoutUpdates.followX = posX;
          layoutUpdates.followY = posY;
        }

        if (Object.keys(layoutUpdates).length > 0) {
          useCarouselStore.getState().setGlobalLayoutConfig(layoutUpdates);
          useCarouselStore.getState().applyGlobalLayoutConfigToAllSlides();
          onLayoutChangeRef.current?.(layoutUpdates);
        }
        return;
      }

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

    const onDoubleClick = (event) => {
      const target = event.target;
      if (!target) return;
      if (
        target.type === "textbox" ||
        target.type === "i-text" ||
        target.type === "text"
      ) {
        target.enterEditing();
        if (target.hiddenTextarea) {
          target.hiddenTextarea.focus({ preventScroll: true });
          target.hiddenTextarea.style.position = "fixed";
          target.hiddenTextarea.style.top = "0px";
          target.hiddenTextarea.style.left = "0px";
        }
        window.scrollTo(0, 0);
        canvas.requestRenderAll();
      }
    };

    const onEditingEntered = () => {
      isEditingTextRef.current = true;
    };

    const onEditingExited = (event) => {
      isEditingTextRef.current = false;
      const target = event.target;
      const id = target?.get?.("data")?.id || target?.data?.id;
      if (id && target.text !== undefined) {
        const updates = {
          text: target.text,
          width: Math.round(target.width * (target.scaleX || 1)),
          fontSize: Math.round(target.fontSize * (target.scaleY || 1)),
        };
        if (target.styles && Object.keys(target.styles).length > 0) {
          updates.styles = JSON.parse(JSON.stringify(target.styles));
        }
        updateElement(id, updates);
      }
    };

    canvas.on("mouse:dblclick", onDoubleClick);
    canvas.on("text:editing:entered", onEditingEntered);
    canvas.on("text:editing:exited", onEditingExited);
    canvas.on("text:selection:changed", onTextSelectionChanged);
    canvas.on("mouse:up", onTextSelectionChanged);
    canvas.on("selection:created", onSelectionCreated);
    canvas.on("selection:updated", onSelectionUpdated);
    canvas.on("selection:cleared", onSelectionCleared);
    canvas.on("object:modified", onObjectModified);
    canvas.on("text:changed", onTextChanged);

    snapEngineRef.current = attachSnapGuideEngine(canvas, {
      isEnabled: () => useCarouselStore.getState().snapToGuides,
    });

    return () => {
      useCarouselStore.getState().setFabricCanvas(null);
      canvas.off("mouse:dblclick", onDoubleClick);
      canvas.off("text:editing:entered", onEditingEntered);
      canvas.off("text:editing:exited", onEditingExited);
      canvas.off("text:selection:changed", onTextSelectionChanged);
      canvas.off("mouse:up", onTextSelectionChanged);
      canvas.off("selection:created", onSelectionCreated);
      canvas.off("selection:updated", onSelectionUpdated);
      canvas.off("selection:cleared", onSelectionCleared);
      canvas.off("object:modified", onObjectModified);
      canvas.off("text:changed", onTextChanged);
      if (snapEngineRef.current) {
        try {
          if (typeof snapEngineRef.current.detach === "function") {
            snapEngineRef.current.detach();
          } else if (typeof snapEngineRef.current.dispose === "function") {
            snapEngineRef.current.dispose();
          }
        } catch {
          // ignore
        }
        snapEngineRef.current = null;
      }
      try {
        canvas.dispose();
      } catch {
        // ignore
      }
      fabricRef.current = null;
    };
    // Fabric canvas is mounted once on component attachment
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fabricRef.current || !activeSlide) return;

    // Do not rebuild/clear canvas while the user is actively typing directly inside a text element
    const activeObj = fabricRef.current.getActiveObject();
    if (activeObj?.isEditing || isEditingTextRef.current) {
      return;
    }

    isRenderingRef.current = true;

    renderSlide(fabricRef.current, activeSlide, {
      ...document.metadata,
      width: canvasWidth,
      height: canvasHeight,
    }, {
      isLayoutMode,
    });

    const selectedId = useCarouselStore.getState().selectedElementId;
    if (selectedId) {
      const obj = fabricRef.current
        .getObjects()
        .find((o) => (o.get?.("data")?.id || o.data?.id) === selectedId);
      if (obj) {
        fabricRef.current.setActiveObject(obj);
        fabricRef.current.renderAll();
      }
    }

    const timer = setTimeout(() => {
      isRenderingRef.current = false;
    }, 50);

    return () => clearTimeout(timer);
  }, [activeSlide, document.metadata, canvasWidth, canvasHeight, globalLayoutConfig, isLayoutMode]);

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
            className="absolute border-[3px] border-dashed border-cyan-500/80 pointer-events-none rounded-2xl flex flex-col justify-between p-2 z-30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            style={{
              top: `${layoutBounds.safeArea.top}px`,
              left: `${layoutBounds.safeArea.left}px`,
              width: `${layoutBounds.safeArea.width}px`,
              height: `${layoutBounds.safeArea.height}px`,
            }}
          >
            <div className="flex justify-between items-center text-xs font-mono text-cyan-200 font-bold bg-cyan-950/90 px-2.5 py-1 rounded-md w-max border border-cyan-400/50 shadow-md">
              <span>
                SAFE AREA (Top/Bottom: {layoutBounds.safeArea.top}px, L/R:{" "}
                {layoutBounds.safeArea.left}px)
              </span>
            </div>

            {/* Inner Content Zone Boundary with 4-Column Grid Guides */}
            <div
              className="absolute border-2 border-dashed border-amber-500/80 pointer-events-none rounded-xl overflow-hidden shadow-[0_0_10px_rgba(245,158,11,0.1)]"
              style={{
                top: `${layoutBounds.contentZone.top - layoutBounds.safeArea.top}px`,
                left: `${layoutBounds.contentZone.left - layoutBounds.safeArea.left}px`,
                width: `${layoutBounds.contentZone.width}px`,
                height: `${layoutBounds.contentZone.height}px`,
              }}
            >
              <span className="absolute top-1 left-2 text-[11px] font-mono font-bold text-amber-200 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-400/50 shadow-md">
                CONTENT ZONE (Top: {layoutBounds.contentZone.top}px, Bottom:{" "}
                {layoutBounds.contentZone.bottom}px)
              </span>

              {/* 4 Column Grid Overlay Lines (Clean Outlines, No Color Fill Obscuring Text) */}
              <div className="w-full h-full grid grid-cols-4 gap-4 px-2 opacity-40 pointer-events-none">
                <div className="border-x border-amber-400/60 h-full" />
                <div className="border-x border-amber-400/60 h-full" />
                <div className="border-x border-amber-400/60 h-full" />
                <div className="border-x border-amber-400/60 h-full" />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono text-cyan-200 font-bold bg-cyan-950/90 px-2.5 py-1 rounded-md w-max self-end border border-cyan-400/50 shadow-md">
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
