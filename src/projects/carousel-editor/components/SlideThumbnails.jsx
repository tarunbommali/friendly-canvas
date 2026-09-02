import { useState, useEffect, useRef } from "react";
import { useCarouselStore } from "../store/carouselStore";
import {
  Plus,
  Copy,
  Trash2,
  Download,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { renderSlideToDataUrl } from "../canvas/exportRenderer";

export function SlideThumbnails() {
  const listRef = useRef(null);
  const document = useCarouselStore((state) => state.document);
  const setActiveSlide = useCarouselStore((state) => state.setActiveSlide);
  const goToPreviousSlide = useCarouselStore((state) => state.goToPreviousSlide);
  const goToNextSlide = useCarouselStore((state) => state.goToNextSlide);
  const addSlide = useCarouselStore((state) => state.addSlide);
  const moveSlide = useCarouselStore((state) => state.moveSlide);
  const reorderSlides = useCarouselStore((state) => state.reorderSlides);
  const duplicateSlide = useCarouselStore((state) => state.duplicateSlide);
  const deleteSlide = useCarouselStore((state) => state.deleteSlide);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Auto-scroll and focus active thumbnail
  useEffect(() => {
    if (!listRef.current || !document.activeSlideId) return;
    const activeEl = listRef.current.querySelector(
      `[data-slide-id="${document.activeSlideId}"]`
    );
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (
        window.document.activeElement &&
        listRef.current.contains(window.document.activeElement)
      ) {
        activeEl.focus();
      }
    }
  }, [document.activeSlideId]);

  const downloadSingleSlide = async (e, slide, index) => {
    e.stopPropagation();
    try {
      const safeTitle = (document.metadata.title || "carousel")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      const dataUrl = await renderSlideToDataUrl(slide, document.metadata, 2);
      const link = window.document.createElement("a");
      link.href = dataUrl;
      link.download = `${safeTitle}-slide-${index + 1}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to export slide as PNG:", err);
      alert("Error exporting slide: " + err.message);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData("text/plain"));
    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      reorderSlides(sourceIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-32 bg-white dark:bg-[#151821] border-r border-[#e2e8f0] dark:border-white/10 flex flex-col h-full shrink-0 select-none shadow-2xs font-sans">
      <div className="p-2.5 border-b border-[#e2e8f0] dark:border-white/10 flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider pl-1">
          SLIDES ({document.slides.length})
        </span>
        <button
          onClick={() => addSlide()}
          className="p-1 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-md transition-all text-xs cursor-pointer shadow-2xs"
          title="Add Slide to End"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
        {/* Optional Insert Before First Slide */}
        <div className="group/divider relative h-2.5 -my-1 flex items-center justify-center cursor-pointer z-30">
          <button
            onClick={() => addSlide(0)}
            className="opacity-0 group-hover/divider:opacity-100 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-75 hover:scale-100 transition-all duration-150 cursor-pointer"
            title="Insert new slide at beginning"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
          <div className="absolute inset-x-2 h-[1px] bg-blue-400 opacity-0 group-hover/divider:opacity-100 transition-opacity pointer-events-none" />
        </div>

        {document.slides.map((slide, index) => {
          const isActive = slide.id === document.activeSlideId;
          const isDraggingThis = draggedIndex === index;
          const isDropTarget = dragOverIndex === index;

          return (
            <div key={slide.id} className="space-y-1">
              <div
                data-slide-id={slide.id}
                tabIndex={0}
                role="button"
                aria-selected={isActive}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveSlide(slide.id)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    e.stopPropagation();
                    goToPreviousSlide();
                  } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    e.preventDefault();
                    e.stopPropagation();
                    goToNextSlide();
                  } else if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSlide(slide.id);
                  }
                }}
                className={`relative group cursor-grab active:cursor-grabbing outline-none rounded-lg transition-all duration-150 ${
                  isDraggingThis ? "opacity-30 scale-95" : ""
                } ${isDropTarget ? "ring-2 ring-blue-500 scale-[1.02]" : ""}`}
              >
                {/* Outer Thumbnail Container */}
                <div
                  className={`relative rounded-lg border overflow-hidden transition-all shadow-2xs ${
                    isActive
                      ? "border-blue-600 ring-2 ring-blue-500/30 shadow-md"
                      : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30"
                  }`}
                >
                  {/* Top Bar for Drag Handle & Quick Move */}
                  <div className="absolute top-0 inset-x-0 bg-white/95 dark:bg-[#151821]/95 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-1 py-0.5 z-20 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center text-gray-400 dark:text-slate-500" title="Drag to reorder">
                      <GripVertical className="w-2.5 h-2.5" />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSlide(slide.id, "up");
                        }}
                        className="p-0.5 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-2.5 h-2.5" />
                      </button>
                      <button
                        disabled={index === document.slides.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSlide(slide.id, "down");
                        }}
                        className="p-0.5 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 rounded transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4:5 Slide Aspect Preview */}
                  <div
                    className="w-full aspect-[4/5] flex flex-col justify-between p-2 overflow-hidden relative"
                    style={{ backgroundColor: slide.backgroundColor || "#ffffff" }}
                  >
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold text-gray-900 line-clamp-2 leading-tight">
                        {slide.elements.find((e) => e.type === "headline" || e.id?.includes("head") || e.id?.includes("title"))?.text ||
                         slide.elements.find((e) => e.type === "headline" || e.id?.includes("head") || e.id?.includes("title"))?.content ||
                         `Slide ${index + 1}`}
                      </div>
                      <div className="text-[7px] text-gray-500 line-clamp-3 leading-tight">
                        {slide.elements.find((e) => e.type === "body" || (e.type === "text" && !e.id?.includes("head") && !e.id?.includes("title")))?.text ||
                         slide.elements.find((e) => e.type === "body" || (e.type === "text" && !e.id?.includes("head") && !e.id?.includes("title")))?.content ||
                         ""}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Hover Bar (Bottom Bar) */}
                  <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-[#151821]/95 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-evenly py-1 px-0.5 border-t border-gray-200 dark:border-white/10 z-20">
                    <button
                      onClick={(e) => downloadSingleSlide(e, slide, index)}
                      className="p-1 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors cursor-pointer"
                      title="Export PNG"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addSlide(index + 1);
                      }}
                      className="p-1 text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition-colors cursor-pointer"
                      title="Insert New Slide Below"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateSlide(slide.id);
                      }}
                      className="p-1 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {document.slides.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSlide(slide.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Vertical Slide Index Indicator Badge */}
                <div className="absolute -left-1.5 top-0 bottom-0 flex items-center pointer-events-none">
                  <span className={`text-[8px] font-mono font-bold -rotate-90 origin-center ${isActive ? "text-blue-600 dark:text-blue-400 font-extrabold" : "text-gray-400 dark:text-slate-500"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* In-Between Interactive Slide Insert Divider */}
              <div className="group/divider relative h-3 -my-0.5 flex items-center justify-center cursor-pointer z-30">
                <button
                  onClick={() => addSlide(index + 1)}
                  className="opacity-0 group-hover/divider:opacity-100 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-75 hover:scale-100 transition-all duration-150 cursor-pointer"
                  title={`Insert new slide between ${index + 1} and ${index + 2}`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <div className="absolute inset-x-2 h-[1px] bg-blue-400 opacity-0 group-hover/divider:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>
          );
        })}

        {/* Add Slide Button at bottom */}
        <button
          onClick={() => addSlide()}
          className="w-full aspect-[4/5] rounded-lg border border-dashed border-gray-300 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all group mt-2 cursor-pointer"
          title="Add New Slide to End"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-mono font-bold">ADD SLIDE</span>
        </button>
      </div>
    </div>
  );
}
