export const ASPECT_RATIOS = {
  "4:5": { width: 1080, height: 1350 },
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
};

export const THEME = {
  canvas: {
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
  },
  // Safe Area: Canvas margins (top: 80, bottom: 80, left: 80, right: 80)
  safeArea: {
    x: 80,
    y: 80,
    width: 920,
    height: 1190,
    top: 80,
    bottom: 80,
    left: 80,
    right: 80,
  },
  // Content Zone: Content is strictly constrained with top/bottom/left/right paddings
  contentZone: {
    x: 140,
    y: 210,
    width: 800,
    height: 970,
    top: 210,
    bottom: 1180,
    left: 140,
    right: 940,
    paddingTop: 130, // Clearance below top badge
    paddingBottom: 140, // Clearance above bottom page number / swipe indicator
    paddingLeft: 60, // Clearance inside safeArea card
    paddingRight: 60, // Clearance inside safeArea card
  },
  colors: {
    cardBg: "#f8fafc",
    cardBorder: "#cbd5e1",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    footer: "#64748b",
    accent: "#2563eb",
  },
  typography: {
    headline: { fontSize: 92, fontFamily: "Instrument Serif", color: "#0f172a" },
    body: { fontSize: 64, fontFamily: "Georgia", color: "#475569" },
    badge: { fontSize: 26, fontFamily: "Playfair Display" },
    directive: { fontSize: 24, fontFamily: "Georgia", color: "#8e5c29" },
    footer: { fontSize: 24, fontFamily: "Georgia" },
  },
  chrome: {
    badge: { x: 540, y: 140 },
    pageNumber: { x: 940, y: 140 }, // Top-right corner mirroring eyebrow tag
    watermark: { x: 140, y: 1255 }, // Bottom-left footer on top of safe area line
    swipeIndicator: { x: 940, y: 1255 }, // Bottom-right footer on top of safe area line
  },
};
