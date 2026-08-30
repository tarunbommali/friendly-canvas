import { useEffect, useRef, useMemo } from "react";
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
import { wrapTextToLines } from "../canvas/textAnnotations";
import { generateSlideImagePrompt } from "../../../shared/utils/promptGenerators";

function convertPostToCarouselDoc(post, themeConfig = {}) {
  if (!post) return null;

  const rawSlides = post.slides || [];
  const totalPages = Math.max(1, rawSlides.length);
  const badgeText = `${post.collectionName || 'Track ' + (post.trackId || 1)}`;

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
      // Pass track accent so textAnnotations can highlight the last word
      _accent: themeConfig.accentColor || primaryColor,
      originX,
      textAlign,
      rotation: 0,
      zIndex: 3,
    });

    // Body Content below Title filling full safeArea contentZone width (800px)
    const rawBody = slide.text || slide.body || slide.Content || (typeof slide.content === 'object' ? slide.content?.body : '') || "";
    if (rawBody) {
      // Calculate dynamic headline height to place body cleanly below it without extra whitespace or overlap
      const hSize = themeConfig.headlineFontSize || 92;
      const headlineLines = wrapTextToLines(rawTitle, hSize, contentWidth).length || 1;
      const headlineHeight = headlineLines * hSize * 1.15;
      const dynamicBodyY = Math.round(THEME.contentZone.y + headlineHeight + 28);

      // Automatically wrap semicolons into clean newlines for description lists
      const formattedBody = rawBody.includes(";")
        ? rawBody.replace(/;\s*/g, ";\n")
        : rawBody;

      contentElements.push({
        id: `text_${slideId}_body`,
        type: "text",
        x: textX,
        y: dynamicBodyY,
        width: contentWidth,
        text: formattedBody,
        fontSize: themeConfig.bodyFontSize || 64,
        fontFamily: bodyFont,
        fill: themeConfig.bodyColor || THEME.colors.textSecondary,
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

    const rawImagePrompt =
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
  const { postId, trackId, projectSlug } = useParams();
  const { designs, collectionIdMap, trackPalettes } = useCollectionData();

  const setDocument = useCarouselStore((state) => state.setDocument);

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
      setDocument(convertedDoc, { resetRegistry: true });
      useCarouselStore.getState().applyGlobalLayoutConfigToAllSlides();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPost]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0f1117] text-slate-100 overflow-hidden font-sans select-none min-h-0">
      <Toolbar onOpenSettings={handleOpenSettingsPage} currentPost={currentPost} />
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        <SlideThumbnails />
        <main className="flex-1 min-w-0 min-h-0 canvas-checkerboard p-4 flex items-center justify-center overflow-hidden relative">
          <CanvasEditor />
        </main>
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default CarouselBuilderPage;
