import { useEffect, useRef } from "react";
import { useCarouselStore } from "../store/carouselStore";
import { useEditorPaste } from "../../../shared/hooks/useClipboard";
import { isChromeElement } from "../theme/elementClassify";

/**
 * Keyboard + clipboard shortcuts for the carousel editor.
 */
export function useEditorKeyboardShortcuts() {
  const lastPasteAtRef = useRef(0);

  const runPaste = (imageDataUrl, text) => {
    const now = Date.now();
    if (now - lastPasteAtRef.current < 80) return;
    lastPasteAtRef.current = now;
    useCarouselStore.getState().pasteClipboardElement(imageDataUrl, text);
  };

  useEditorPaste(({ imageDataUrl, text }) => {
    const { clipboardElement } = useCarouselStore.getState();
    if (imageDataUrl) {
      runPaste(imageDataUrl, null);
      return;
    }
    if (clipboardElement) {
      runPaste(null, null);
      return;
    }
    if (text) {
      runPaste(null, text);
    }
  });

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
        duplicateSelectedElement,
      } = useCarouselStore.getState();

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copySelectedElement();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelectedElement();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (!selectedElementId || !doc) return;
        const activeSlide = doc.slides.find((s) => s.id === doc.activeSlideId);
        const target = activeSlide?.elements.find((el) => el.id === selectedElementId);
        if (target && isChromeElement(target)) return;
        e.preventDefault();
        deleteElement(selectedElementId);
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (!selectedElementId || !doc || !doc.slides) return;

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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
