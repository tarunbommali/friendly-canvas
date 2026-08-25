import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Save,
  Layout as LayoutIcon,
  Sparkles,
  CheckCircle2,
  Layers,
  Wand2,
} from "lucide-react";
import { useLayoutCollections } from "../hooks/useLayoutCollections";
import { LAYOUT_PRESETS } from "../data/layoutPresets";
import { useCarouselStore } from "../../carousel-editor/store/carouselStore";
import { CanvasEditor } from "../../carousel-editor/components/CanvasEditor";
import { Toolbar } from "../../carousel-editor/components/Toolbar";
import { PropertiesPanel } from "../../carousel-editor/components/PropertiesPanel";
import { SlideThumbnails } from "../../carousel-editor/components/SlideThumbnails";
import { THEME } from "../../carousel-editor/theme/theme";
import { composeSlide } from "../../carousel-editor/theme/compose";

export default function LayoutEditorPage() {
  const { collectionId, layoutId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const slideData = location.state?.slideData;

  const { getCollection, addLayoutToCollection, updateLayoutInCollection } =
    useLayoutCollections();

  const collection = getCollection(collectionId);
  const existingLayout = layoutId
    ? (collection?.layouts || []).find((l) => l.id === layoutId)
    : null;

  const isNew = !layoutId || !existingLayout;

  const document = useCarouselStore((state) => state.document);
  const setDocument = useCarouselStore((state) => state.setDocument);
  const updateCarouselMetadata = useCarouselStore(
    (state) => state.updateCarouselMetadata
  );

  const [toastMsg, setToastMsg] = useState("");
  const [activeTab, setActiveTab] = useState("presets"); // 'presets' | 'slides'

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Initialize canvas with chosen layout preset or existing layout on mount
  useEffect(() => {
    let initialPreset = LAYOUT_PRESETS[0];

    // Check if layoutId matches any preset or collection archetype
    if (layoutId) {
      const matched = LAYOUT_PRESETS.find(
        (p) => p.id === layoutId || layoutId.includes(p.id)
      );
      if (matched) initialPreset = matched;
    }

    applyPresetToCanvas(initialPreset, slideData);
  }, [collectionId, layoutId, slideData]);

  const applyPresetToCanvas = (preset, customData = null) => {
    if (!preset) return;

    let elements = [...preset.elements];

    // If custom title/content was passed from slideData, update text elements
    if (customData?.title || customData?.content) {
      elements = elements.map((el) => {
        if (el.type === "text") {
          if (
            el.id.includes("headline") ||
            el.id.includes("title") ||
            el.fontSize >= 44
          ) {
            return { ...el, text: customData.title || el.text };
          }
          if (
            el.id.includes("body") ||
            el.id.includes("content") ||
            el.fontSize < 44
          ) {
            return { ...el, text: customData.content || el.text };
          }
        }
        return el;
      });
    }

    const composedSlide = composeSlide(elements, {
      badgeText: customData?.collectionName || "SWE NOTEBOOK",
      pageIndex: 1,
      totalPages: 1,
      slideId: "slide_1",
    });

    const newDoc = {
      schemaVersion: 1,
      metadata: {
        title: customData?.title || preset.name,
        width: THEME.canvas.width,
        height: THEME.canvas.height,
        aspectRatio: "4:5",
      },
      activeSlideId: "slide_1",
      slides: [composedSlide],
    };

    setDocument(newDoc);
    showToast(`Applied preset: "${preset.name}"`);
  };

  const handleSaveLayout = () => {
    const payload = {
      name: document.metadata.title || "Custom Fabric Layout",
      description: "Predefined Fabric.js layout template",
      icon: "layout",
      document,
    };

    if (isNew) {
      const created = addLayoutToCollection(collectionId, payload);
      showToast(`Saved layout "${payload.name}"!`);
      if (created?.id) {
        navigate(
          `/layout-builder/collection/${collectionId}/edit/${created.id}`,
          { replace: true }
        );
      }
    } else {
      updateLayoutInCollection(collectionId, layoutId, payload);
      showToast(`Updated layout "${payload.name}"!`);
    }
  };

  const handleCopyJSON = () => {
    const jsonString = JSON.stringify(document, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      showToast("Copied Layout JSON to clipboard!");
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={
              collectionId
                ? `/layout-builder/collection/${collectionId}`
                : "/layout-builder"
            }
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            title="Back to Layouts"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <h1 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <span>{document.metadata.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono">
                Fabric Layout
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {collection?.name || "Layout Library"} • Predefined Automated Engine
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJSON}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Copy Layout JSON"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy JSON</span>
          </button>
          <button
            onClick={handleSaveLayout}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Layout</span>
          </button>
        </div>
      </header>

      {/* Main Builder Body */}
      <div className="flex-1 flex flex-col min-h-0">
        <Toolbar />
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Sidebar: Predefined Layout Presets & Slides */}
          <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab("presets")}
                className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === "presets"
                    ? "border-b-2 border-blue-500 text-blue-400 bg-slate-950/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Layout Presets</span>
              </button>
              <button
                onClick={() => setActiveTab("slides")}
                className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === "slides"
                    ? "border-b-2 border-blue-500 text-blue-400 bg-slate-950/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Slides ({document.slides.length})</span>
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === "presets" ? (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-400 font-medium px-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Click a layout preset to generate design instantly:</span>
                  </div>
                  {LAYOUT_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => applyPresetToCanvas(preset, slideData)}
                      className="group border border-slate-800 hover:border-blue-500 bg-slate-950/50 hover:bg-blue-950/30 rounded-xl p-3 cursor-pointer transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-slate-200 group-hover:text-blue-300">
                          {preset.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {preset.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <SlideThumbnails />
              )}
            </div>
          </div>

          {/* Center Fabric Canvas */}
          <main className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-hidden relative">
            <CanvasEditor />
          </main>

          {/* Right Properties Panel */}
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
