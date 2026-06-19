import { useEffect } from "react";

// Modal-level interaction plumbing: Escape closes, ArrowLeft/ArrowRight navigate, and
// body scroll is locked while the modal is mounted. Callbacks are expected to be stable
// (e.g. wrapped in useCallback) so the listener isn't re-bound on every render.
export function useModalControls({
  onClose,
  onPrev,
  onNext,
}: {
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);
}
