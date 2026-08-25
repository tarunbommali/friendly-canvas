import { useRef } from "react";
import { Canvas } from "fabric";
import { useCarouselStore } from "../store/carouselStore";
import { renderSlide } from "../canvas/renderer";
import {
  Type,
  Square,
  Circle as CircleIcon,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  FileImage,
} from "lucide-react";
import { carouselDocumentSchema } from "../schemas/carouselSchema";

export function Toolbar() {
  const imageInputRef = useRef(null);
  const addElement = useCarouselStore((state) => state.addElement);
  const zoom = useCarouselStore((state) => state.zoom);
  const setZoom = useCarouselStore((state) => state.setZoom);
  const document = useCarouselStore((state) => state.document);
  const setDocument = useCarouselStore((state) => state.setDocument);
  const resetToInitial = useCarouselStore((state) => state.resetToInitial);

  const canvasWidth = document.metadata.width || 1080;
  const canvasHeight = document.metadata.height || 1080;

  const addText = (preset = "heading") => {
    const isHeading = preset === "heading";
    const textX = 160;
    const textY = isHeading
      ? Math.round(canvasHeight * 0.22)
      : Math.round(canvasHeight * 0.42);

    addElement({
      id: `text_${Date.now()}`,
      type: "text",
      x: textX,
      y: textY,
      text: isHeading ? "Headline Text" : "Body text paragraph goes here...",
      fontSize: isHeading ? 56 : 32,
      fontFamily: "Inter",
      fill: "#1e293b",
      rotation: 0,
      zIndex: 10,
    });
  };

  const addRectangle = () => {
    const width = 400;
    const height = 300;
    const x = Math.round((canvasWidth - width) / 2);
    const y = Math.round((canvasHeight - height) / 2);

    addElement({
      id: `rect_${Date.now()}`,
      type: "rect",
      x,
      y,
      width,
      height,
      fill: "#3b82f6",
      stroke: "#1e40af",
      strokeWidth: 2,
      rotation: 0,
      zIndex: 10,
    });
  };

  const addCircle = () => {
    const radius = 120;
    const diameter = radius * 2;
    const x = Math.round((canvasWidth - diameter) / 2);
    const y = Math.round((canvasHeight - diameter) / 2);

    addElement({
      id: `circle_${Date.now()}`,
      type: "circle",
      x,
      y,
      radius,
      fill: "#ec4899",
      stroke: "#9d174d",
      strokeWidth: 2,
      rotation: 0,
      zIndex: 10,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const width = 400;
      const height = 400;
      const x = Math.round((canvasWidth - width) / 2);
      const y = Math.round((canvasHeight - height) / 2);

      addElement({
        id: `image_${Date.now()}`,
        type: "image",
        src: dataUrl,
        x,
        y,
        width,
        height,
        rotation: 0,
        zIndex: 10,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const exportJSON = () => {
    const jsonString = JSON.stringify(document, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${document.metadata.title || "carousel"}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllSlidesPNG = async () => {
    const slides = document.slides;
    if (!slides || slides.length === 0) return;

    try {
      const offscreenCanvasEl = window.document.createElement("canvas");
      const offscreenFabric = new Canvas(offscreenCanvasEl, {
        width: document.metadata.width,
        height: document.metadata.height,
      });

      const safeTitle = (document.metadata.title || "carousel")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        renderSlide(offscreenFabric, slide, document.metadata);

        await new Promise((resolve) => setTimeout(resolve, 150));

        const dataUrl = offscreenFabric.toDataURL({
          format: "png",
          multiplier: 2,
        });

        const link = window.document.createElement("a");
        link.href = dataUrl;
        link.download = `${safeTitle}-slide-${i + 1}.png`;
        link.click();
      }

      offscreenFabric.dispose();
    } catch (err) {
      console.error("Failed to export slides as PNG:", err);
      alert("Error exporting slides: " + err.message);
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = JSON.parse(event.target.result);
        const parsed = carouselDocumentSchema.safeParse(rawJson);
        if (parsed.success) {
          setDocument(parsed.data);
          alert("Carousel JSON imported successfully!");
        } else {
          alert("Invalid Carousel JSON schema: " + parsed.error.message);
        }
      } catch (err) {
        alert("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-4">
      {/* Left: Element Insertion Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => addText("heading")}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Type className="w-4 h-4 text-blue-400" />
          <span>Add Heading</span>
        </button>
        <button
          onClick={() => addText("body")}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Type className="w-4 h-4 text-emerald-400" />
          <span>Add Body Text</span>
        </button>
        <button
          onClick={addRectangle}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Square className="w-4 h-4 text-amber-400" />
          <span>Rectangle</span>
        </button>
        <button
          onClick={addCircle}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <CircleIcon className="w-4 h-4 text-pink-400" />
          <span>Circle</span>
        </button>
        <label
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          title="Upload External Image"
        >
          <ImageIcon className="w-4 h-4 text-purple-400" />
          <span>Add Image</span>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Center: Zoom Controls */}
      <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-xs text-slate-300">
        <button
          onClick={() => setZoom(Math.max(0.2, Math.round((zoom - 0.1) * 10) / 10))}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="font-mono px-1.5 py-0.5 hover:bg-slate-800 rounded text-slate-200 transition-colors text-[11px]"
          title="Click to Reset to 100% Fit"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom(Math.min(2.0, Math.round((zoom + 0.1) * 10) / 10))}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Export & Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={downloadAllSlidesPNG}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
          title="Download All Slides as High-Res PNG Images"
        >
          <FileImage className="w-4 h-4" />
          <span>Download PNGs</span>
        </button>

        <label
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          title="Import JSON Document"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Import JSON</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </label>
        <button
          onClick={exportJSON}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          title="Export JSON Document"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export JSON</span>
        </button>
        <button
          onClick={resetToInitial}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700"
          title="Reset to Sample Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
