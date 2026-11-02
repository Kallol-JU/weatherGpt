import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Dialog behaviour shared by the auth, location and settings modals:
 * Escape closes, Tab is trapped inside, background scroll is locked, and focus
 * returns to the trigger when the dialog unmounts.
 */
export function useDialog(open, onClose, dialogRef) {
  const onCloseRef = useRef(onClose);
  const restoreRef = useRef(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const node = dialogRef.current;
    if (!node) return;

    restoreRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      const preferred = Array.from(
        node.querySelectorAll("input, select, textarea"),
      ).find((element) => !element.closest("[inert]"));
      const fallback = node.querySelector(FOCUSABLE);
      (preferred || fallback || node).focus?.();
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (element) =>
          element.offsetParent !== null &&
          !element.hasAttribute("disabled") &&
          !element.closest("[inert]"),
      );

      if (items.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      const restore = restoreRef.current;
      if (restore && typeof restore.focus === "function") restore.focus();
    };
  }, [open, dialogRef]);
}
