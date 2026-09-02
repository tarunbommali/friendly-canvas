import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCarouselStore } from "../store/carouselStore";
import { renderSlideToDataUrl } from "../canvas/exportRenderer";
import { routes } from "../../../shared/config/routes";
import {
  Type,
  Square,
  Circle as CircleIcon,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  FileImage,
  Grid,
  Undo2,
  Redo2,
  Magnet,
  ArrowLeft,
  Settings,
  Edit3,
  Layout,
  Maximize2,
  Lock,
  Unlock,
  Layers,
  Sliders,
  Save,
  Check,
} from "lucide-react";
import { THEME } from "../theme/theme";
import { createElementId } from "../theme/elementClassify";

export function Toolbar({ onOpenSettings, currentPost, mobileDrawer, onToggleMobileDrawer }) {
  const { projectSlug } = useParams();
  const activeSlug = projectSlug || currentPost?.projectId || currentPost?.projectSlug || 'swe-notebook';
  const backToHomeUrl = routes.contentHub ? routes.contentHub(activeSlug) : `/${activeSlug}/content`;

  const imageInputRef = useRef(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const addElement = useCarouselStore((state) => state.addElement);
  const undo = useCarouselStore((state) => state.undo);
  const redo = useCarouselStore((state) => state.redo);
  const historyPast = useCarouselStore((state) => state.historyPast);
  const historyFuture = useCarouselStore((state) => state.historyFuture);
  const zoom = useCarouselStore((state) => state.zoom);
  const setZoom = useCarouselStore((state) => state.setZoom);
  const showSafeAreaGuides = useCarouselStore(
    (state) => state.showSafeAreaGuides
  );
  const toggleSafeAreaGuides = useCarouselStore(
    (state) => state.toggleSafeAreaGuides
  );
  const snapToGuides = useCarouselStore((state) => state.snapToGuides);
  const toggleSnapToGuides = useCarouselStore((state) => state.toggleSnapToGuides);
  const document = useCarouselStore((state) => state.document);
  const updateCarouselMetadata = useCarouselStore((state) => state.updateCarouselMetadata);
  const applyBgColorToAllSlides = useCarouselStore(
    (state) => state.applyBgColorToAllSlides
  );
  const applyBgPatternToAllSlides = useCarouselStore(
    (state) => state.applyBgPatternToAllSlides
  );
  const updateGlobalLayoutConfig = useCarouselStore(
    (state) => state.updateGlobalLayoutConfig
  );
  const globalLayoutConfig = useCarouselStore((state) => state.globalLayoutConfig);
  const isZoomLocked = useCarouselStore((state) => state.isZoomLocked);
  const toggleZoomLock = useCarouselStore((state) => state.toggleZoomLock);

  const activeSlide = document.slides.find(
    (s) => s.id === document.activeSlideId
  );

  const canvasWidth = document.metadata.width || 1080;
  const canvasHeight = document.metadata.height || 1350;

  const addText = (preset = "heading") => {
    const isHeading = preset === "heading";
    const textX = THEME.contentZone.x;
    const textY = isHeading ? THEME.contentZone.y : 459;

    addElement({
      id: createElementId(isHeading ? "headline" : "text"),
      type: isHeading ? "headline" : "text",
      x: textX,
      y: textY,
      width: THEME.contentZone.width,
      text: isHeading ? "Headline Text" : "Body text paragraph goes here...",
      fontSize: isHeading
        ? THEME.typography.headline.fontSize
        : THEME.typography.body.fontSize,
      fontFamily: isHeading
        ? THEME.typography.headline.fontFamily
        : THEME.typography.body.fontFamily,
      fill: isHeading ? THEME.colors.textPrimary : THEME.colors.textSecondary,
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
      id: createElementId("rect"),
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
      id: createElementId("circle"),
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
        id: createElementId("image"),
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

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveDocument = () => {
    try {
      const docKey = `friendly_canvas_doc_${document.id || currentPost?.id || 'active'}`;
      localStorage.setItem(docKey, JSON.stringify(document));
      localStorage.setItem(
        'friendly_canvas_last_saved',
        JSON.stringify({
          id: document.id || currentPost?.id || 'active',
          title: document.metadata?.title || 'Untitled Post',
          savedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const downloadAllSlidesPNG = async () => {
    const slides = document.slides;
    if (!slides || slides.length === 0) return;

    const safeTitle = (document.metadata.title || "carousel")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    for (let i = 0; i < slides.length; i++) {
      try {
        const dataUrl = await renderSlideToDataUrl(slides[i], document.metadata, 2);
        const link = window.document.createElement("a");
        link.href = dataUrl;
        link.download = `${safeTitle}-slide-${i + 1}.png`;
        link.click();
        // Small gap between downloads so the browser doesn't block them
        await new Promise((r) => setTimeout(r, 100));
      } catch (err) {
        console.error(`Failed to export slide ${i + 1}:`, err);
      }
    }
  };

  return (
    <header className="h-12 bg-white dark:bg-[#151821] border-b border-[#e2e8f0] dark:border-white/10 px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4 shrink-0 select-none z-50 overflow-x-auto no-scrollbar shadow-2xs">
      {/* Left: Title + Mobile Toggles */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Mobile Drawer Toggles */}
        {onToggleMobileDrawer && (
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={() => onToggleMobileDrawer("slides")}
              className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                mobileDrawer === "slides"
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                  : "bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-white/10"
              }`}
              title="Toggle Slides Drawer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{document.slides.length}</span>
            </button>

            <button
              onClick={() => onToggleMobileDrawer("properties")}
              className={`p-1.5 rounded text-xs border transition-colors cursor-pointer ${
                mobileDrawer === "properties"
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                  : "bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-white/10"
              }`}
              title="Toggle Properties Panel"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block" />
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest leading-none truncate max-w-[140px] sm:max-w-[200px]">
            {currentPost?.collectionName
              ? `${currentPost.collectionName} • #${currentPost.designNo || 1}`
              : "FRIENDLY CANVAS STUDIO"}
          </span>
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={document.metadata.title || ""}
              onChange={(e) => updateCarouselMetadata({ title: e.target.value })}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditingTitle(false);
              }}
              className="bg-white dark:bg-slate-900 border border-blue-500 rounded px-1.5 py-0 text-xs font-semibold text-gray-900 dark:text-slate-100 focus:outline-none shadow-2xs"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group leading-tight"
              title="Click to edit title"
            >
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{document.metadata.title || "Untitled Post"}</span>
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-gray-400 dark:text-slate-500 transition-opacity" />
            </h1>
          )}
        </div>
      </div>

      {/* Center: Tools Navigation Bar & Background Controls */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <nav className="flex items-center gap-1 bg-gray-50 dark:bg-slate-900 p-0.5 rounded-lg border border-gray-200 dark:border-white/10">
          <button
            onClick={() => addText("heading")}
            className="px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
            title="Add Heading"
          >
            <Type className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Heading</span>
          </button>
          <button
            onClick={() => addText("body")}
            className="px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
            title="Add Body Text"
          >
            <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Body</span>
          </button>
          <button
            onClick={addRectangle}
            className="p-1.5 rounded text-gray-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Add Rectangle"
          >
            <Square className="w-3.5 h-3.5 text-amber-500" />
          </button>
          <button
            onClick={addCircle}
            className="p-1.5 rounded text-gray-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Add Circle"
          >
            <CircleIcon className="w-3.5 h-3.5 text-pink-500" />
          </button>
          <label
            className="p-1.5 rounded text-gray-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all"
            title="Upload Image"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </nav>

        {/* Canvas & Background Controls (Applies to ALL slides) */}
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-1" title="Canvas Aspect Ratio">
            <Maximize2 className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            <select
              value={globalLayoutConfig?.aspectRatio || document.metadata.aspectRatio || "4:5"}
              onChange={(e) => updateGlobalLayoutConfig({ aspectRatio: e.target.value })}
              className="bg-transparent text-gray-800 dark:text-slate-200 font-mono font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="4:5" className="dark:bg-slate-900">4:5 (Portrait)</option>
              <option value="1:1" className="dark:bg-slate-900">1:1 (Square)</option>
              <option value="9:16" className="dark:bg-slate-900">9:16 (Story)</option>
              <option value="16:9" className="dark:bg-slate-900">16:9 (Landscape)</option>
            </select>
          </div>

          <div className="h-3 w-[1px] bg-gray-200 dark:bg-white/10" />

          {/* All-Slides Background Color Picker */}
          <div className="flex items-center gap-1" title="Change Background Color for ALL Slides">
            <input
              type="color"
              value={activeSlide?.backgroundColor || "#ffffff"}
              onChange={(e) => applyBgColorToAllSlides(e.target.value)}
              className="w-4 h-4 rounded border border-gray-300 dark:border-slate-700 bg-transparent cursor-pointer p-0"
            />
            <span className="font-mono text-[10px] text-gray-600 dark:text-slate-400 uppercase hidden lg:inline">
              {activeSlide?.backgroundColor || "#ffffff"}
            </span>
          </div>

          <div className="h-3 w-[1px] bg-gray-200 dark:bg-white/10 hidden md:block" />

          {/* All-Slides Background Pattern Dropdown */}
          <select
            value={activeSlide?.bgPattern || globalLayoutConfig?.bgPattern || "solid"}
            onChange={(e) => applyBgPatternToAllSlides(e.target.value)}
            className="bg-transparent text-gray-700 dark:text-slate-300 text-xs font-sans focus:outline-none cursor-pointer hidden md:block"
            title="Change Background Pattern for ALL Slides"
          >
            <option value="solid" className="dark:bg-slate-900">Solid (Plain)</option>
            <option value="paper" className="dark:bg-slate-900">Warm Paper</option>
            <option value="grid" className="dark:bg-slate-900">Notebook Grid</option>
            <option value="dots" className="dark:bg-slate-900">Dot Grid</option>
            <option value="blueprint" className="dark:bg-slate-900">Blueprint Grid</option>
            <option value="texture" className="dark:bg-slate-900">Tactile Grain</option>
          </select>
        </div>
      </div>

      {/* Right: Snap, Zoom, Undo, Save & Export */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="flex items-center gap-1.5 md:gap-2 bg-gray-50 dark:bg-slate-900 px-2 py-1 rounded-full border border-gray-200 dark:border-white/10 text-xs hidden md:flex">
          {/* Snap */}
          <button
            onClick={toggleSnapToGuides}
            className={`flex items-center gap-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${
              snapToGuides ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
            title="Toggle Snap to Guides"
          >
            <Magnet className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">SNAP</span>
          </button>

          <div className="h-3 w-[1px] bg-gray-200 dark:bg-white/10" />

          {/* Guides */}
          <button
            onClick={toggleSafeAreaGuides}
            className={`flex items-center gap-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${
              showSafeAreaGuides ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
            title="Toggle Safe Area Guides"
          >
            <Grid className="w-3 h-3" />
            <span className="hidden sm:inline">GUIDES</span>
          </button>

          <div className="h-3 w-[1px] bg-gray-200 dark:bg-white/10" />

          {/* Zoom & Lock */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(Math.max(0.2, Math.round((zoom - 0.1) * 10) / 10))}
              disabled={isZoomLocked}
              className={`p-0.5 rounded transition-colors ${
                isZoomLocked ? "text-gray-300 dark:text-slate-600 cursor-not-allowed" : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 cursor-pointer"
              }`}
              title={isZoomLocked ? "Zoom is locked at 100%" : "Zoom Out"}
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span
              className="text-[10px] font-mono font-bold text-gray-700 dark:text-slate-300 px-0.5"
              title="Canvas Zoom Level"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2.0, Math.round((zoom + 0.1) * 10) / 10))}
              disabled={isZoomLocked}
              className={`p-0.5 rounded transition-colors ${
                isZoomLocked ? "text-gray-300 dark:text-slate-600 cursor-not-allowed" : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 cursor-pointer"
              }`}
              title={isZoomLocked ? "Zoom is locked at 100%" : "Zoom In"}
            >
              <ZoomIn className="w-3 h-3" />
            </button>

            {/* Lock symbol only */}
            <button
              onClick={toggleZoomLock}
              className={`p-1 rounded transition-all cursor-pointer ${
                isZoomLocked
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"
              }`}
              title={
                isZoomLocked
                  ? "Zoom Locked at 100% (Click to unlock zoom)"
                  : "Zoom Unlocked (Click to lock zoom at 100%)"
              }
            >
              {isZoomLocked ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Unlock className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-slate-900 p-0.5 rounded-lg border border-gray-200 dark:border-white/10">
          <button
            onClick={undo}
            disabled={historyPast.length === 0}
            className={`p-1 rounded transition-colors ${
              historyPast.length > 0 ? "text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white cursor-pointer" : "text-gray-300 dark:text-slate-600 cursor-not-allowed"
            }`}
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={historyFuture.length === 0}
            className={`p-1 rounded transition-colors ${
              historyFuture.length > 0 ? "text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white cursor-pointer" : "text-gray-300 dark:text-slate-600 cursor-not-allowed"
            }`}
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Save CTA */}
        <button
          onClick={handleSaveDocument}
          className={`px-3.5 py-1 rounded-md text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${
            isSaved
              ? "bg-emerald-600 text-white shadow-emerald-600/20"
              : "bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10"
          }`}
          title="Save Canvas Document"
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>SAVED!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>SAVE</span>
            </>
          )}
        </button>

        {/* Export CTA */}
        <button
          onClick={downloadAllSlidesPNG}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1 rounded-md text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          title="Export All Slides as PNG"
        >
          <span>EXPORT</span>
          <FileImage className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
