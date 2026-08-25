import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCarouselStore } from "./store/carouselStore";
import { CanvasEditor } from "./components/CanvasEditor";
import { SlideThumbnails } from "./components/SlideThumbnails";
import { Toolbar } from "./components/Toolbar";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { Sparkles, Layout, Edit3, Palette, Type, Sliders, Check } from "lucide-react";
import { useCollectionData } from "../../shared/hooks/useTrackData";
import { THEME } from "./theme/theme";
import { composeSlide } from "./theme/compose";

function convertPostToCarouselDoc(post, themeConfig = {}) {
  if (!post) return null;

  const rawSlides = post.slides || [];
  const totalPages = Math.max(1, rawSlides.length);
  const badgeText = `${post.collectionName || 'Track ' + (post.trackId || 1)}`;

  const accentColor = themeConfig.accentColor || THEME.colors.accent;
  const headlineFont = themeConfig.headlineFont || "Inter";
  const bodyFont = themeConfig.bodyFont || "Inter";
  const bgColor = themeConfig.bgColor || "#ffffff";

  const slides = (rawSlides.length > 0 ? rawSlides : [{ title: post.title, body: '' }]).map((slide, index) => {
    const slideNo = slide.slideNo || slide.SlideNo || index + 1;
    const slideId = `slide_${slideNo}`;

    const contentElements = [];

    // Main Title inside THEME.contentZone (y: 210)
    const titleText = slide.title || slide.SlideTitle || `Slide ${slideNo}`;
    contentElements.push({
      id: `text_${slideId}_title`,
      type: "text",
      x: THEME.contentZone.x,
      y: THEME.contentZone.y,
      text: titleText,
      fontSize: THEME.typography.headline.fontSize,
      fontFamily: headlineFont,
      fill: THEME.colors.textPrimary,
      rotation: 0,
      zIndex: 3,
    });

    // Body Content inside THEME.contentZone (y: 360)
    const bodyText = slide.body || slide.Content || "";
    if (bodyText) {
      contentElements.push({
        id: `text_${slideId}_body`,
        type: "text",
        x: THEME.contentZone.x,
        y: THEME.contentZone.y + 150,
        text: bodyText,
        fontSize: THEME.typography.body.fontSize,
        fontFamily: bodyFont,
        fill: THEME.colors.textSecondary,
        rotation: 0,
        zIndex: 4,
      });
    }

    // Visual Directive Card (inside contentZone)
    const visualText = slide.visualDirective || slide.VisualDirective || "";
    if (visualText) {
      contentElements.push({
        id: `rect_${slideId}_visual_card`,
        type: "rect",
        x: THEME.contentZone.x,
        y: THEME.contentZone.y + 540,
        width: THEME.contentZone.width,
        height: 180,
        fill: "#eff6ff",
        stroke: accentColor,
        strokeWidth: 2,
        rotation: 0,
        zIndex: 5,
      });
      contentElements.push({
        id: `text_${slideId}_visual`,
        type: "text",
        x: THEME.contentZone.x + 30,
        y: THEME.contentZone.y + 580,
        text: `💡 Visual: ${visualText}`,
        fontSize: 26,
        fontFamily: bodyFont,
        fill: accentColor,
        rotation: 0,
        zIndex: 6,
      });
    }

    // Compose content elements with standard theme chrome identity layer
    return composeSlide(contentElements, {
      badgeText,
      pageIndex: slideNo,
      totalPages,
      slideId,
      accent: accentColor,
      backgroundColor: bgColor,
    });
  });

  return {
    schemaVersion: 1,
    metadata: {
      title: post.title || post.PostTitle || `Design #${post.designNo || 1}`,
      width: THEME.canvas.width,
      height: THEME.canvas.height,
      aspectRatio: "4:5",
    },
    activeSlideId: slides[0]?.id || "slide_1",
    slides,
  };
}

export function CarouselBuilderPage() {
  const { postId, trackId } = useParams();
  const { designs } = useCollectionData();

  const document = useCarouselStore((state) => state.document);
  const setDocument = useCarouselStore((state) => state.setDocument);
  const updateCarouselMetadata = useCarouselStore(
    (state) => state.updateCarouselMetadata
  );

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);

  // Global Project Configuration State
  const [projectConfig, setProjectConfig] = useState({
    primaryColor: "#2563eb",
    accentColor: "#3b82f6",
    bgColor: "#ffffff",
    headlineFont: "Inter",
    bodyFont: "Inter",
  });

  // Apply project configuration changes across ALL slides in real-time
  const applyConfigToAllSlides = (newConfig) => {
    setProjectConfig(newConfig);
    const currentDoc = useCarouselStore.getState().document;
    if (!currentDoc || !currentDoc.slides) return;

    const updatedSlides = currentDoc.slides.map((slide) => {
      const updatedElements = slide.elements.map((el) => {
        // Chrome badge accent color
        if (el.id === "chrome_badge") {
          return { ...el, fill: newConfig.accentColor };
        }
        // Background card border stroke
        if (el.id.includes("_bg") || el.id === "rect_bg") {
          return { ...el, stroke: newConfig.accentColor };
        }
        // Headline elements font family
        if (
          el.type === "text" &&
          (el.fontSize >= 44 || el.id.includes("title") || el.id.includes("headline"))
        ) {
          return {
            ...el,
            fontFamily: newConfig.headlineFont,
          };
        }
        // Body elements font family
        if (
          el.type === "text" &&
          (el.fontSize < 44 || el.id.includes("body") || el.id.includes("content"))
        ) {
          return {
            ...el,
            fontFamily: newConfig.bodyFont,
          };
        }
        return el;
      });

      return {
        ...slide,
        backgroundColor: newConfig.bgColor,
        elements: updatedElements,
      };
    });

    setDocument({
      ...currentDoc,
      slides: updatedSlides,
    });
  };

  // Dynamically load post slides & title when opening a specific design/post
  useEffect(() => {
    if (!designs || designs.length === 0) return;

    let foundPost = null;

    if (postId && trackId) {
      foundPost = designs.find(
        (d) =>
          String(d.trackId) === String(trackId) &&
          (d.id === postId ||
            String(d.postNo) === String(postId) ||
            String(d.designNo) === String(postId))
      );
    }

    if (!foundPost && postId) {
      foundPost = designs.find(
        (d) =>
          d.id === postId ||
          String(d.postNo) === String(postId) ||
          String(d.designNo) === String(postId)
      );
    } else if (!foundPost && trackId) {
      foundPost = designs.find(
        (d) => String(d.trackId) === String(trackId)
      );
    }

    if (foundPost) {
      setCurrentPost(foundPost);
      const initialPalette = {
        primaryColor: foundPost.trackColor?.primary || "#2563eb",
        accentColor: foundPost.trackColor?.accent || "#3b82f6",
        bgColor: "#ffffff",
        headlineFont: "Inter",
        bodyFont: "Inter",
      };
      setProjectConfig(initialPalette);
      const convertedDoc = convertPostToCarouselDoc(foundPost, initialPalette);
      if (convertedDoc) {
        setDocument(convertedDoc);
      }
    }
  }, [postId, trackId, designs]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between">
        {/* Left: Title & Track */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
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
                  className="bg-slate-950 border border-blue-500 rounded px-2 py-0.5 text-sm font-semibold text-slate-100 focus:outline-none"
                />
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="font-semibold text-sm text-slate-100 flex items-center gap-2 cursor-pointer hover:text-blue-300 transition-colors group"
                  title="Click to edit post title"
                >
                  <span>{document.metadata.title || "Untitled Post"}</span>
                  <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                </h1>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {currentPost?.collectionName
                ? `${currentPost.collectionName} • Design #${currentPost.designNo || 1}`
                : "Custom Carousel Builder"}
            </p>
          </div>
        </div>

        {/* Center: Global Project Configuration Bar (Applies to ALL Slides) */}
        <div className="flex items-center gap-3 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] uppercase tracking-wider text-slate-500">Theme Config:</span>
          </div>

          {/* Primary & Accent Color Swatches */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
            <label className="flex items-center gap-1 cursor-pointer" title="Primary Track Color">
              <input
                type="color"
                value={projectConfig.primaryColor}
                onChange={(e) =>
                  applyConfigToAllSlides({ ...projectConfig, primaryColor: e.target.value })
                }
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Pri</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer" title="Accent Badge Color">
              <input
                type="color"
                value={projectConfig.accentColor}
                onChange={(e) =>
                  applyConfigToAllSlides({ ...projectConfig, accentColor: e.target.value })
                }
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Acc</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer" title="Slide Background Color">
              <input
                type="color"
                value={projectConfig.bgColor}
                onChange={(e) =>
                  applyConfigToAllSlides({ ...projectConfig, bgColor: e.target.value })
                }
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Bg</span>
            </label>
          </div>

          {/* Headline Font Selector */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <span className="text-[10px] text-slate-500">Title:</span>
            <select
              value={projectConfig.headlineFont}
              onChange={(e) =>
                applyConfigToAllSlides({ ...projectConfig, headlineFont: e.target.value })
              }
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none"
              title="Headline Font Family (Applies to all slides)"
            >
              <option value="Inter">Inter</option>
              <option value="Georgia">Georgia</option>
              <option value="Playfair Display">Playfair</option>
              <option value="Roboto">Roboto</option>
              <option value="Arial">Arial</option>
            </select>
          </div>

          {/* Body Font Selector */}
          <div className="flex items-center gap-1 pl-1">
            <span className="text-[10px] text-slate-500">Body:</span>
            <select
              value={projectConfig.bodyFont}
              onChange={(e) =>
                applyConfigToAllSlides({ ...projectConfig, bodyFont: e.target.value })
              }
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none"
              title="Body Font Family (Applies to all slides)"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Arial">Arial</option>
              <option value="Courier New">Monospace</option>
            </select>
          </div>
        </div>

        {/* Right: Canvas Aspect Ratio Badge */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-500 font-medium px-2 flex items-center gap-1">
            <Layout className="w-3.5 h-3.5" /> Ratio:
          </span>
          <span className="px-2.5 py-1 rounded font-mono bg-blue-600 text-white font-semibold">
            4:5 (1080x1350)
          </span>
        </div>
      </header>

      {/* Main Workbench Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <Toolbar />
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <SlideThumbnails />
          <main className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-hidden relative">
            <CanvasEditor />
          </main>
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}

export default CarouselBuilderPage;
