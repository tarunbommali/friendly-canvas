export function isChromeElement(el) {
  if (!el) return false;
  if (el.isChrome) return true;
  const id = typeof el.id === "string" ? el.id : "";
  return id.includes("chrome_");
}

export function isImageElement(el) {
  if (!el) return false;
  return el.type === "image" || Boolean(el.src);
}

export function isPlaceholderElement(el) {
  if (!el) return false;
  if (el.isPlaceholder === true) return true;
  const id = typeof el.id === "string" ? el.id.toLowerCase() : "";
  return id.includes("placeholder");
}

export function isHeadlineElement(el) {
  if (!el) return false;
  if (el.type === "headline") return true;
  const id = typeof el.id === "string" ? el.id : "";
  return (
    id.includes("headline") ||
    id.includes("title") ||
    id.startsWith("el_head_") ||
    id.includes("_head_") ||
    (id.includes("head") && !id.includes("chrome"))
  );
}

export function isDirectiveTextElement(el) {
  if (!el || isImageElement(el) || isPlaceholderElement(el) || isChromeElement(el)) {
    return false;
  }
  const id = typeof el.id === "string" ? el.id : "";
  const text = typeof el.text === "string" ? el.text : "";
  const content = typeof el.content === "string" ? el.content : "";
  return (
    text.includes("Visual:") ||
    content.includes("Visual:") ||
    id.includes("dir_text") ||
    id.includes("directive_text")
  );
}

export function isBodyElement(el) {
  if (!el || isChromeElement(el) || isImageElement(el) || isPlaceholderElement(el)) {
    return false;
  }
  if (el.type === "body") return true;
  const id = typeof el.id === "string" ? el.id : "";
  if (id.includes("body") || id.startsWith("el_body_")) return true;
  return (
    el.type === "text" &&
    !isHeadlineElement(el) &&
    !isDirectiveTextElement(el)
  );
}

export function isDirectiveRectElement(el) {
  if (!el || isChromeElement(el) || isImageElement(el)) return false;
  if (isPlaceholderElement(el)) return true;
  const id = typeof el.id === "string" ? el.id : "";
  if (el.type === "badge" && !isChromeElement(el)) return true;
  if (id.includes("visual_card") || id.includes("visual_placeholder")) return true;
  if (id.includes("dir") && !id.includes("dir_text")) return true;
  return el.type === "rect" && !id.includes("_bg");
}

export function isBackgroundRect(el) {
  if (!el) return false;
  const id = typeof el.id === "string" ? el.id : "";
  return id.includes("_bg") || id === "rect_bg";
}

export function isPageNumberElement(el) {
  if (!el) return false;
  const id = typeof el.id === "string" ? el.id : "";
  return id.includes("chrome_page_number") || id.includes("page_number") || id.includes("slide_no");
}

export function isSwipeElement(el) {
  if (!el) return false;
  const id = typeof el.id === "string" ? el.id : "";
  return id.includes("chrome_swipe") || id.includes("swipe") || (el.isChrome && id.includes("follow"));
}

export function isChromeBadgeElement(el) {
  if (!el) return false;
  const id = typeof el.id === "string" ? el.id : "";
  return id.includes("chrome_badge") || id === "chrome_badge";
}

export function formatPageLabel(pageIndex, totalPages) {
  const page = String(pageIndex).padStart(2, "0");
  const total = String(totalPages).padStart(2, "0");
  return `${page} / ${total}`;
}

export function createElementId(type) {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
