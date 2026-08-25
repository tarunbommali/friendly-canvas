export const THEME = {
  canvas: {
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
  },
  safeArea: {
    x: 80,
    y: 80,
    width: 920,
    height: 1190,
  },
  // Content Zone: Content is strictly constrained between y: 210 and y: 1180
  contentZone: {
    x: 140,
    y: 210,
    width: 800,
    height: 970,
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
    headline: { fontSize: 50, fontFamily: "Inter" },
    body: { fontSize: 32, fontFamily: "Inter" },
    badge: { fontSize: 26, fontFamily: "Inter" },
    footer: { fontSize: 24, fontFamily: "Inter" },
  },
  chrome: {
    badge: { x: 140, y: 140 },
    pageNumber: { x: 860, y: 1210 },
    swipeIndicator: { x: 140, y: 1210 },
  },
};
