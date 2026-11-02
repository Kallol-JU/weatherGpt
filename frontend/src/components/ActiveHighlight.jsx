import { useEffect, useLayoutEffect, useRef, useCallback } from "react";

/**
 * Single-element sliding highlight with GPU-accelerated CSS transform.
 * Features:
 * - One persistent DOM node that physically travels between options
 * - Duration: 380ms with refined cubic-bezier(0.22, 1, 0.36, 1) curve
 * - Direct DOM manipulation on the single highlight element for zero layout latency
 * - Measures exact offsetParent geometry (offsetTop, offsetLeft, offsetWidth, offsetHeight)
 * - Immediate positioning on initial mount (no flying from (0,0))
 * - Real-time repositioning on resize and scroll without lingering animations
 */
export function ActiveHighlight({
  activeId,
  containerRef,
  itemRefs,
  borderRadius = 16,
  accentColor = "#38bdf8",
  showAccent = true,
  className = "",
  style = {},
}) {
  const highlightRef = useRef(null);
  const isInitialized = useRef(false);

  // Position and dimension the single highlight element
  const updatePosition = useCallback(
    (animate = true) => {
      const el = highlightRef.current;
      const container = containerRef?.current;
      const activeEl = itemRefs?.current?.[activeId];

      if (!el || !container || !activeEl) {
        if (el && !activeEl) {
          el.style.opacity = "0";
        }
        return;
      }

      // Determine geometry relative to container
      let top = 0;
      let left = 0;
      const width = activeEl.offsetWidth;
      const height = activeEl.offsetHeight;

      if (activeEl.offsetParent === container) {
        top = activeEl.offsetTop;
        left = activeEl.offsetLeft;
      } else {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        top = activeRect.top - containerRect.top + (container.scrollTop || 0);
        left = activeRect.left - containerRect.left + (container.scrollLeft || 0);
      }

      const shouldAnimate = animate && isInitialized.current;

      if (!shouldAnimate) {
        // First mount or resize: apply position immediately without transition
        el.classList.add("no-transition");
        el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.opacity = "1";
        el.classList.add("is-ready");

        // Force synchronous reflow to commit initial coordinates
        void el.offsetHeight;

        // Restore transitions on the next animation frame for future clicks
        requestAnimationFrame(() => {
          if (highlightRef.current) {
            highlightRef.current.classList.remove("no-transition");
          }
        });

        isInitialized.current = true;
      } else {
        // Active navigation: smooth CSS transform interpolation
        el.classList.remove("no-transition");
        el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.opacity = "1";
        el.classList.add("is-ready");
      }
    },
    [activeId, containerRef, itemRefs],
  );

  const updateRef = useRef(updatePosition);
  useEffect(() => {
    updateRef.current = updatePosition;
  }, [updatePosition]);

  // Synchronize on activeId change
  useLayoutEffect(() => {
    let rafId;
    const sync = () => {
      const activeEl = itemRefs?.current?.[activeId];
      if (activeEl) {
        updatePosition(true);
      } else {
        rafId = requestAnimationFrame(sync);
      }
    };
    sync();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [activeId, itemRefs, updatePosition]);

  // Window resize and container resize observers (independent of activeId churn)
  useEffect(() => {
    const handleImmediateUpdate = () => {
      if (updateRef.current) updateRef.current(false);
    };

    window.addEventListener("resize", handleImmediateUpdate, { passive: true });

    const container = containerRef?.current;
    if (container) {
      container.addEventListener("scroll", handleImmediateUpdate, { passive: true });
    }

    let ro = null;
    if (container && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        if (isInitialized.current && updateRef.current) {
          updateRef.current(false);
        }
      });
      ro.observe(container);
    }

    return () => {
      window.removeEventListener("resize", handleImmediateUpdate);
      if (container) {
        container.removeEventListener("scroll", handleImmediateUpdate);
      }
      if (ro) ro.disconnect();
    };
  }, [containerRef]);

  return (
    <div
      ref={highlightRef}
      className={`active-selection-highlight ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
      aria-hidden="true"
    >
      {showAccent && (
        <span
          className="active-indicator-accent"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 10px 1px ${accentColor}, 0 0 20px 3px ${accentColor}80`,
          }}
        />
      )}
      <span className="active-indicator-aura" />
    </div>
  );
}

export default ActiveHighlight;
