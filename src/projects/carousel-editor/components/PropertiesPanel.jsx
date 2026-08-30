import { useState } from "react";
import { useCarouselStore } from "../store/carouselStore";
import {
  Trash2,
  Sliders,
  Image as ImageIcon,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Copy,
  Check,
  Upload,
  ChevronsUp,
  ChevronsDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { getLayoutBounds } from "../theme/layoutBounds";
import { isChromeElement } from "../theme/elementClassify";

const TEXT_TYPES = new Set(["text", "headline", "badge"]);

export function PropertiesPanel() {
  const document = useCarouselStore((state) => state.document);
  const selectedElementId = useCarouselStore((state) => state.selectedElementId);
  const updateElement = useCarouselStore((state) => state.updateElement);
  const deleteElement = useCarouselStore((state) => state.deleteElement);
  const updateSlideBackground = useCarouselStore(
    (state) => state.updateSlideBackground
  );
  const showSafeAreaGuides = useCarouselStore(
    (state) => state.showSafeAreaGuides
  );
  const toggleSafeAreaGuides = useCarouselStore(
    (state) => state.toggleSafeAreaGuides
  );
  const nudgeElementLayer = useCarouselStore((state) => state.nudgeElementLayer);
  const globalLayoutConfig = useCarouselStore((state) => state.globalLayoutConfig);

  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const canvasWidth = document.metadata.width || 1080;
  const canvasHeight = document.metadata.height || 1350;
  const layoutBounds = getLayoutBounds(globalLayoutConfig, document.metadata);

  const activeSlide = document.slides.find(
    (s) => s.id === document.activeSlideId
  );

  const selectedElement = activeSlide?.elements.find(
    (el) => el.id === selectedElementId
  );

  const centerHorizontally = () => {
    if (!selectedElement) return;
    const elWidth =
      (selectedElement.width ||
        (selectedElement.radius ? selectedElement.radius * 2 : 400)) *
      (selectedElement.scaleX || 1);

    let newX;
    if (selectedElement.originX === "center") {
      newX = Math.round(canvasWidth / 2);
    } else if (selectedElement.originX === "right") {
      newX = Math.round((canvasWidth + elWidth) / 2);
    } else {
      newX = Math.round((canvasWidth - elWidth) / 2);
    }
    updateElement(selectedElement.id, { x: newX });
  };

  const centerVertically = () => {
    if (!selectedElement) return;
    const elHeight =
      (selectedElement.height ||
        (selectedElement.radius ? selectedElement.radius * 2 : 300)) *
      (selectedElement.scaleY || 1);

    let newY;
    if (selectedElement.originY === "center") {
      newY = Math.round(canvasHeight / 2);
    } else if (selectedElement.originY === "bottom") {
      newY = Math.round((canvasHeight + elHeight) / 2);
    } else {
      newY = Math.round((canvasHeight - elHeight) / 2);
    }
    updateElement(selectedElement.id, { y: newY });
  };

  const centerBoth = () => {
    centerHorizontally();
    centerVertically();
  };

  const alignLeft = () => {
    if (!selectedElement) return;
    const elWidth =
      (selectedElement.width ||
        (selectedElement.radius ? selectedElement.radius * 2 : 0)) *
      (selectedElement.scaleX || 1);
    let newX = 0;
    if (selectedElement.originX === "center") newX = Math.round(elWidth / 2);
    else if (selectedElement.originX === "right") newX = Math.round(elWidth);
    updateElement(selectedElement.id, { x: newX });
  };

  const alignRight = () => {
    if (!selectedElement) return;
    const elWidth =
      (selectedElement.width ||
        (selectedElement.radius ? selectedElement.radius * 2 : 0)) *
      (selectedElement.scaleX || 1);
    let newX = canvasWidth;
    if (selectedElement.originX === "left") newX = Math.round(canvasWidth - elWidth);
    else if (selectedElement.originX === "center") {
      newX = Math.round(canvasWidth - elWidth / 2);
    }
    updateElement(selectedElement.id, { x: newX });
  };

  const distributeVertically = () => {
    if (!activeSlide) return;
    const targets = activeSlide.elements.filter((el) => !isChromeElement(el));
    if (targets.length < 3) return;
    const sorted = [...targets].sort((a, b) => (a.y || 0) - (b.y || 0));
    const first = sorted[0].y || 0;
    const last = sorted[sorted.length - 1].y || 0;
    if (last === first) return;
    const gap = (last - first) / (sorted.length - 1);
    sorted.forEach((el, index) => {
      if (index === 0 || index === sorted.length - 1) return;
      updateElement(el.id, { y: Math.round(first + gap * index) });
    });
  };

  // If no element is selected, show Slide properties & Safe Area Specs
  if (!selectedElement) {
    return (
      <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 h-full flex flex-col gap-4 text-xs text-slate-300 overflow-y-auto">
        <div className="flex items-center gap-2 text-slate-200 font-semibold border-b border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Slide Properties</span>
        </div>

        <div className="space-y-2">
          <label className="block text-slate-400 font-medium">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={activeSlide?.backgroundColor || "#ffffff"}
              onChange={(e) =>
                activeSlide &&
                updateSlideBackground(activeSlide.id, e.target.value)
              }
              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={activeSlide?.backgroundColor || "#ffffff"}
              onChange={(e) =>
                activeSlide &&
                updateSlideBackground(activeSlide.id, e.target.value)
              }
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 font-mono text-slate-200"
            />
          </div>
        </div>

        {/* AI Image Generation Prompt Card */}
        {(activeSlide?.imagePrompt || activeSlide?.visualDirective) && (
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Image Prompt
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-900/40 space-y-2">
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans select-text">
                {activeSlide.imagePrompt || activeSlide.visualDirective}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      activeSlide.imagePrompt || activeSlide.visualDirective
                    );
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className="flex-1 py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium rounded border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors text-[11px]"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
                <label className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[11px]">
                  <Upload className="w-3 h-3" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || !activeSlide) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const imageDataUrl = evt.target.result;
                        // Replace or create image element on canvas
                        const existingPlaceholder = activeSlide.elements.find(
                          (el) => el.isPlaceholder || el.id?.includes("placeholder")
                        );
                        if (existingPlaceholder) {
                          updateElement(existingPlaceholder.id, {
                            type: "image",
                            src: imageDataUrl,
                            isPlaceholder: false,
                            strokeDashArray: null,
                          });
                        } else {
                          useCarouselStore.getState().addElement({
                            id: `img_${Date.now()}`,
                            type: "image",
                            src: imageDataUrl,
                            x: layoutBounds.canvas.width / 2,
                            y: 794,
                            width: 760,
                            height: 480,
                            originX: "center",
                            originY: "center",
                            rotation: 0,
                            zIndex: 10,
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {Array.isArray(activeSlide?.assetName) && activeSlide.assetName.length > 0 && (
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <span className="font-semibold text-slate-300">Asset Names</span>
            <div className="flex flex-wrap gap-1.5">
              {activeSlide.assetName.map((name) => (
                <span
                  key={name}
                  className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-[10px] font-mono text-slate-300"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Safe Area Margins Section */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-cyan-400" /> Safe Area Margins
            </span>
            <button
              onClick={toggleSafeAreaGuides}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                showSafeAreaGuides
                  ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                  : "bg-slate-950 text-slate-400 border-slate-800"
              }`}
            >
              {showSafeAreaGuides ? "Guides ON" : "Guides OFF"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-500">Top/Bottom:</span>
              <span className="text-cyan-400 font-bold">{layoutBounds.safeArea.top}px</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-500">Left/Right:</span>
              <span className="text-cyan-400 font-bold">{layoutBounds.safeArea.left}px</span>
            </div>
          </div>
        </div>

        {/* Content Zone Padding Specs */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <span className="font-semibold text-slate-300">Content Zone Bounds</span>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-500">Top Clearance:</span>
              <span className="text-amber-400 font-bold">{layoutBounds.contentZone.top}px</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-500">Bottom Clearance:</span>
              <span className="text-amber-400 font-bold">{layoutBounds.contentZone.bottom}px</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-500">Draw Width:</span>
              <span className="text-slate-300 font-bold">{layoutBounds.contentZone.width}px</span>
            </div>
          </div>
        </div>

        <div className="mt-auto p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-500">
          Click any canvas element to inspect and modify its specific properties.
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 h-full flex flex-col gap-4 text-xs text-slate-300 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span className="capitalize">{selectedElement.type} Element</span>
        </div>
        <button
          onClick={() => deleteElement(selectedElement.id)}
          className="p-1.5 text-red-400 hover:bg-red-950/50 rounded transition-colors"
          title="Delete Element"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Image Element Properties */}
      {selectedElement.type === "image" && (
        <div className="space-y-3">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Image Preview
            </label>
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-1">
              <img
                src={selectedElement.src}
                alt="Selected element"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          </div>
          <div>
            <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors w-full">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Replace Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    updateElement(selectedElement.id, { src: evt.target.result });
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Text Element Properties */}
      {TEXT_TYPES.has(selectedElement.type) && (
        <div className="space-y-3">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Text Content
            </label>
            <textarea
              rows={3}
              value={selectedElement.text || ""}
              onChange={(e) =>
                updateElement(selectedElement.id, { text: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Font Size (px)
              </label>
              <input
                type="number"
                value={selectedElement.fontSize || 32}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    fontSize: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Font Family
              </label>
              <select
                value={selectedElement.fontFamily || "Inter"}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    fontFamily: e.target.value,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Monospace</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Font Weight
            </label>
            <select
              value={String(selectedElement.fontWeight || "normal")}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  fontWeight: e.target.value,
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
            >
              <option value="normal">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Text Alignment
            </label>
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-1">
              <button
                type="button"
                onClick={() =>
                  updateElement(selectedElement.id, {
                    textAlign: "left",
                    originX: "left",
                    x: layoutBounds.contentZone.x,
                  })
                }
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-xs transition-colors ${
                  (selectedElement.textAlign || "left") === "left"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" /> Left
              </button>
              <button
                type="button"
                onClick={() =>
                  updateElement(selectedElement.id, {
                    textAlign: "center",
                    originX: "center",
                    x: Math.round(layoutBounds.canvas.width / 2),
                  })
                }
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-xs transition-colors ${
                  selectedElement.textAlign === "center"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" /> Center
              </button>
              <button
                type="button"
                onClick={() =>
                  updateElement(selectedElement.id, {
                    textAlign: "right",
                    originX: "right",
                    x: layoutBounds.contentZone.right,
                  })
                }
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-xs transition-colors ${
                  selectedElement.textAlign === "right"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" /> Right
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.fill || "#000000"}
                onChange={(e) =>
                  updateElement(selectedElement.id, { fill: e.target.value })
                }
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={selectedElement.fill || "#000000"}
                onChange={(e) =>
                  updateElement(selectedElement.id, { fill: e.target.value })
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rect & Circle Shape Properties */}
      {(selectedElement.type === "rect" || selectedElement.type === "circle") && (
        <div className="space-y-3">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Fill Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.fill || "#3b82f6"}
                onChange={(e) =>
                  updateElement(selectedElement.id, { fill: e.target.value })
                }
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={selectedElement.fill || "#3b82f6"}
                onChange={(e) =>
                  updateElement(selectedElement.id, { fill: e.target.value })
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Stroke Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.stroke || "#000000"}
                onChange={(e) =>
                  updateElement(selectedElement.id, { stroke: e.target.value })
                }
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={selectedElement.stroke || "#000000"}
                onChange={(e) =>
                  updateElement(selectedElement.id, { stroke: e.target.value })
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Stroke Width (px)
            </label>
            <input
              type="number"
              value={selectedElement.strokeWidth || 0}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  strokeWidth: Number(e.target.value),
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
            />
          </div>
        </div>
      )}

      {/* Position & Geometry Properties */}
      <div className="border-t border-slate-800 pt-3 space-y-3">
        <span className="block font-semibold text-slate-300">Transform</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-500 mb-1">X Position</label>
            <input
              type="number"
              value={selectedElement.x}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  x: Number(e.target.value),
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Y Position</label>
            <input
              type="number"
              value={selectedElement.y}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  y: Number(e.target.value),
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Rotation (°)</label>
            <input
              type="number"
              value={selectedElement.rotation || 0}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  rotation: Number(e.target.value),
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Instant Alignment Buttons */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-slate-500 mb-1">Align & Distribute</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={alignLeft}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
              title="Align Left"
            >
              <AlignLeft className="w-3 h-3" /> Left
            </button>
            <button
              onClick={centerHorizontally}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] font-medium transition-colors"
              title="Center Horizontally on Canvas"
            >
              ↔ Center H
            </button>
            <button
              onClick={alignRight}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
              title="Align Right"
            >
              Right <AlignRight className="w-3 h-3" />
            </button>
            <button
              onClick={centerVertically}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] font-medium transition-colors"
              title="Align to Right Margin"
            >
              Right →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={centerBoth}
              className="py-1 px-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded border border-blue-500 text-[11px] font-medium transition-colors"
              title="Center Horizontally & Vertically"
            >
              ⤢ Both Center
            </button>
            <button
              onClick={() => {
                if (!activeSlide) return;
                const els = activeSlide.elements.filter((e) => !e.id?.includes("bg") && !e.id?.includes("page"));
                if (els.length < 2) return;
                const minY = THEME.contentZone.y;
                const maxY = THEME.contentZone.bottom - 100;
                const step = (maxY - minY) / (els.length - 1);
                els.forEach((el, idx) => {
                  updateElement(el.id, { y: Math.round(minY + idx * step) });
                });
              }}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] font-medium transition-colors"
              title="Distribute Slide Elements Vertically"
            >
              ↕ Distribute
            </button>
            <button
              onClick={distributeVertically}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] font-medium transition-colors"
              title="Distribute non-chrome elements vertically"
            >
              ↕ Dist V
            </button>
          </div>
        </div>

        {!isChromeElement(selectedElement) && (
          <div className="space-y-1.5 pt-1">
            <label className="block text-slate-500 mb-1">Layer Order</label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => nudgeElementLayer(selectedElement.id, "front")}
                className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center justify-center"
                title="Bring to Front"
              >
                <ChevronsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => nudgeElementLayer(selectedElement.id, "forward")}
                className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center justify-center"
                title="Bring Forward"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => nudgeElementLayer(selectedElement.id, "backward")}
                className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center justify-center"
                title="Send Backward"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => nudgeElementLayer(selectedElement.id, "back")}
                className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center justify-center"
                title="Send to Back"
              >
                <ChevronsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
