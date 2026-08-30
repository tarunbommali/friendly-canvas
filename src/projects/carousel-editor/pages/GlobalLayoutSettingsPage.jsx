import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCarouselStore } from "../store/carouselStore";
import { CanvasEditor } from "../components/CanvasEditor";
import { DEFAULT_GLOBAL_LAYOUT_CONFIG } from "../theme/defaultGlobalLayout";
import { useEditorKeyboardShortcuts } from "../hooks/useEditorKeyboardShortcuts";
import {
  ArrowLeft,
  Sliders,
  Type,
  Layout,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Move,
  Eye,
  ArrowRight,
  UserPlus,
  Hash,
  Grid,
} from "lucide-react";

export function GlobalLayoutSettingsPage() {
  useEditorKeyboardShortcuts();
  const navigate = useNavigate();
  const { trackId, postId, projectSlug } = useParams();

  const globalLayoutConfig = useCarouselStore((state) => state.globalLayoutConfig);
  const applyGlobalLayoutConfigToAllSlides = useCarouselStore(
    (state) => state.applyGlobalLayoutConfigToAllSlides
  );
  const setGlobalLayoutConfig = useCarouselStore(
    (state) => state.setGlobalLayoutConfig
  );
  const document = useCarouselStore((state) => state.document);

  const [activeTab, setActiveTab] = useState("positions"); // 'positions' | 'typography' | 'margins' | 'theme'
  const [appliedToast, setAppliedToast] = useState(false);
  const applyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    };
  }, []);

  const localConfig = globalLayoutConfig;

  const handleChange = (field, value) => {
    const numericFields = [
      "headlineX",
      "headlineY",
      "headlineFontSize",
      "bodyX",
      "bodyY",
      "bodyFontSize",
      "dirRectX",
      "dirRectY",
      "dirRectWidth",
      "dirRectHeight",
      "dirRectStrokeWidth",
      "dirTextX",
      "dirTextY",
      "dirTextFontSize",
      "pageNumberX",
      "pageNumberY",
      "pageNumberFontSize",
      "swipeX",
      "swipeY",
      "swipeFontSize",
      "followX",
      "followY",
      "followFontSize",
      "safeAreaMarginTop",
      "safeAreaMarginBottom",
      "safeAreaMarginLeft",
      "safeAreaMarginRight",
      "contentTopClearance",
      "contentBottomClearance",
      "contentPaddingLeft",
      "contentPaddingRight",
    ];

    const parsedValue = numericFields.includes(field) ? Number(value) : value;
    setGlobalLayoutConfig({ [field]: parsedValue });

    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    applyTimerRef.current = setTimeout(() => {
      applyGlobalLayoutConfigToAllSlides();
    }, 200);
  };

  const handleApplyAll = () => {
    applyGlobalLayoutConfigToAllSlides(localConfig);
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 3000);
  };

  const handleResetDefaults = () => {
    applyGlobalLayoutConfigToAllSlides({ ...DEFAULT_GLOBAL_LAYOUT_CONFIG });
  };

  const handleBackToEditor = () => {
    if (projectSlug && trackId && postId) {
      navigate(`/${projectSlug}/design/track/${trackId}/post/${postId}`);
    } else if (trackId && postId) {
      navigate(`/design/track/${trackId}/post/${postId}`);
    } else if (postId) {
      navigate(`/design/${postId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header Navigation Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToEditor}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Back to Carousel Editor</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Global Layout & Transform Settings</span>
                <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  All Slides
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                {document?.metadata?.title ? `Editing layout rules for: ${document.metadata.title}` : "Configure element positions, typography, safe areas & margins"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleApplyAll}
            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Settings to All Slides</span>
          </button>
        </div>
      </header>

      {/* Main Content Workbench */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Tab Selector */}
        <aside className="w-60 bg-slate-900 border-r border-slate-800 p-4 space-y-2 shrink-0">
          <div className="text-[11px] uppercase tracking-wider font-mono text-slate-500 px-3 py-1">
            Settings Sections
          </div>
          <button
            onClick={() => setActiveTab("positions")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "positions"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Move className="w-4 h-4" />
            <span>1. Element X/Y Positions</span>
          </button>
          <button
            onClick={() => setActiveTab("typography")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "typography"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Type className="w-4 h-4" />
            <span>2. Typography & Fonts</span>
          </button>
          <button
            onClick={() => setActiveTab("margins")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "margins"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>3. Safe Area & Margins</span>
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "theme"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>4. Theme & Aspect Ratio</span>
          </button>

          {appliedToast && (
            <div className="mt-6 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Applied settings to all slides in real-time!</span>
            </div>
          )}
        </aside>

        {/* Right Settings Workbench with 2-Column Split: Form Inputs & Original CanvasEditor Preview */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Column: Form Controls */}
            <div className="w-full lg:w-7/12 space-y-6">

              {/* TAB 1: ELEMENT POSITIONS */}
              {activeTab === "positions" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Move className="w-4 h-4 text-blue-400" />
                      <span>Element Positions & Transform Defaults</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adjust exact X/Y pixel coordinates or drag elements directly on the Canvas Editor Preview. Changes synchronize live across all slides.
                    </p>
                  </div>

                  {/* Headline Position */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
                        <Type className="w-4 h-4 text-blue-400" />
                        <span>1. Headline Content Element</span>
                      </div>
                      <span className="font-mono text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
                        X: {localConfig.headlineX}px | Y: {localConfig.headlineY}px
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">X Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.headlineX}
                          onChange={(e) => handleChange("headlineX", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Y Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.headlineY}
                          onChange={(e) => handleChange("headlineY", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Font Size (px)</label>
                        <input
                          type="number"
                          value={localConfig.headlineFontSize}
                          onChange={(e) => handleChange("headlineFontSize", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.headlineColor}
                            onChange={(e) => handleChange("headlineColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.headlineColor}
                            onChange={(e) => handleChange("headlineColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Text Position */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
                        <Type className="w-4 h-4 text-emerald-400" />
                        <span>2. Body Text Paragraph Element</span>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        X: {localConfig.bodyX}px | Y: {localConfig.bodyY}px
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">X Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.bodyX}
                          onChange={(e) => handleChange("bodyX", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Y Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.bodyY}
                          onChange={(e) => handleChange("bodyY", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Font Size (px)</label>
                        <input
                          type="number"
                          value={localConfig.bodyFontSize}
                          onChange={(e) => handleChange("bodyFontSize", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.bodyColor}
                            onChange={(e) => handleChange("bodyColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.bodyColor}
                            onChange={(e) => handleChange("bodyColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Directive Container Rect Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
                        <Layout className="w-4 h-4 text-amber-400" />
                        <span>3. Directive Container Box (Rect)</span>
                      </div>
                      <span className="font-mono text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        Center X: {localConfig.dirRectX}px | Center Y: {localConfig.dirRectY}px
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Center X (px)</label>
                        <input
                          type="number"
                          value={localConfig.dirRectX}
                          onChange={(e) => handleChange("dirRectX", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Center Y (px)</label>
                        <input
                          type="number"
                          value={localConfig.dirRectY}
                          onChange={(e) => handleChange("dirRectY", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Width (px)</label>
                        <input
                          type="number"
                          value={localConfig.dirRectWidth}
                          onChange={(e) => handleChange("dirRectWidth", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Height (px)</label>
                        <input
                          type="number"
                          value={localConfig.dirRectHeight}
                          onChange={(e) => handleChange("dirRectHeight", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Fill Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.dirRectFill}
                            onChange={(e) => handleChange("dirRectFill", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.dirRectFill}
                            onChange={(e) => handleChange("dirRectFill", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Stroke Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.dirRectStroke}
                            onChange={(e) => handleChange("dirRectStroke", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.dirRectStroke}
                            onChange={(e) => handleChange("dirRectStroke", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Stroke Width (px)</label>
                        <input
                          type="number"
                          value={localConfig.dirRectStrokeWidth}
                          onChange={(e) => handleChange("dirRectStrokeWidth", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Directive Text Label Position */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
                        <Type className="w-4 h-4 text-purple-400" />
                        <span>4. Directive Text Label Element</span>
                      </div>
                      <span className="font-mono text-[11px] text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full">
                        X: {localConfig.dirTextX}px | Y: {localConfig.dirTextY}px
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">X Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.dirTextX}
                          onChange={(e) => handleChange("dirTextX", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Y Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.dirTextY}
                          onChange={(e) => handleChange("dirTextY", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Font Size (px)</label>
                        <input
                          type="number"
                          value={localConfig.dirTextFontSize}
                          onChange={(e) => handleChange("dirTextFontSize", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.dirTextColor}
                            onChange={(e) => handleChange("dirTextColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.dirTextColor}
                            onChange={(e) => handleChange("dirTextColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Slide Number / Page Badge Position */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
                        <Hash className="w-4 h-4 text-red-400" />
                        <span>5. Slide Number Badge (Page No)</span>
                      </div>
                      <span className="font-mono text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">
                        X: {localConfig.pageNumberX ?? 140}px | Y: {localConfig.pageNumberY ?? 1210}px
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">X Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.pageNumberX ?? 140}
                          onChange={(e) => handleChange("pageNumberX", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Y Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.pageNumberY ?? 1210}
                          onChange={(e) => handleChange("pageNumberY", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Font Size (px)</label>
                        <input
                          type="number"
                          value={localConfig.pageNumberFontSize ?? 24}
                          onChange={(e) => handleChange("pageNumberFontSize", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.pageNumberColor || "#64748b"}
                            onChange={(e) => handleChange("pageNumberColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.pageNumberColor || "#64748b"}
                            onChange={(e) => handleChange("pageNumberColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6. Swipe Indicator Position */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
                        <ArrowRight className="w-4 h-4 text-pink-400" />
                        <span>6. Swipe Indicator Element ("Swipe →")</span>
                      </div>
                      <span className="font-mono text-[11px] text-pink-400 bg-pink-500/10 border border-pink-500/30 px-2 py-0.5 rounded-full">
                        X: {localConfig.swipeX ?? 940}px | Y: {localConfig.swipeY ?? 1210}px
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">X Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.swipeX ?? 940}
                          onChange={(e) => handleChange("swipeX", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Y Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.swipeY ?? 1210}
                          onChange={(e) => handleChange("swipeY", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Font Size (px)</label>
                        <input
                          type="number"
                          value={localConfig.swipeFontSize ?? 24}
                          onChange={(e) => handleChange("swipeFontSize", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.swipeColor || "#64748b"}
                            onChange={(e) => handleChange("swipeColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.swipeColor || "#64748b"}
                            onChange={(e) => handleChange("swipeColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 text-xs">
                      <label className="block text-slate-400 mb-1 font-medium">Custom Swipe Label</label>
                      <input
                        type="text"
                        value={localConfig.swipeText || "Swipe →"}
                        onChange={(e) => handleChange("swipeText", e.target.value)}
                        className="w-full sm:w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 text-xs focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* 7. Follow CTA Position */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
                        <UserPlus className="w-4 h-4 text-cyan-400" />
                        <span>7. Follow CTA Element ("Follow for more →")</span>
                      </div>
                      <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        X: {localConfig.followX ?? 940}px | Y: {localConfig.followY ?? 1210}px
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">X Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.followX ?? 940}
                          onChange={(e) => handleChange("followX", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Y Position (px)</label>
                        <input
                          type="number"
                          value={localConfig.followY ?? 1210}
                          onChange={(e) => handleChange("followY", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Font Size (px)</label>
                        <input
                          type="number"
                          value={localConfig.followFontSize ?? 24}
                          onChange={(e) => handleChange("followFontSize", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.followColor || "#64748b"}
                            onChange={(e) => handleChange("followColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.followColor || "#64748b"}
                            onChange={(e) => handleChange("followColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 text-xs">
                      <label className="block text-slate-400 mb-1 font-medium">Custom Follow CTA Text</label>
                      <input
                        type="text"
                        value={localConfig.followText || "Follow for more →"}
                        onChange={(e) => handleChange("followText", e.target.value)}
                        className="w-full sm:w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 text-xs focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TYPOGRAPHY & FONTS */}
              {activeTab === "typography" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Type className="w-4 h-4 text-blue-400" />
                      <span>Typography, Fonts & Text Sizing</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure font families, base sizes, and text colors across headlines, body paragraphs, and track badges.
                    </p>
                  </div>

                  {/* Headline Typography */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="text-slate-100 font-semibold text-xs border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-blue-400" />
                      <span>Headline Typography Settings</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Headline Font Family</label>
                        <select
                          value={localConfig.headlineFont || "Inter"}
                          onChange={(e) => handleChange("headlineFont", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="Inter">Inter (Clean Sans)</option>
                          <option value="Georgia">Georgia (Classic Serif)</option>
                          <option value="Playfair Display">Playfair Display (Display Serif)</option>
                          <option value="Roboto">Roboto (Modern Sans)</option>
                          <option value="Arial">Arial (Standard Sans)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Headline Size (px)</label>
                        <input
                          type="number"
                          value={localConfig.headlineFontSize || 44}
                          onChange={(e) => handleChange("headlineFontSize", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Headline Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.headlineColor || "#0f172a"}
                            onChange={(e) => handleChange("headlineColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.headlineColor || "#0f172a"}
                            onChange={(e) => handleChange("headlineColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Copy Typography */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="text-slate-100 font-semibold text-xs border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-emerald-400" />
                      <span>Body Copy & Paragraph Typography</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Body Font Family</label>
                        <select
                          value={localConfig.bodyFont || "Inter"}
                          onChange={(e) => handleChange("bodyFont", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="Inter">Inter (Sans)</option>
                          <option value="Roboto">Roboto (Sans)</option>
                          <option value="Arial">Arial (Sans)</option>
                          <option value="Courier New">Monospace</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Body Font Size (px)</label>
                        <input
                          type="number"
                          value={localConfig.bodyFontSize || 30}
                          onChange={(e) => handleChange("bodyFontSize", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Body Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.bodyColor || "#475569"}
                            onChange={(e) => handleChange("bodyColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.bodyColor || "#475569"}
                            onChange={(e) => handleChange("bodyColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Directive Label Typography */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="text-slate-100 font-semibold text-xs border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-400" />
                      <span>Directive Label & Accent Typography</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Directive Text Size (px)</label>
                        <input
                          type="number"
                          value={localConfig.dirTextFontSize || 24}
                          onChange={(e) => handleChange("dirTextFontSize", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Directive Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.dirTextColor || "#8e5c29"}
                            onChange={(e) => handleChange("dirTextColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.dirTextColor || "#8e5c29"}
                            onChange={(e) => handleChange("dirTextColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SAFE AREA & MARGINS */}
              {activeTab === "margins" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Grid className="w-4 h-4 text-cyan-400" />
                      <span>Safe Area Margins & Content Zone Clearance</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure outer safe area margins and inner content zone clearances. Updates overlay guide boundaries live on the canvas.
                    </p>
                  </div>

                  {/* Outer Safe Area Canvas Margins */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 font-semibold text-xs text-slate-100">
                        <Grid className="w-4 h-4 text-cyan-400" />
                        <span>Outer Safe Area Canvas Margins</span>
                      </div>
                      <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        {localConfig.safeAreaMarginTop || 80}px Top / {localConfig.safeAreaMarginLeft || 80}px L/R
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Top Margin (px)</label>
                        <input
                          type="number"
                          value={localConfig.safeAreaMarginTop ?? 80}
                          onChange={(e) => handleChange("safeAreaMarginTop", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Bottom Margin (px)</label>
                        <input
                          type="number"
                          value={localConfig.safeAreaMarginBottom ?? 80}
                          onChange={(e) => handleChange("safeAreaMarginBottom", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Left Margin (px)</label>
                        <input
                          type="number"
                          value={localConfig.safeAreaMarginLeft ?? 80}
                          onChange={(e) => handleChange("safeAreaMarginLeft", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Right Margin (px)</label>
                        <input
                          type="number"
                          value={localConfig.safeAreaMarginRight ?? 80}
                          onChange={(e) => handleChange("safeAreaMarginRight", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inner Content Zone Clearance & Paddings */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 font-semibold text-xs text-slate-100">
                        <Layout className="w-4 h-4 text-amber-400" />
                        <span>Content Zone Clearance & Inner Paddings</span>
                      </div>
                      <span className="font-mono text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        Top: {localConfig.contentTopClearance || 210}px | Bottom: {localConfig.contentBottomClearance || 1180}px
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Top Clearance (px)</label>
                        <input
                          type="number"
                          value={localConfig.contentTopClearance ?? 210}
                          onChange={(e) => handleChange("contentTopClearance", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                          title="Clearance below top track badge line"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Bottom Clearance (px)</label>
                        <input
                          type="number"
                          value={localConfig.contentBottomClearance ?? 1180}
                          onChange={(e) => handleChange("contentBottomClearance", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                          title="Clearance above bottom page number / swipe indicator"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Padding Left (px)</label>
                        <input
                          type="number"
                          value={localConfig.contentPaddingLeft ?? 60}
                          onChange={(e) => handleChange("contentPaddingLeft", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Padding Right (px)</label>
                        <input
                          type="number"
                          value={localConfig.contentPaddingRight ?? 60}
                          onChange={(e) => handleChange("contentPaddingRight", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: THEME & ASPECT RATIO */}
              {activeTab === "theme" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-400" />
                      <span>Theme, Aspect Ratio & Background Pattern</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure canvas aspect ratio, track colors, patterns, and font choices. Updates the Live Preview instantly.
                    </p>
                  </div>

                  {/* Canvas Aspect Ratio */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 font-semibold text-xs text-slate-100">
                        <Layout className="w-4 h-4 text-blue-400" />
                        <span>Canvas Aspect Ratio</span>
                      </div>
                      <span className="font-mono text-[11px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase">
                        {localConfig.aspectRatio || "4:5"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: "4:5", label: "4:5 Portrait", dim: "1080 × 1350 px", sub: "Instagram Portrait" },
                        { id: "1:1", label: "1:1 Square", dim: "1080 × 1080 px", sub: "Instagram Post" },
                        { id: "9:16", label: "9:16 Vertical", dim: "1080 × 1920 px", sub: "Story / Reel" },
                        { id: "16:9", label: "16:9 Landscape", dim: "1920 × 1080 px", sub: "Presentation" },
                      ].map((ratio) => (
                        <button
                          key={ratio.id}
                          type="button"
                          onClick={() => handleChange("aspectRatio", ratio.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            (localConfig.aspectRatio || "4:5") === ratio.id
                              ? "bg-blue-600/20 border-blue-500 text-slate-100 shadow-lg shadow-blue-600/10 ring-1 ring-blue-500"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-100">{ratio.label}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ratio.dim}</div>
                          </div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mt-2">
                            {ratio.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors & Palette */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="text-slate-100 font-semibold text-xs border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-400" />
                      <span>Track Palette & Background Styles</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Primary Track Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.primaryColor}
                            onChange={(e) => handleChange("primaryColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.primaryColor}
                            onChange={(e) => handleChange("primaryColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Accent Badge Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.accentColor}
                            onChange={(e) => handleChange("accentColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.accentColor}
                            onChange={(e) => handleChange("accentColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Slide Background Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localConfig.bgColor}
                            onChange={(e) => handleChange("bgColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={localConfig.bgColor}
                            onChange={(e) => handleChange("bgColor", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Background Pattern</label>
                        <select
                          value={localConfig.bgPattern}
                          onChange={(e) => handleChange("bgPattern", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        >
                          <option value="solid">Solid Background</option>
                          <option value="dots">Dots Pattern</option>
                          <option value="grid">Grid Lines</option>
                          <option value="lines">Notebook Lines</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium text-xs">Text Alignment</label>
                        <div className="flex items-center gap-2">
                          {["left", "center", "right"].map((align) => (
                            <button
                              key={align}
                              type="button"
                              onClick={() => handleChange("textAlign", align)}
                              className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                                localConfig.textAlign === align
                                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20"
                                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                              }`}
                            >
                              {align} Align
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">Snap to guides while dragging</span>
                      <button
                        type="button"
                        onClick={() => handleChange("snapToGuides", !localConfig.snapToGuides)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          localConfig.snapToGuides
                            ? "bg-blue-600 text-white border-blue-500"
                            : "bg-slate-950 text-slate-400 border-slate-800"
                        }`}
                      >
                        {localConfig.snapToGuides ? "Snap ON" : "Snap OFF"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Original CanvasEditor Component */}
            <div className="w-full lg:w-5/12 lg:sticky lg:top-4 self-start bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-100">Original Canvas Editor Preview</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {document?.metadata?.width || 1080} × {document?.metadata?.height || 1350} ({localConfig.aspectRatio || "4:5"})
                </span>
              </div>

              <div className="h-[520px] rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
                <CanvasEditor />
              </div>

              {/* Dynamic Position Coordinates Readout Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-blue-400 font-bold block">Headline:</span>
                  <span className="text-slate-300">X:{localConfig.headlineX} Y:{localConfig.headlineY}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 font-bold block">Body Text:</span>
                  <span className="text-slate-300">X:{localConfig.bodyX} Y:{localConfig.bodyY}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-bold block">Box Center:</span>
                  <span className="text-slate-300">X:{localConfig.dirRectX} Y:{localConfig.dirRectY}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-purple-400 font-bold block">Directive Text:</span>
                  <span className="text-slate-300">X:{localConfig.dirTextX} Y:{localConfig.dirTextY}</span>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default GlobalLayoutSettingsPage;
