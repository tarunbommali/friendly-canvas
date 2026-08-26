import { useEffect } from "react";
import { useCarouselStore } from "../store/carouselStore";

/**
 * Custom hook to handle global keyboard shortcuts for the Carousel Editor:
 * - Arrow Keys (Up, Down, Left, Right): Nudges selected element by 1px (or 10px with Shift)
 * - Delete / Backspace: Deletes selected element
 * - Ctrl+Z / Cmd+Z: Undo last action
 * - Ctrl+Y / Cmd+Y or Ctrl+Shift+Z: Redo last action
 */
export function useEditorKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcut triggers if the user is typing inside an input/textarea
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
      } = useCarouselStore.getState();

      // Undo / Redo Shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // Delete Shortcut
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementId) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
        return;
      }

      // Arrow Keys Nudge Navigation (Up, Down, Left, Right)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (!selectedElementId || !doc || !doc.slides) return;

        const activeSlide = doc.slides.find((s) => s.id === doc.activeSlideId);
        if (!activeSlide) return;

        const targetElement = activeSlide.elements.find(
          (el) => el.id === selectedElementId
        );
        if (!targetElement) return;

        e.preventDefault();

        // 10px step when holding Shift, 1px otherwise
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
