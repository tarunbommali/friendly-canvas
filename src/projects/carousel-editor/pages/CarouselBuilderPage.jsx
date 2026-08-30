import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarouselStore } from "../store/carouselStore";
import { CanvasEditor } from "../components/CanvasEditor";
import { SlideThumbnails } from "../components/SlideThumbnails";
import { Toolbar } from "../components/Toolbar";
import { PropertiesPanel } from "../components/PropertiesPanel";
import {
  Sparkles,
  Layout,
  Edit3,
  Settings,
} from "lucide-react";
import { useCollectionData } from "../../../shared/hooks/useCollectionData";
import { useEditorKeyboardShortcuts } from "../hooks/useEditorKeyboardShortcuts";
import { THEME } from "../theme/theme";
import { composeSlide } from "../theme/compose";
import { generateSlideImagePrompt } from "../../../shared/utils/promptGenerators";

function convertPostToCarouselDoc(post, themeConfig = {}) {
  if (!post) return null;

  const rawSlides = post.slides || [];
  const totalPages = Math.max(1, rawSlides.length);
  const badgeText = `${post.collectionName || 'Track ' + (post.trackId || 1)}`;

  const primaryColor = themeConfig.primaryColor || THEME.colors.accent;
  const headlineFont = themeConfig.headlineFont || "Inter";
  const bodyFont = themeConfig.bodyFont || "Inter";
  const bgColor = themeConfig.bgColor || "#ffffff";
  const bgPattern = themeConfig.bgPattern || "solid";
  const textAlign = themeConfig.textAlign || "left";

<<<<<<< HEAD
  let textX = THEME.contentZone.x;
=======
  let textX = THEME.contentZone.x; // 140px — same x as chrome badge for consistent left alignment
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
  let originX = "left";
  if (textAlign === "center") {
    textX = THEME.canvas.width / 2;
    originX = "center";
  } else if (textAlign === "right") {
<<<<<<< HEAD
    textX = THEME.contentZone.right;
    originX = "right";
  }

  const contentWidth = THEME.contentZone.width;
=======
    textX = THEME.contentZone.right; // 940px right boundary
    originX = "right";
  }

  const contentWidth = THEME.contentZone.width; // 800px — text wraps within this boundary
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a

  const slides = (rawSlides.length > 0 ? rawSlides : [{ title: post.title, body: '' }]).map((slide, index) => {
    const slideNo = slide.slideNo || slide.SlideNo || index + 1;
    const slideId = `slide_${slideNo}`;

    const contentElements = [];

    // Main Title filling full safeArea contentZone width (840px)
    const rawTitle = slide.headline || slide.title || slide.SlideTitle || (typeof slide.content === 'object' ? slide.content?.title : '') || `Slide ${slideNo}`;

    contentElements.push({
      id: `el_head_${slideId}`,
      type: "headline",
      x: textX,
      y: THEME.contentZone.y,
      width: contentWidth,
      text: rawTitle,
      fontSize: 44,
      fontFamily: headlineFont,
      fill: THEME.colors.textPrimary,
      // Pass track accent so textAnnotations can highlight the last word
      _accent: themeConfig.accentColor || primaryColor,
      originX,
      textAlign,
      rotation: 0,
      zIndex: 3,
    });

    // Body Content below Title filling full safeArea contentZone width (840px)
    const rawBody = slide.text || slide.body || slide.Content || (typeof slide.content === 'object' ? slide.content?.body : '') || "";
    if (rawBody) {
      // Automatically wrap semicolons into clean newlines for description lists
      const formattedBody = rawBody.includes(";")
        ? rawBody.replace(/;\s*/g, ";\n")
        : rawBody;

      contentElements.push({
        id: `text_${slideId}_body`,
        type: "text",
        x: textX,
        y: THEME.contentZone.y + 140,
        width: contentWidth,
        text: formattedBody,
        fontSize: 30,
        fontFamily: bodyFont,
        fill: THEME.colors.textSecondary,
        // Pass track primary so textAnnotations can underline important words
        _primary: primaryColor,
        originX,
        textAlign,
        rotation: 0,
        zIndex: 4,
      });
    }

    // Visual Directive Image Placeholder Card (centered container at x: 540, y: 794 matching screenshot specs)
    const rawVisual = slide.descriptionVisual || slide.visualDirective || slide.VisualDirective || (typeof slide.content === 'object' ? slide.content?.visualDirective : '') || "";
    if (rawVisual) {
      contentElements.push({
        id: `rect_${slideId}_visual_placeholder`,
        type: "rect",
        x: THEME.canvas.width / 2,
        y: 794,
        width: 760,
        height: 480,
        originX: "center",
        originY: "center",
        fill: "#f8fafc",
        stroke: primaryColor,
        strokeWidth: 2,
        strokeDashArray: [8, 8],
        rotation: 0,
        zIndex: 5,
        isPlaceholder: true,
      });
    }

    // Compose content elements with standard theme chrome identity layer
    const composed = composeSlide(contentElements, {
      badgeText,
      pageIndex: slideNo,
      totalPages,
      slideId,
      accent: primaryColor,
      backgroundColor: bgColor,
      textAlign,
    });

    const rawImagePrompt = slide.imagePrompt || rawVisual;
    const rawAssetName = slide.assetName || (typeof slide.content === 'object' ? slide.content?.assetName : []) || [];

    return {
      ...composed,
      imagePrompt: rawImagePrompt,
      visualDirective: rawVisual,
<<<<<<< HEAD
      imagePrompt:
        slide.imagePrompt ||
        generateSlideImagePrompt(
          {
            ...post,
            Track: post.collectionName || post.Track,
            PostTitle: post.title || post.PostTitle,
          },
          {
            VisualDirective: rawVisual,
            SlideTitle: rawTitle,
            Content: rawBody,
          },
          {
            primary: primaryColor,
            accent: themeConfig.accentColor,
            palette: post.collectionName,
          }
        ),
      assetName: Array.isArray(slide.assetName)
        ? slide.assetName
        : (slide.assets || [])
            .map((asset) => asset?.name || asset?.label || asset)
            .filter((name) => typeof name === "string" && name.length > 0),
=======
      assetName: Array.isArray(rawAssetName) ? rawAssetName : (rawAssetName ? [rawAssetName] : []),
>>>>>>> f016dd846d67a9fb45224c08def64d989678295a
      bgPattern,
    };
  });

  return {
    schemaVersion: 1,
    metadata: {
      title: post.title || post.PostTitle || `Design #${post.designNo || 1}`,
      width: THEME.canvas.width,
      height: THEME.canvas.height,
      aspectRatio: "4:5",
      bgPattern,
      textAlign,
    },
    activeSlideId: slides[0]?.id || "slide_1",
    slides,
  };
}

export function CarouselBuilderPage() {
  useEditorKeyboardShortcuts();

  const navigate = useNavigate();
  const { postId, trackId, projectSlug } = useParams();
  const { designs, collectionIdMap, trackPalettes } = useCollectionData();

  const document = useCarouselStore((state) => state.document);
  const setDocument = useCarouselStore((state) => state.setDocument);
  const updateCarouselMetadata = useCarouselStore(
    (state) => state.updateCarouselMetadata
  );

  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const currentPost = useMemo(() => {
    if (!designs || designs.length === 0) return null;
    if (postId && trackId) {
      const p = designs.find(
        (d) =>
          String(d.trackId) === String(trackId) &&
          (d.id === postId ||
            String(d.postNo) === String(postId) ||
            String(d.designNo) === String(postId))
      );
      if (p) return p;
    }
    if (postId) {
      const p = designs.find(
        (d) =>
          d.id === postId ||
          String(d.postNo) === String(postId) ||
          String(d.designNo) === String(postId)
      );
      if (p) return p;
    }
    if (trackId) {
      return designs.find((d) => String(d.trackId) === String(trackId)) || null;
    }
    return null;
  }, [designs, postId, trackId]);

  const handleOpenSettingsPage = () => {
    if (projectSlug && trackId && postId) {
      navigate(`/${projectSlug}/design/track/${trackId}/post/${postId}/settings`);
    } else if (trackId && postId) {
      navigate(`/design/track/${trackId}/post/${postId}/settings`);
    } else if (postId) {
      navigate(`/design/${postId}/settings`);
    } else {
      navigate("settings");
    }
  };

  // Track last loaded post id to avoid re-loading the same post on every render.
  // Zustand actions (setDocument) are stable — never put them in dep arrays.
  const loadedPostIdRef = useRef(null);

  // Dynamically load post slides when opening a specific design/post
  useEffect(() => {
    if (!currentPost) return;
    // Bail out early if we already loaded this exact post to prevent
    // the "Maximum update depth exceeded" infinite-loop.
    const postKey = currentPost.id || currentPost.postId || currentPost.postNo;
    if (loadedPostIdRef.current === postKey) return;
    loadedPostIdRef.current = postKey;

    // Fetch Track Color Palette from collectionIdMap or trackPalettes
    const palette =
      collectionIdMap[currentPost.trackId] ||
      trackPalettes[currentPost.collectionName] ||
      currentPost.trackColor ||
      {};

    const initialPalette = {
      primaryColor: palette.primary || currentPost.trackColor?.primary || "#C84B31",
      accentColor: palette.accent || currentPost.trackColor?.accent || "#FAD4C0",
      bgColor: "#ffffff",
      bgPattern: "solid",
      headlineFont: "Inter",
      bodyFont: "Inter",
      textAlign: "left",
    };

    const convertedDoc = convertPostToCarouselDoc(currentPost, initialPalette);
    if (convertedDoc) {
      setDocument(convertedDoc, { resetRegistry: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPost]);

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

        {/* Center: Global Project Layout Settings Page Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenSettingsPage}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-2 border border-blue-400/30 shadow-lg shadow-blue-600/20 transition-all text-xs"
            title="Open Global Layout & Transform Settings Page"
          >
            <Settings className="w-4 h-4" />
            <span>Layout & Theme Settings</span>
          </button>
        </div>

        {/* Right: Canvas Aspect Ratio Badge */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-500 font-medium px-2 flex items-center gap-1">
            <Layout className="w-3.5 h-3.5" /> Ratio:
          </span>
          <span className="px-2.5 py-1 rounded font-mono bg-blue-600 text-white font-semibold">
            {document.metadata.aspectRatio || "4:5"} ({document.metadata.width}x
            {document.metadata.height})
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
