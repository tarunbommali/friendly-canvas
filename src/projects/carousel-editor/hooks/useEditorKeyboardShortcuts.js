import { useEffect, useRef } from "react";
import { useCarouselStore } from "../store/carouselStore";
import { isChromeElement } from "../theme/elementClassify";

/**
 * Keyboard + clipboard shortcuts for the carousel editor.
 */
export function useEditorKeyboardShortcuts() {
  const lastPasteAtRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable);

      if (isInput) return;

      const {
        selectedElementId,
        document: doc,
        updateElement,
        deleteElement,
        undo,
        redo,
        copySelectedElement,
        pasteClipboardElement,
        duplicateSelectedElement,
        clipboardElement,
      } = useCarouselStore.getState();

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // 1. Copy Shortcut (Ctrl+C / Cmd+C)
      if (isCtrlOrCmd && key === "c") {
        e.preventDefault();
        copySelectedElement();
        return;
      }

      // 2. Paste Shortcut (Ctrl+V / Cmd+V)
      if (isCtrlOrCmd && key === "v") {
        const now = Date.now();
        if (now - lastPasteAtRef.current < 100) {
          e.preventDefault();
          return;
        }

        // Try reading system clipboard directly via Async Clipboard API for images & text
        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          typeof navigator.clipboard.read === "function"
        ) {
          navigator.clipboard
            .read()
            .then(async (clipboardItems) => {
              for (const item of clipboardItems) {
                const imageType = item.types.find((t) => t.startsWith("image/"));
                if (imageType) {
                  e.preventDefault();
                  lastPasteAtRef.current = Date.now();
                  const blob = await item.getType(imageType);
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    useCarouselStore
                      .getState()
                      .pasteClipboardElement(evt.target.result);
                  };
                  reader.readAsDataURL(blob);
                  return;
                }
              }

              // Check for text/element payload in clipboardItems
              for (const item of clipboardItems) {
                if (item.types.includes("text/plain")) {
                  const textBlob = await item.getType("text/plain");
                  const text = await textBlob.text();
                  if (text && text.trim()) {
                    const trimmed = text.trim();
                    if (
                      trimmed.startsWith("data:image/") ||
                      trimmed.match(/\.(jpeg|jpg|gif|png|svg|webp)($|\?)/i)
                    ) {
                      e.preventDefault();
                      lastPasteAtRef.current = Date.now();
                      pasteClipboardElement(trimmed);
                      return;
                    }
                    try {
                      const parsed = JSON.parse(trimmed);
                      if (parsed && parsed.__friendly_canvas_element && parsed.element) {
                        e.preventDefault();
                        lastPasteAtRef.current = Date.now();
                        useCarouselStore.setState({ clipboardElement: parsed.element });
                        pasteClipboardElement();
                        return;
                      }
                    } catch {}
                  }
                }
              }

              // If internal clipboardElement exists in store
              if (clipboardElement) {
                e.preventDefault();
                lastPasteAtRef.current = Date.now();
                pasteClipboardElement();
              }
            })
            .catch(() => {
              // On permission restriction or browser security, fallback to internal element or let native event fire
              if (clipboardElement) {
                e.preventDefault();
                lastPasteAtRef.current = Date.now();
                pasteClipboardElement();
              }
            });
          return;
        }

        // Fallback for browsers without navigator.clipboard.read
        if (clipboardElement) {
          e.preventDefault();
          lastPasteAtRef.current = now;
          pasteClipboardElement();
        }
        return;
      }

      // 3. Duplicate Shortcut (Ctrl+D / Cmd+D)
      if (isCtrlOrCmd && key === "d") {
        e.preventDefault();
        duplicateSelectedElement();
        return;
      }

      // 4. Undo / Redo Shortcuts
      if (isCtrlOrCmd && key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (isCtrlOrCmd && key === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // 5. Delete Shortcut (Delete / Backspace)
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!selectedElementId || !doc) return;
        const activeSlide = doc.slides.find((s) => s.id === doc.activeSlideId);
        const target = activeSlide?.elements.find((el) => el.id === selectedElementId);
        if (target && isChromeElement(target)) return;
        e.preventDefault();
        deleteElement(selectedElementId);
        return;
      }

      // 6. Arrow keys (Nudge selected element or navigate slides)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (!selectedElementId) {
          if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            useCarouselStore.getState().goToPreviousSlide();
          } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            useCarouselStore.getState().goToNextSlide();
          }
          return;
        }

        if (!doc || !doc.slides) return;

        const activeSlide = doc.slides.find((s) => s.id === doc.activeSlideId);
        if (!activeSlide) return;

        const targetElement = activeSlide.elements.find(
          (el) => el.id === selectedElementId
        );
        if (!targetElement || isChromeElement(targetElement)) return;

        e.preventDefault();

        const step = e.shiftKey ? 10 : 1;
        let newX = targetElement.x ?? 0;
        let newY = targetElement.y ?? 0;

        if (e.key === "ArrowUp") newY -= step;
        if (e.key === "ArrowDown") newY += step;
        if (e.key === "ArrowLeft") newX -= step;
        if (e.key === "ArrowRight") newX += step;

        updateElement(selectedElementId, { x: newX, y: newY });
      }
    };

    // Native Window Paste Event Handler (Handles direct right-click paste or image drop)
    const handlePaste = (e) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable);

      if (isInput) return;

      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      const now = Date.now();
      if (now - lastPasteAtRef.current < 100) return;
      lastPasteAtRef.current = now;

      const { pasteClipboardElement, clipboardElement } = useCarouselStore.getState();

      // 1. Check for image files in clipboardData.files
      const files = clipboardData.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type && file.type.startsWith("image/")) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (evt) => {
              pasteClipboardElement(evt.target.result);
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }

      // 2. Check for image items in clipboardData.items
      const items = clipboardData.items;
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type && item.type.startsWith("image/")) {
            e.preventDefault();
            const blob = item.getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = (evt) => {
                pasteClipboardElement(evt.target.result);
              };
              reader.readAsDataURL(blob);
              return;
            }
          }
        }
      }

      // 3. Check for text/data URL
      const text = clipboardData.getData("text");
      if (text && text.trim()) {
        const trimmed = text.trim();
        if (
          trimmed.startsWith("data:image/") ||
          trimmed.match(/\.(jpeg|jpg|gif|png|svg|webp)($|\?)/i)
        ) {
          e.preventDefault();
          pasteClipboardElement(trimmed);
          return;
        }

        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && parsed.__friendly_canvas_element && parsed.element) {
            e.preventDefault();
            useCarouselStore.setState({ clipboardElement: parsed.element });
            pasteClipboardElement();
            return;
          }
        } catch {}

        e.preventDefault();
        if (clipboardElement) {
          pasteClipboardElement();
        } else {
          pasteClipboardElement(null, trimmed);
        }
        return;
      }

      // 4. Fallback: paste internal copied element
      if (clipboardElement) {
        e.preventDefault();
        pasteClipboardElement();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, []);
}
