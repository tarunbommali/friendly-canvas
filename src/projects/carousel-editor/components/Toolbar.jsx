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
} from "lucide-react";
import { THEME } from "../theme/theme";
import { createElementId } from "../theme/elementClassify";

export function Toolbar({ onOpenSettings, currentPost }) {
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
    <header className="h-11 bg-[#151821] border-b border-white/10 px-4 flex items-center justify-between gap-4 shrink-0 select-none z-50">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          to={backToHomeUrl}
          className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="h-4 w-[1px] bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest leading-none">
            {currentPost?.collectionName
              ? `${currentPost.collectionName} • #${currentPost.designNo || 1}`
              : "WORKSPACE / PROJECT"}
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
              className="bg-[#0f1117] border border-cyan-400 rounded px-1.5 py-0 text-xs font-semibold text-slate-100 focus:outline-none"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-semibold text-slate-100 flex items-center gap-1 cursor-pointer hover:text-cyan-300 transition-colors group leading-tight"
              title="Click to edit title"
            >
              <span className="truncate max-w-[200px]">{document.metadata.title || "Untitled Post"}</span>
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
            </h1>
          )}
        </div>
      </div>

      {/* Center: Tools Navigation Bar & Background Controls */}
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1 bg-[#0f1117] p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => addText("heading")}
            className="px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
            title="Add Heading"
          >
            <Type className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Heading</span>
          </button>
          <button
            onClick={() => addText("body")}
            className="px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
            title="Add Body Text"
          >
            <Type className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Body</span>
          </button>
          <button
            onClick={addRectangle}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            title="Add Rectangle"
          >
            <Square className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            onClick={addCircle}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            title="Add Circle"
          >
            <CircleIcon className="w-3.5 h-3.5 text-pink-400" />
          </button>
          <label
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer transition-all"
            title="Upload Image"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
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
        <div className="flex items-center gap-1.5 bg-[#0f1117] px-2 py-0.5 rounded-lg border border-white/10 text-xs">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-1" title="Canvas Aspect Ratio">
            <Maximize2 className="w-3 h-3 text-cyan-400 shrink-0" />
            <select
              value={globalLayoutConfig?.aspectRatio || document.metadata.aspectRatio || "4:5"}
              onChange={(e) => updateGlobalLayoutConfig({ aspectRatio: e.target.value })}
              className="bg-transparent text-cyan-300 font-mono font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="4:5" className="bg-[#151821] text-slate-200">4:5 (Portrait)</option>
              <option value="1:1" className="bg-[#151821] text-slate-200">1:1 (Square)</option>
              <option value="9:16" className="bg-[#151821] text-slate-200">9:16 (Story)</option>
              <option value="16:9" className="bg-[#151821] text-slate-200">16:9 (Landscape)</option>
            </select>
          </div>

          <div className="h-3 w-[1px] bg-white/10" />

          {/* All-Slides Background Color Picker */}
          <div className="flex items-center gap-1.5" title="Change Background Color for ALL Slides">
            <input
              type="color"
              value={activeSlide?.backgroundColor || "#ffffff"}
              onChange={(e) => applyBgColorToAllSlides(e.target.value)}
              className="w-4 h-4 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <span className="font-mono text-[10px] text-slate-300 uppercase hidden lg:inline">
              {activeSlide?.backgroundColor || "#ffffff"}
            </span>
          </div>

          <div className="h-3 w-[1px] bg-white/10" />

          {/* All-Slides Background Pattern Dropdown */}
          <select
            value={activeSlide?.bgPattern || globalLayoutConfig?.bgPattern || "solid"}
            onChange={(e) => applyBgPatternToAllSlides(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-sans focus:outline-none cursor-pointer"
            title="Change Background Pattern for ALL Slides"
          >
            <option value="solid" className="bg-[#151821] text-slate-200">Solid (Plain)</option>
            <option value="paper" className="bg-[#151821] text-slate-200">Warm Paper</option>
            <option value="grid" className="bg-[#151821] text-slate-200">Notebook Grid</option>
            <option value="dots" className="bg-[#151821] text-slate-200">Dot Grid</option>
            <option value="blueprint" className="bg-[#151821] text-slate-200">Blueprint Grid</option>
            <option value="texture" className="bg-[#151821] text-slate-200">Tactile Grain</option>
          </select>
        </div>
      </div>

      {/* Right: Snap, Zoom, Undo, Settings & Export */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 bg-[#0f1117] px-2.5 py-1 rounded-full border border-white/10 text-xs">
          {/* Snap */}
          <button
            onClick={toggleSnapToGuides}
            className={`flex items-center gap-1 text-[10px] font-mono font-bold transition-all ${
              snapToGuides ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
            }`}
            title="Toggle Snap to Guides"
          >
            <Magnet className="w-3 h-3 text-cyan-400" />
            <span>SNAP</span>
          </button>

          <div className="h-3 w-[1px] bg-white/10" />

          {/* Guides */}
          <button
            onClick={toggleSafeAreaGuides}
            className={`flex items-center gap-1 text-[10px] font-mono font-bold transition-all ${
              showSafeAreaGuides ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
            }`}
            title="Toggle Safe Area Guides"
          >
            <Grid className="w-3 h-3" />
            <span>GUIDES</span>
          </button>

          <div className="h-3 w-[1px] bg-white/10" />

          {/* Zoom & Lock */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(Math.max(0.2, Math.round((zoom - 0.1) * 10) / 10))}
              disabled={isZoomLocked}
              className={`p-0.5 rounded transition-colors ${
                isZoomLocked ? "text-slate-700 cursor-not-allowed" : "text-slate-500 hover:text-slate-200"
              }`}
              title={isZoomLocked ? "Zoom is locked at 100%" : "Zoom Out"}
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span
              className="text-[10px] font-mono font-bold text-slate-200 px-0.5"
              title="Canvas Zoom Level"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2.0, Math.round((zoom + 0.1) * 10) / 10))}
              disabled={isZoomLocked}
              className={`p-0.5 rounded transition-colors ${
                isZoomLocked ? "text-slate-700 cursor-not-allowed" : "text-slate-500 hover:text-slate-200"
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
                  ? "text-amber-400 hover:text-amber-300"
                  : "text-slate-500 hover:text-slate-300"
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
        <div className="flex items-center gap-0.5 bg-[#0f1117] p-0.5 rounded-lg border border-white/10">
          <button
            onClick={undo}
            disabled={historyPast.length === 0}
            className={`p-1 rounded transition-colors ${
              historyPast.length > 0 ? "text-slate-300 hover:text-white" : "text-slate-600 cursor-not-allowed"
            }`}
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={historyFuture.length === 0}
            className={`p-1 rounded transition-colors ${
              historyFuture.length > 0 ? "text-slate-300 hover:text-white" : "text-slate-600 cursor-not-allowed"
            }`}
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>



        {/* Global Layout Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700/80 text-xs font-semibold transition-all cursor-pointer"
            title="Configure Global Layout (Title, Numbering, Swipe & CTA)"
          >
            <Layout className="w-3.5 h-3.5 text-blue-400" />
            <span>Layout</span>
          </button>
        )}

        {/* Theme Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors cursor-pointer"
            title="Theme & Layout Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Export CTA */}
        <button
          onClick={downloadAllSlidesPNG}
          className="bg-cyan-500 text-slate-950 px-3.5 py-1 rounded-md text-xs font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center gap-1.5 cursor-pointer"
          title="Export All Slides as PNG"
        >
          <span>EXPORT</span>
          <FileImage className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
