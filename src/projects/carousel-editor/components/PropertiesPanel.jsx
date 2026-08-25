import { useCarouselStore } from "../store/carouselStore";
import { Trash2, Sliders, Image as ImageIcon } from "lucide-react";

export function PropertiesPanel() {
  const document = useCarouselStore((state) => state.document);
  const selectedElementId = useCarouselStore((state) => state.selectedElementId);
  const updateElement = useCarouselStore((state) => state.updateElement);
  const deleteElement = useCarouselStore((state) => state.deleteElement);
  const updateSlideBackground = useCarouselStore(
    (state) => state.updateSlideBackground
  );

  const canvasWidth = document.metadata.width || 1080;
  const canvasHeight = document.metadata.height || 1080;

  const activeSlide = document.slides.find(
    (s) => s.id === document.activeSlideId
  );

  const selectedElement = activeSlide?.elements.find(
    (el) => el.id === selectedElementId
  );

  const centerHorizontally = () => {
    if (!selectedElement) return;
    const elWidth = selectedElement.width || (selectedElement.radius ? selectedElement.radius * 2 : 400);
    const newX = Math.round((canvasWidth - elWidth) / 2);
    updateElement(selectedElement.id, { x: newX });
  };

  const centerVertically = () => {
    if (!selectedElement) return;
    const elHeight = selectedElement.height || (selectedElement.radius ? selectedElement.radius * 2 : 300);
    const newY = Math.round((canvasHeight - elHeight) / 2);
    updateElement(selectedElement.id, { y: newY });
  };

  const centerBoth = () => {
    if (!selectedElement) return;
    const elWidth = selectedElement.width || (selectedElement.radius ? selectedElement.radius * 2 : 400);
    const elHeight = selectedElement.height || (selectedElement.radius ? selectedElement.radius * 2 : 300);
    const newX = Math.round((canvasWidth - elWidth) / 2);
    const newY = Math.round((canvasHeight - elHeight) / 2);
    updateElement(selectedElement.id, { x: newX, y: newY });
  };

  // If no element is selected, show Slide properties
  if (!selectedElement) {
    return (
      <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 h-full flex flex-col gap-4 text-xs text-slate-300">
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
      {selectedElement.type === "text" && (
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
          <label className="block text-slate-500 mb-1">Align Element</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={centerHorizontally}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] font-medium transition-colors"
              title="Center Horizontally on Canvas"
            >
              ↔ Center H
            </button>
            <button
              onClick={centerVertically}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] font-medium transition-colors"
              title="Center Vertically on Canvas"
            >
              ↕ Center V
            </button>
            <button
              onClick={centerBoth}
              className="py-1 px-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded border border-blue-500 text-[11px] font-medium transition-colors"
              title="Center Horizontally & Vertically"
            >
              ⤢ Both
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
