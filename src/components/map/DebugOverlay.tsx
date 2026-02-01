import { useEffect, useState } from "react";

/**
 * Debug overlay component for visualizing safe zones and element bounding boxes.
 * Only renders when ?debug=1 is in the URL.
 */
export const DebugOverlay = () => {
  const [isDebug, setIsDebug] = useState(false);
  const [elementBoxes, setElementBoxes] = useState<Array<{
    id: string;
    rect: DOMRect;
    label: string;
  }>>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDebug(params.get("debug") === "1");
  }, []);

  useEffect(() => {
    if (!isDebug) return;

    const updateElementBoxes = () => {
      const selectors = [
        { selector: "[data-debug='search-bar']", label: "Search" },
        { selector: "[data-debug='left-controls']", label: "Left Controls" },
        { selector: "[data-debug='right-controls']", label: "Right Controls" },
        { selector: "[data-debug='fab-container']", label: "FABs" },
        { selector: "[data-debug='bottom-cta']", label: "Bottom CTA" },
        { selector: "[data-debug='state-indicator']", label: "State Pill" },
        { selector: "[data-debug='nav-status']", label: "Nav Status" },
        { selector: ".leaflet-control-zoom", label: "Zoom" },
      ];

      const boxes: Array<{ id: string; rect: DOMRect; label: string }> = [];

      selectors.forEach(({ selector, label }) => {
        const el = document.querySelector(selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          boxes.push({ id: selector, rect, label });
        }
      });

      setElementBoxes(boxes);
    };

    // Initial scan
    updateElementBoxes();

    // Update on resize and scroll
    window.addEventListener("resize", updateElementBoxes);
    window.addEventListener("scroll", updateElementBoxes);

    // Periodic updates to catch animations
    const interval = setInterval(updateElementBoxes, 500);

    return () => {
      window.removeEventListener("resize", updateElementBoxes);
      window.removeEventListener("scroll", updateElementBoxes);
      clearInterval(interval);
    };
  }, [isDebug]);

  if (!isDebug) return null;

  return (
    <>
      {/* Safe Zone Boundaries */}
      <div className="debug-safe-zone debug-safe-zone-top">
        <span className="debug-label">TOP SAFE ZONE</span>
      </div>
      <div className="debug-safe-zone debug-safe-zone-bottom">
        <span className="debug-label">BOTTOM SAFE ZONE</span>
      </div>
      <div className="debug-safe-zone debug-safe-zone-left">
        <span className="debug-label">LEFT</span>
      </div>
      <div className="debug-safe-zone debug-safe-zone-right">
        <span className="debug-label">RIGHT</span>
      </div>

      {/* Element Bounding Boxes */}
      {elementBoxes.map(({ id, rect, label }) => (
        <div
          key={id}
          className="debug-element-box"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        >
          <span className="debug-label">{label}</span>
        </div>
      ))}

      {/* Debug Info Panel */}
      <div
        className="fixed bottom-4 right-4 z-[10000] bg-black/90 text-white text-xs p-3 rounded-lg font-mono max-w-[200px]"
        style={{ pointerEvents: "none" }}
      >
        <div className="font-bold mb-1">Debug Mode</div>
        <div>Window: {typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "N/A"}</div>
        <div className="mt-1 text-[10px] opacity-70">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#ff6b6b] inline-block"></span> Top
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#4ecdc4] inline-block"></span> Bottom
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#ffe66d] inline-block"></span> Left
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#a29bfe] inline-block"></span> Right
          </div>
        </div>
      </div>
    </>
  );
};
