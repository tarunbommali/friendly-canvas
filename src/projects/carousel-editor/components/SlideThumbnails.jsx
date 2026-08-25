import { useCarouselStore } from "../store/carouselStore";
import { Plus, Copy, Trash2, Layers } from "lucide-react";

export function SlideThumbnails() {
  const document = useCarouselStore((state) => state.document);
  const setActiveSlide = useCarouselStore((state) => state.setActiveSlide);
  const addSlide = useCarouselStore((state) => state.addSlide);
  const duplicateSlide = useCarouselStore((state) => state.duplicateSlide);
  const deleteSlide = useCarouselStore((state) => state.deleteSlide);

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Slides ({document.slides.length})</span>
        </div>
        <button
          onClick={addSlide}
          className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
          title="Add Slide"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {document.slides.map((slide, index) => {
          const isActive = slide.id === document.activeSlideId;

          return (
            <div
              key={slide.id}
              onClick={() => setActiveSlide(slide.id)}
              className={`group relative rounded-xl border p-2 cursor-pointer transition-all ${
                isActive
                  ? "border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/10"
                  : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 px-1">
                <span className="font-semibold text-slate-300">
                  Slide {index + 1}
                </span>
                <span className="text-[10px] text-slate-500">
                  {slide.elements.length} elements
                </span>
              </div>

              {/* Thumbnail Mini Canvas Preview */}
              <div
                className="w-full aspect-square rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden relative"
                style={{ backgroundColor: slide.backgroundColor || "#ffffff" }}
              >
                <div className="text-[10px] font-medium text-slate-400 opacity-60 pointer-events-none px-2 text-center">
                  {slide.elements.find((e) => e.type === "text")?.text ||
                    `Slide ${index + 1}`}
                </div>
              </div>

              {/* Quick Hover Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm p-1 rounded-md border border-slate-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateSlide(slide.id);
                  }}
                  className="p-1 hover:bg-slate-700 text-slate-300 rounded"
                  title="Duplicate Slide"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {document.slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(slide.id);
                    }}
                    className="p-1 hover:bg-red-950 text-red-400 rounded"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
