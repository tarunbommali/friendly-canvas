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
  Bold,
  Italic,
  Underline,
  Highlighter,
} from "lucide-react";
import { getLayoutBounds } from "../theme/layoutBounds";
import { isChromeElement } from "../theme/elementClassify";

const TEXT_TYPES = new Set(["text", "headline", "badge", "body"]);

export function PropertiesPanel() {
  const document = useCarouselStore((state) => state.document);
  const selectedElementId = useCarouselStore((state) => state.selectedElementId);
  const updateElement = useCarouselStore((state) => state.updateElement);
  const deleteElement = useCarouselStore((state) => state.deleteElement);
  const updateSlideBackground = useCarouselStore(
    (state) => state.updateSlideBackground
  );
  const updateSlideBgPattern = useCarouselStore(
    (state) => state.updateSlideBgPattern
  );
  const updateGlobalLayoutConfig = useCarouselStore(
    (state) => state.updateGlobalLayoutConfig
  );
  const showSafeAreaGuides = useCarouselStore(
    (state) => state.showSafeAreaGuides
  );
  const toggleSafeAreaGuides = useCarouselStore(
    (state) => state.toggleSafeAreaGuides
  );
  const nudgeElementLayer = useCarouselStore((state) => state.nudgeElementLayer);
  const globalLayoutConfig = useCarouselStore((state) => state.globalLayoutConfig);
  const copySelectedElement = useCarouselStore((state) => state.copySelectedElement);
  const pasteClipboardElement = useCarouselStore((state) => state.pasteClipboardElement);
  const clipboardElement = useCarouselStore((state) => state.clipboardElement);
  const activeTextSelection = useCarouselStore((state) => state.activeTextSelection);
  const setActiveTextSelection = useCarouselStore((state) => state.setActiveTextSelection);

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedElement, setCopiedElement] = useState(false);

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

  const applyTextProperty = (property, value) => {
    if (!selectedElement) return;

    const currentSelection = useCarouselStore.getState().activeTextSelection;
    const canvas = useCarouselStore.getState().fabricCanvas;
    let appliedToRange = false;

    if (canvas) {
      const activeObj =
        canvas.getActiveObject() ||
        canvas.getObjects().find(
          (o) => (o.get?.("data")?.id || o.data?.id) === selectedElement.id
        );

      if (
        activeObj &&
        (activeObj.type === "textbox" ||
          activeObj.type === "i-text" ||
          activeObj.type === "text")
      ) {
        if (
          currentSelection &&
          currentSelection.elementId === selectedElement.id &&
          currentSelection.selectionStart !== currentSelection.selectionEnd
        ) {
          if (typeof activeObj.setSelectionStyles === "function") {
            activeObj.setSelectionStyles(
              { [property]: value },
              currentSelection.selectionStart,
              currentSelection.selectionEnd
            );
            if (typeof activeObj.cleanStyle === "function") {
              activeObj.cleanStyle(property);
            }
            canvas.requestRenderAll();
            const updatedStyles = JSON.parse(
              JSON.stringify(activeObj.styles || {})
            );
            updateElement(selectedElement.id, { styles: updatedStyles });
            appliedToRange = true;
          }
        } else if (
          activeObj.isEditing &&
          typeof activeObj.selectionStart === "number" &&
          typeof activeObj.selectionEnd === "number" &&
          activeObj.selectionStart !== activeObj.selectionEnd
        ) {
          activeObj.setSelectionStyles({ [property]: value });
          if (typeof activeObj.cleanStyle === "function") {
            activeObj.cleanStyle(property);
          }
          canvas.requestRenderAll();
          const updatedStyles = JSON.parse(
            JSON.stringify(activeObj.styles || {})
          );
          updateElement(selectedElement.id, { styles: updatedStyles });
          appliedToRange = true;
        }
      }
    }

    if (!appliedToRange) {
      updateElement(selectedElement.id, { [property]: value });
    }
  };

  // If no element is selected, show Slide properties & Safe Area Specs
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white dark:bg-[#151821] border-l border-[#e2e8f0] dark:border-white/10 p-4 h-full flex flex-col gap-4 text-xs text-gray-700 dark:text-slate-300 overflow-y-auto shrink-0 select-none font-sans shadow-2xs">
        <div className="flex items-center gap-2 text-gray-900 dark:text-slate-100 font-bold border-b border-[#e2e8f0] dark:border-white/10 pb-3">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-mono text-xs uppercase tracking-wider">Slide Properties</span>
        </div>

        {/* Paste from Clipboard quick action */}
        {clipboardElement && (
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 truncate">
                <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="capitalize truncate">{clipboardElement.type || "Element"} in clipboard</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                Ready to paste on this slide
              </p>
            </div>
            <button
              onClick={() => pasteClipboardElement()}
              className="px-2.5 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              title="Paste copied element to this slide (Ctrl+V)"
            >
              <span>Paste</span>
              <span className="text-[9px] opacity-70 font-mono">Ctrl+V</span>
            </button>
          </div>
        )}

        {/* Background Color & Pattern */}
        <div className="space-y-3">
          <div>
            <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
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
                className="w-8 h-8 rounded border border-gray-300 dark:border-slate-700 bg-transparent cursor-pointer p-0"
              />
              <input
                type="text"
                value={activeSlide?.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  activeSlide &&
                  updateSlideBackground(activeSlide.id, e.target.value)
                }
                className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded px-2.5 py-1.5 font-mono text-gray-800 dark:text-slate-200 text-xs focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
              Background Pattern
            </label>
            <select
              value={activeSlide?.bgPattern || globalLayoutConfig?.bgPattern || "solid"}
              onChange={(e) =>
                activeSlide &&
                updateSlideBgPattern(activeSlide.id, e.target.value)
              }
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-sans text-xs focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="solid" className="dark:bg-slate-900">Solid (Plain)</option>
              <option value="paper" className="dark:bg-slate-900">Warm Editorial Paper</option>
              <option value="grid" className="dark:bg-slate-900">Engineering Notebook Grid</option>
              <option value="dots" className="dark:bg-slate-900">Technical Dot Grid</option>
              <option value="blueprint" className="dark:bg-slate-900">Blueprint Grid</option>
              <option value="texture" className="dark:bg-slate-900">Tactile Grain Paper</option>
            </select>
          </div>
        </div>

        {/* AI Image Generation Prompt Card */}
        {(activeSlide?.imagePrompt || activeSlide?.visualDirective) && (
          <div className="border-t border-[#e2e8f0] dark:border-white/10 pt-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1.5 text-xs shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Image Prompt</span>
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      activeSlide.imagePrompt || activeSlide.visualDirective
                    );
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                    copiedPrompt
                      ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                      : "bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50"
                  }`}
                  title="Copy AI Prompt to Clipboard"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Upload Button */}
                <label
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium rounded border border-blue-200 dark:border-blue-700/50 flex items-center gap-1 cursor-pointer transition-all text-[11px]"
                  title="Upload Image Asset"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || !activeSlide) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const imageDataUrl = evt.target.result;
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
          <div className="border-t border-[#e2e8f0] dark:border-white/10 pt-3 space-y-2">
            <span className="font-semibold text-gray-700 dark:text-slate-300">Asset Names</span>
            <div className="flex flex-wrap gap-1.5">
              {activeSlide.assetName.map((name) => (
                <span
                  key={name}
                  className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-[10px] font-mono text-gray-700 dark:text-slate-300"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Editable Safe Area Margins Section */}
        <div className="border-t border-[#e2e8f0] dark:border-white/10 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Safe Area Margins
            </span>
            <button
              onClick={toggleSafeAreaGuides}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                showSafeAreaGuides
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold"
                  : "bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-white/10"
              }`}
            >
              {showSafeAreaGuides ? "Guides ON" : "Guides OFF"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <label className="block text-gray-500 dark:text-slate-400 mb-1">Top (px)</label>
              <input
                type="number"
                value={globalLayoutConfig?.safeAreaMarginTop ?? 80}
                onChange={(e) =>
                  updateGlobalLayoutConfig({
                    safeAreaMarginTop: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-slate-400 mb-1">Bottom (px)</label>
              <input
                type="number"
                value={globalLayoutConfig?.safeAreaMarginBottom ?? 80}
                onChange={(e) =>
                  updateGlobalLayoutConfig({
                    safeAreaMarginBottom: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-slate-400 mb-1">Left (px)</label>
              <input
                type="number"
                value={globalLayoutConfig?.safeAreaMarginLeft ?? 80}
                onChange={(e) =>
                  updateGlobalLayoutConfig({
                    safeAreaMarginLeft: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-slate-400 mb-1">Right (px)</label>
              <input
                type="number"
                value={globalLayoutConfig?.safeAreaMarginRight ?? 80}
                onChange={(e) =>
                  updateGlobalLayoutConfig({
                    safeAreaMarginRight: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Editable Content Zone Bounds */}
        <div className="border-t border-[#e2e8f0] dark:border-white/10 pt-3 space-y-2">
          <span className="font-semibold text-gray-800 dark:text-slate-200">Content Zone Bounds</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <label className="block text-gray-500 dark:text-slate-400 mb-1">Top Clearance (px)</label>
              <input
                type="number"
                value={globalLayoutConfig?.contentTopClearance ?? 210}
                onChange={(e) =>
                  updateGlobalLayoutConfig({
                    contentTopClearance: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-slate-400 mb-1">Bottom Clearance (px)</label>
              <input
                type="number"
                value={globalLayoutConfig?.contentBottomClearance ?? 1180}
                onChange={(e) =>
                  updateGlobalLayoutConfig({
                    contentBottomClearance: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-slate-400 mb-1">Left Padding (px)</label>
              <input
                type="number"
                value={globalLayoutConfig?.contentPaddingLeft ?? 0}
                onChange={(e) =>
                  updateGlobalLayoutConfig({
                    contentPaddingLeft: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-slate-400 mb-1">Right Padding (px)</label>
              <input
                type="number"
                value={globalLayoutConfig?.contentPaddingRight ?? 0}
                onChange={(e) =>
                  updateGlobalLayoutConfig({
                    contentPaddingRight: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="p-2 rounded bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 flex justify-between text-[11px] font-mono mt-1">
            <span className="text-gray-500 dark:text-slate-400">Draw Width:</span>
            <span className="text-gray-900 dark:text-slate-100 font-bold">{layoutBounds.contentZone.width}px</span>
          </div>
        </div>

        <div className="mt-auto p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-[11px] text-gray-500 dark:text-slate-400">
          Click any canvas element to inspect and modify its specific properties.
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-[#151821] border-l border-[#e2e8f0] dark:border-white/10 p-4 h-full flex flex-col gap-4 text-xs text-gray-700 dark:text-slate-300 overflow-y-auto shrink-0 select-none font-sans shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-white/10 pb-3">
        <div className="flex items-center gap-2 text-gray-900 dark:text-slate-100 font-bold">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="capitalize">{selectedElement.type} Element</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              copySelectedElement(selectedElement);
              setCopiedElement(true);
              setTimeout(() => setCopiedElement(false), 2000);
            }}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer ${
              copiedElement
                ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                : "text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-white/10"
            }`}
            title="Copy Element to Clipboard (Ctrl+C)"
          >
            {copiedElement ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
            )}
            <span>{copiedElement ? "Copied!" : "Copy"}</span>
          </button>
          <button
            onClick={() => deleteElement(selectedElement.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded border border-red-200 dark:border-red-900/40 transition-colors cursor-pointer"
            title="Delete Element (Delete / Backspace)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Element Properties */}
      {selectedElement.type === "image" && (
        <div className="space-y-3">
          <div>
            <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
              Image Preview
            </label>
            <div
              className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-1"
            >
              <img
                src={selectedElement.src}
                alt="Selected element"
                style={{
                  borderRadius: `${Math.min(
                    48,
                    (selectedElement.borderRadius ?? selectedElement.rx ?? 0) / 2
                  )}px`,
                }}
                className="max-h-full max-w-full object-contain transition-all"
              />
            </div>
          </div>

          <div>
            <label className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center gap-1.5 cursor-pointer transition-colors w-full">
              <ImageIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
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

          {/* Corner Radius / Rounded Option */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-600 dark:text-slate-400 font-semibold">
                Rounded Corners (Radius)
              </label>
              <span className="font-mono text-gray-700 dark:text-slate-300 text-[11px] font-bold">
                {selectedElement.borderRadius ?? selectedElement.rx ?? 0}px
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="120"
                step="2"
                value={selectedElement.borderRadius ?? selectedElement.rx ?? 0}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    borderRadius: Number(e.target.value),
                    rx: Number(e.target.value),
                    ry: Number(e.target.value),
                  })
                }
                className="flex-1 accent-blue-600 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="999"
                value={selectedElement.borderRadius ?? selectedElement.rx ?? 0}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    borderRadius: Math.max(0, Number(e.target.value)),
                    rx: Math.max(0, Number(e.target.value)),
                    ry: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-14 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1 text-gray-800 dark:text-slate-200 font-mono text-xs text-center focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500"
              />
            </div>

            {/* Quick Rounded Presets */}
            <div className="grid grid-cols-4 gap-1 mt-2">
              {[
                { label: "Square", value: 0 },
                { label: "12px", value: 12 },
                { label: "24px", value: 24 },
                { label: "Pill / Full", value: 99 },
              ].map((preset) => {
                const current = selectedElement.borderRadius ?? selectedElement.rx ?? 0;
                const isSelected =
                  preset.value === 99
                    ? current >= 80
                    : current === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        borderRadius: preset.value,
                        rx: preset.value,
                        ry: preset.value,
                      })
                    }
                    className={`py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Text Element Properties */}
      {TEXT_TYPES.has(selectedElement.type) && (
        <div className="space-y-3">
          <div>
            <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
              Text Content
            </label>
            <textarea
              rows={4}
              value={selectedElement.text || ""}
              onChange={(e) =>
                updateElement(selectedElement.id, { text: e.target.value })
              }
              onSelect={(e) => {
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                if (typeof start === "number" && typeof end === "number" && start !== end) {
                  const min = Math.min(start, end);
                  const max = Math.max(start, end);
                  const selectedText = (selectedElement.text || "").slice(min, max);
                  setActiveTextSelection({
                    elementId: selectedElement.id,
                    selectionStart: min,
                    selectionEnd: max,
                    selectedText,
                  });
                }
              }}
              placeholder="Enter text (press Enter for new line)..."
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-2 text-gray-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none font-sans text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
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
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
                Font Family
              </label>
              <select
                value={
                  selectedElement.fontFamily ||
                  (selectedElement.type === "headline" || selectedElement.id?.includes("head")
                    ? "Instrument Serif"
                    : selectedElement.type === "badge" || selectedElement.id?.includes("badge")
                    ? "Playfair Display"
                    : "Georgia")
                }
                onChange={(e) =>
                  updateElement(selectedElement.id, { fontFamily: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-sans text-xs focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Instrument Serif" className="dark:bg-slate-900">Instrument Serif (Default)</option>
                <option value="Georgia" className="dark:bg-slate-900">Georgia (Serif)</option>
                <option value="Inter" className="dark:bg-slate-900">Inter (Sans)</option>
                <option value="JetBrains Mono" className="dark:bg-slate-900">JetBrains Mono (Mono)</option>
                <option value="Playfair Display" className="dark:bg-slate-900">Playfair Display</option>
                <option value="Roboto" className="dark:bg-slate-900">Roboto</option>
                <option value="Arial" className="dark:bg-slate-900">Arial</option>
              </select>
            </div>
          </div>

          {/* Text Style & Formatting Toolbar (Bold, Italic, Underline) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-gray-600 dark:text-slate-400 font-semibold">
                Text Style &amp; Decoration
              </label>
              {activeTextSelection &&
                activeTextSelection.elementId === selectedElement.id &&
                activeTextSelection.selectedText && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 flex items-center gap-1 font-mono truncate max-w-[130px]"
                    title={`Selected: "${activeTextSelection.selectedText}"`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                    <span className="truncate">"{activeTextSelection.selectedText}"</span>
                  </span>
                )}
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1">
              <button
                type="button"
                onClick={() => {
                  const nextWeight =
                    selectedElement.fontWeight === "bold" ||
                    selectedElement.fontWeight === "700" ||
                    selectedElement.fontWeight === "800"
                      ? "normal"
                      : "bold";
                  applyTextProperty("fontWeight", nextWeight);
                }}
                className={`py-1.5 rounded flex items-center justify-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                  selectedElement.fontWeight === "bold" ||
                  selectedElement.fontWeight === "700" ||
                  selectedElement.fontWeight === "800"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
                }`}
                title="Bold (Selection or Element)"
              >
                <Bold className="w-3.5 h-3.5" />
                <span>Bold</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextStyle =
                    selectedElement.fontStyle === "italic" ? "normal" : "italic";
                  applyTextProperty("fontStyle", nextStyle);
                }}
                className={`py-1.5 rounded flex items-center justify-center gap-1 text-xs italic transition-colors cursor-pointer ${
                  selectedElement.fontStyle === "italic"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
                }`}
                title="Italic (Selection or Element)"
              >
                <Italic className="w-3.5 h-3.5" />
                <span>Italic</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextUnderline = !Boolean(selectedElement.underline);
                  applyTextProperty("underline", nextUnderline);
                }}
                className={`py-1.5 rounded flex items-center justify-center gap-1 text-xs underline transition-colors cursor-pointer ${
                  selectedElement.underline
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
                }`}
                title="Underline (Selection or Element)"
              >
                <Underline className="w-3.5 h-3.5" />
                <span>Underline</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
              Font Weight
            </label>
            <select
              value={selectedElement.fontWeight || "normal"}
              onChange={(e) =>
                applyTextProperty("fontWeight", e.target.value)
              }
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 cursor-pointer focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
            >
              <option value="normal" className="dark:bg-slate-900">Regular</option>
              <option value="500" className="dark:bg-slate-900">Medium</option>
              <option value="600" className="dark:bg-slate-900">Semibold</option>
              <option value="700" className="dark:bg-slate-900">Bold</option>
              <option value="800" className="dark:bg-slate-900">Extra Bold</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
              Text Alignment
            </label>
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1">
              <button
                type="button"
                onClick={() =>
                  updateElement(selectedElement.id, {
                    textAlign: "left",
                    originX: "left",
                    x: layoutBounds.contentZone.left,
                    width: layoutBounds.contentZone.width,
                  })
                }
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-xs transition-colors cursor-pointer ${
                  (selectedElement.textAlign || "left") === "left"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
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
                    width: layoutBounds.contentZone.width,
                  })
                }
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-xs transition-colors cursor-pointer ${
                  selectedElement.textAlign === "center"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
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
                    width: layoutBounds.contentZone.width,
                  })
                }
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-xs transition-colors cursor-pointer ${
                  selectedElement.textAlign === "right"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" /> Right
              </button>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-gray-600 dark:text-slate-400 font-semibold">
                Text Color
              </label>
              {activeTextSelection &&
                activeTextSelection.elementId === selectedElement.id &&
                activeTextSelection.selectedText && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 flex items-center gap-1 font-mono truncate max-w-[130px]"
                    title={`Selected: "${activeTextSelection.selectedText}"`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                    <span className="truncate">"{activeTextSelection.selectedText}"</span>
                  </span>
                )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.fill || "#000000"}
                onChange={(e) => applyTextProperty("fill", e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 dark:border-slate-700 bg-transparent cursor-pointer p-0"
              />
              <input
                type="text"
                value={selectedElement.fill || "#000000"}
                onChange={(e) => applyTextProperty("fill", e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded px-2.5 py-1.5 font-mono text-gray-800 dark:text-slate-200 text-xs focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Text Highlight / Background Color */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-600 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                <span>Text Background / Highlight</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.textBackgroundColor || "#fff176"}
                onChange={(e) =>
                  applyTextProperty("textBackgroundColor", e.target.value)
                }
                className="w-8 h-8 rounded border border-gray-300 dark:border-slate-700 bg-transparent cursor-pointer p-0"
              />
              <input
                type="text"
                value={selectedElement.textBackgroundColor || ""}
                placeholder="Transparent (no highlight)"
                onChange={(e) =>
                  applyTextProperty("textBackgroundColor", e.target.value)
                }
                className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded px-2.5 py-1.5 font-mono text-gray-800 dark:text-slate-200 text-xs placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
              {selectedElement.textBackgroundColor && (
                <button
                  type="button"
                  onClick={() => applyTextProperty("textBackgroundColor", "")}
                  className="text-[10px] text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded border border-gray-200 dark:border-white/10 cursor-pointer shrink-0 font-medium"
                  title="Remove Highlight"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Highlight Preset Palettes */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-mono mr-0.5">Presets:</span>
              {[
                { name: "Yellow", color: "#FFF176" },
                { name: "Sepia / Coral", color: "#FAD4C0" },
                { name: "Lime", color: "#D8F5A2" },
                { name: "Soft Cyan", color: "#BFE8FF" },
                { name: "Lavender", color: "#F5C6EA" },
              ].map((swatch) => (
                <button
                  key={swatch.color}
                  type="button"
                  onClick={() => applyTextProperty("textBackgroundColor", swatch.color)}
                  style={{ backgroundColor: swatch.color }}
                  title={`${swatch.name} (${swatch.color})`}
                  className="w-5 h-5 rounded-md border border-gray-300 dark:border-slate-700 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                />
              ))}
              <button
                type="button"
                onClick={() => applyTextProperty("textBackgroundColor", "")}
                className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 transition-colors cursor-pointer"
                title="Remove text background"
              >
                None
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rect & Circle Shape Properties */}
      {(selectedElement.type === "rect" || selectedElement.type === "circle") && (
        <div className="space-y-3">
          <div>
            <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
              Fill Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.fill || "#3b82f6"}
                onChange={(e) =>
                  updateElement(selectedElement.id, { fill: e.target.value })
                }
                className="w-8 h-8 rounded border border-gray-300 dark:border-slate-700 bg-transparent cursor-pointer p-0"
              />
              <input
                type="text"
                value={selectedElement.fill || "#3b82f6"}
                onChange={(e) =>
                  updateElement(selectedElement.id, { fill: e.target.value })
                }
                className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded px-2.5 py-1.5 font-mono text-gray-800 dark:text-slate-200 text-xs focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
              Stroke Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.stroke || "#000000"}
                onChange={(e) =>
                  updateElement(selectedElement.id, { stroke: e.target.value })
                }
                className="w-8 h-8 rounded border border-gray-300 dark:border-slate-700 bg-transparent cursor-pointer p-0"
              />
              <input
                type="text"
                value={selectedElement.stroke || "#000000"}
                onChange={(e) =>
                  updateElement(selectedElement.id, { stroke: e.target.value })
                }
                className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded px-2.5 py-1.5 font-mono text-gray-800 dark:text-slate-200 text-xs focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 dark:text-slate-400 font-semibold mb-1">
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
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Position & Geometry Properties */}
      <div className="border-t border-[#e2e8f0] dark:border-white/10 pt-3 space-y-3">
        <span className="block font-semibold text-gray-800 dark:text-slate-200">Transform</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-gray-500 dark:text-slate-400 mb-1">X Position</label>
            <input
              type="number"
              value={Math.round(selectedElement.x || 0)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  x: Number(e.target.value),
                })
              }
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-slate-400 mb-1">Y Position</label>
            <input
              type="number"
              value={Math.round(selectedElement.y || 0)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  y: Number(e.target.value),
                })
              }
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-slate-400 mb-1">Width (px)</label>
            <input
              type="number"
              value={Math.round(selectedElement.width || (selectedElement.radius ? selectedElement.radius * 2 : 0))}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (selectedElement.type === "circle") {
                  updateElement(selectedElement.id, {
                    width: val,
                    height: val,
                    radius: Math.round(val / 2),
                  });
                } else {
                  updateElement(selectedElement.id, { width: val });
                }
              }}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-slate-400 mb-1">Height (px)</label>
            <input
              type="number"
              value={Math.round(selectedElement.height || (selectedElement.radius ? selectedElement.radius * 2 : 0))}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (selectedElement.type === "circle") {
                  updateElement(selectedElement.id, {
                    width: val,
                    height: val,
                    radius: Math.round(val / 2),
                  });
                } else {
                  updateElement(selectedElement.id, { height: val });
                }
              }}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-500 dark:text-slate-400 mb-1">Rotation (°)</label>
            <input
              type="number"
              value={selectedElement.rotation || 0}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  rotation: Number(e.target.value),
                })
              }
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded p-1.5 text-gray-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Instant Alignment Buttons */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-gray-500 dark:text-slate-400 mb-1 font-semibold">Align &amp; Distribute</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={alignLeft}
              className="py-1 px-2 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-white/10 text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="Align Left"
            >
              <AlignLeft className="w-3 h-3" /> Left
            </button>
            <button
              onClick={centerHorizontally}
              className="py-1 px-2 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-white/10 text-[11px] font-medium transition-colors cursor-pointer"
              title="Center Horizontally on Canvas"
            >
              ↔ Center H
            </button>
            <button
              onClick={alignRight}
              className="py-1 px-2 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-white/10 text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="Align Right"
            >
              Right <AlignRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={centerBoth}
              className="py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded border border-blue-600 text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
              title="Center Horizontally & Vertically"
            >
              ⤢ Both Center
            </button>
            <button
              onClick={distributeVertically}
              className="py-1 px-2 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-white/10 text-[11px] font-medium transition-colors cursor-pointer"
              title="Distribute non-chrome elements vertically"
            >
              ↕ Distribute
            </button>
          </div>
        </div>

        {!isChromeElement(selectedElement) && (
          <div className="space-y-1.5 pt-1">
            <label className="block text-gray-500 dark:text-slate-400 mb-1 font-semibold">Layer Order</label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => nudgeElementLayer(selectedElement.id, "front")}
                className="py-1 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer"
                title="Bring to Front"
              >
                <ChevronsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => nudgeElementLayer(selectedElement.id, "forward")}
                className="py-1 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer"
                title="Bring Forward"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => nudgeElementLayer(selectedElement.id, "backward")}
                className="py-1 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer"
                title="Send Backward"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => nudgeElementLayer(selectedElement.id, "back")}
                className="py-1 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer"
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
