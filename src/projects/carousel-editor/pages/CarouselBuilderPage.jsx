import { useEffect, useRef, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarouselStore } from "../store/carouselStore";
import { CanvasEditor } from "../components/CanvasEditor";
import { SlideThumbnails } from "../components/SlideThumbnails";
import { Toolbar } from "../components/Toolbar";
import { PropertiesPanel } from "../components/PropertiesPanel";
import { useCollectionData } from "../../../shared/hooks/useCollectionData";
import { useEditorKeyboardShortcuts } from "../hooks/useEditorKeyboardShortcuts";
import { THEME } from "../theme/theme";
import { composeSlide } from "../theme/compose";
import { generateSlideImagePrompt } from "../../../shared/utils/promptGenerators";
import { X } from "lucide-react";

function convertPostToCarouselDoc(post, themeConfig = {}) {
  if (!post) return null;

  const rawSlides = post.slides || [];
  const totalPages = Math.max(1, rawSlides.length);
  const badgeText = `${post.collectionName || 'Collection ' + (post.collectionId || 1)}`;

  const primaryColor = themeConfig.primaryColor || THEME.colors.accent;
  const headlineFont = themeConfig.headlineFont || THEME.typography.headline.fontFamily || "Instrument Serif";
  const bodyFont = themeConfig.bodyFont || THEME.typography.body.fontFamily || "Georgia";
  const bgColor = themeConfig.bgColor || "#ffffff";
  const bgPattern = themeConfig.bgPattern || "solid";
  const textAlign = themeConfig.textAlign || "left";

  let textX = THEME.contentZone.x;
  let originX = "left";
  if (textAlign === "center") {
    textX = THEME.canvas.width / 2;
    originX = "center";
  } else if (textAlign === "right") {
    textX = THEME.contentZone.right;
    originX = "right";
  }

  const contentWidth = THEME.contentZone.width;

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
      fontSize: themeConfig.headlineFontSize || 92,
      fontFamily: headlineFont,
      fill: themeConfig.headlineColor || THEME.colors.textPrimary,
      _accent: themeConfig.accentColor || THEME.colors.highlight,
      originX,
      textAlign,
      rotation: 0,
      zIndex: 3,
    });

    // Body Text with auto-calculated dynamic Y offset to prevent overlaps
    const rawBody = slide.text || slide.body || slide.Content || (typeof slide.content === 'object' ? slide.content?.body : '') || "";
    if (rawBody) {
      const titleLineCount = Math.min(3, Math.ceil(rawTitle.length / 28) || 1);
      const dynamicBodyY = THEME.contentZone.y + (titleLineCount * 110) + 20;

      const formattedBody = rawBody.replace(/—\s*/g, '—\n');

      contentElements.push({
        id: `el_body_${slideId}`,
        type: "body",
        x: textX,
        y: dynamicBodyY,
        width: contentWidth,
        text: formattedBody,
        fontSize: themeConfig.bodyFontSize || 64,
        fontFamily: bodyFont,
        fill: themeConfig.bodyColor || THEME.colors.textSecondary,
        _primary: primaryColor,
        originX,
        textAlign,
        rotation: 0,
        zIndex: 4,
      });
    }

    // Visual Directive Image Placeholder Card
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

    const composed = composeSlide(contentElements, {
      badgeText,
      pageIndex: slideNo,
      totalPages,
      slideId,
      accent: primaryColor,
      backgroundColor: bgColor,
      textAlign,
    });

    const rawImagePrompt =
      slide.imagePrompt ||
      generateSlideImagePrompt(
        {
          ...post,
          Collection: post.collectionName || post.Collection || post.name,
          collectionName: post.collectionName,
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
      );

    return {
      ...composed,
      visualDirective: rawVisual,
      imagePrompt: rawImagePrompt,
      assetName: Array.isArray(slide.assetName)
        ? slide.assetName
        : (slide.assets || [])
          .map((asset) => asset?.name || asset?.label || asset)
          .filter((name) => typeof name === "string" && name.length > 0),
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
  const { postId, collectionId, projectSlug } = useParams();
  const { designs, collectionIdMap, collectionPalettes } = useCollectionData();

  const setDocument = useCarouselStore((state) => state.setDocument);
  const [mobileDrawer, setMobileDrawer] = useState(null); // 'slides' | 'properties' | null

  const currentPost = useMemo(() => {
    if (!designs || designs.length === 0) return null;
    const numTrack = parseInt(collectionId, 10);
    const numPost = parseInt(postId, 10);

    if (postId && collectionId) {
      const p = designs.find(
        (d) =>
          (String(d.collectionId) === String(collectionId) || parseInt(d.collectionId, 10) === numTrack) &&
          (String(d.id) === String(postId) ||
            parseInt(d.postNo, 10) === numPost ||
            parseInt(d.designNo, 10) === numPost)
      );
      if (p) return p;
    }
    if (postId) {
      const p = designs.find(
        (d) =>
          String(d.id) === String(postId) ||
          parseInt(d.postNo, 10) === numPost ||
          parseInt(d.designNo, 10) === numPost
      );
      if (p) return p;
    }
    if (collectionId) {
      return (
        designs.find(
          (d) => String(d.collectionId) === String(collectionId) || parseInt(d.collectionId, 10) === numTrack
        ) || null
      );
    }
    return null;
  }, [designs, postId, collectionId]);

  const handleOpenSettingsPage = () => {
    if (projectSlug && collectionId && postId) {
      navigate(`/${projectSlug}/design/collection/${collectionId}/post/${postId}/settings`);
    } else if (collectionId && postId) {
      navigate(`/design/collection/${collectionId}/post/${postId}/settings`);
    } else if (postId) {
      navigate(`/design/${postId}/settings`);
    } else {
      navigate("settings");
    }
  };

  const loadedPostIdRef = useRef(null);

  // Initialize clean blank canvas when opening standalone editor (/canvas-editor)
  useEffect(() => {
    if (!postId && !collectionId) {
      if (loadedPostIdRef.current === 'blank_canvas_session') return;
      loadedPostIdRef.current = 'blank_canvas_session';

      useCarouselStore.getState().setPostContext({
        postId: null,
        collectionId: null,
        projectSlug: null,
      });

      const blankStarterDoc = {
        schemaVersion: 1,
        metadata: {
          title: "Blank Canvas Project",
          width: THEME.canvas.width,
          height: THEME.canvas.height,
          aspectRatio: "4:5",
          bgPattern: "solid",
          textAlign: "left",
        },
        activeSlideId: "slide_1",
        slides: [
          composeSlide(
            [
              {
                id: "el_head_slide_1",
                type: "headline",
                x: THEME.contentZone.x,
                y: THEME.contentZone.y,
                width: THEME.contentZone.width,
                text: "Your Headline Here",
                fontSize: 88,
                fontFamily: "Instrument Serif",
                fill: "#0f172a",
                originX: "left",
                textAlign: "left",
                rotation: 0,
                zIndex: 3,
              },
              {
                id: "el_body_slide_1",
                type: "body",
                x: THEME.contentZone.x,
                y: THEME.contentZone.y + 140,
                width: THEME.contentZone.width,
                text: "Start designing slides with custom typography, shapes, colors, and high-res export.",
                fontSize: 48,
                fontFamily: "Inter",
                fill: "#475569",
                originX: "left",
                textAlign: "left",
                rotation: 0,
                zIndex: 4,
              },
            ],
            {
              badgeText: "CANVAS STUDIO",
              pageIndex: 1,
              totalPages: 1,
              slideId: "slide_1",
              accent: "#2563eb",
              backgroundColor: "#ffffff",
              textAlign: "left",
            }
          ),
        ],
      };

      setDocument(blankStarterDoc, { resetRegistry: true });
    }
  }, [postId, collectionId, setDocument]);

  // Dynamically load post slides when opening a specific design/post
  useEffect(() => {
    if (!currentPost) return;
    const postKey = currentPost.id || currentPost.postId || currentPost.postNo;
    if (loadedPostIdRef.current === postKey) return;
    loadedPostIdRef.current = postKey;

    const palette =
      collectionIdMap[currentPost.collectionId] ||
      collectionPalettes[currentPost.collectionName] ||
      currentPost.trackColor ||
      {};

    const globalConfig = useCarouselStore.getState().globalLayoutConfig;

    const initialThemeConfig = {
      primaryColor: palette.primary || currentPost.trackColor?.primary || globalConfig.primaryColor || "#C84B31",
      accentColor: palette.accent || currentPost.trackColor?.accent || globalConfig.accentColor || "#FAD4C0",
      bgColor: globalConfig.bgColor || "#ffffff",
      bgPattern: globalConfig.bgPattern || "solid",
      headlineFont: globalConfig.headlineFont || THEME.typography.headline.fontFamily || "Instrument Serif",
      bodyFont: globalConfig.bodyFont || THEME.typography.body.fontFamily || "Georgia",
      headlineFontSize: globalConfig.headlineFontSize || 92,
      bodyFontSize: globalConfig.bodyFontSize || 64,
      headlineColor: globalConfig.headlineColor || "#0f172a",
      bodyColor: globalConfig.bodyColor || "#475569",
      textAlign: globalConfig.textAlign || "left",
    };

    const convertedDoc = convertPostToCarouselDoc(currentPost, initialThemeConfig);
    if (convertedDoc) {
      useCarouselStore.getState().setPostContext({
        postId: currentPost.id || currentPost.postId || currentPost.postNo,
        collectionId: currentPost.collectionId || collectionId,
        projectSlug,
      });
      setDocument(convertedDoc, { resetRegistry: true });
      useCarouselStore.getState().applyGlobalLayoutConfigToAllSlides();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPost, postId, collectionId, projectSlug]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 dark:bg-[#0f1117] text-gray-900 dark:text-slate-100 overflow-hidden font-sans select-none min-h-0 relative">
      <Toolbar
        currentPost={currentPost}
        mobileDrawer={mobileDrawer}
        onToggleMobileDrawer={(drawer) =>
          setMobileDrawer(mobileDrawer === drawer ? null : drawer)
        }
      />

      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        {/* Desktop Left Sidebar: Slide Thumbnails */}
        <div className="hidden lg:flex shrink-0 h-full">
          <SlideThumbnails />
        </div>

        {/* Center Canvas Viewport */}
        <main className="flex-1 min-w-0 min-h-0 canvas-checkerboard p-2 md:p-6 flex items-center justify-center overflow-hidden relative">
          <CanvasEditor />
        </main>

        {/* Desktop Right Sidebar: Properties Panel */}
        <div className="hidden lg:flex shrink-0 h-full">
          <PropertiesPanel />
        </div>

        {/* Mobile Slide Thumbnails Drawer */}
        {mobileDrawer === "slides" && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawer(null)}
            />
            <div className="relative z-10 w-72 max-w-[85vw] bg-white dark:bg-[#151821] h-full shadow-2xl flex flex-col border-r border-[#e2e8f0] dark:border-white/10 animate-slide-in-left">
              <div className="p-3 border-b border-[#e2e8f0] dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-slate-200 font-mono uppercase tracking-wider">
                  Slide Deck ({currentPost?.slides?.length || 0})
                </span>
                <button
                  onClick={() => setMobileDrawer(null)}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div
                className="flex-1 overflow-hidden"
                onClick={() => setMobileDrawer(null)}
              >
                <SlideThumbnails />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Properties Panel Drawer */}
        {mobileDrawer === "properties" && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawer(null)}
            />
            <div className="relative z-10 w-80 max-w-[88vw] bg-white dark:bg-[#151821] h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] dark:border-white/10 animate-slide-in-right">
              <div className="p-3 border-b border-[#e2e8f0] dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-slate-200 font-mono uppercase tracking-wider">
                  Slide Properties
                </span>
                <button
                  onClick={() => setMobileDrawer(null)}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <PropertiesPanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarouselBuilderPage;
