import { useState, useRef, useEffect } from "react";

function Tooltip({ children, content, className = "", position = "auto" }) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState("top");
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible && containerRef.current && position === "auto") {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      const tooltipHeight = 200; // Estimated tooltip height with padding

      // Check if element is in table header (typically near top) or has limited space above
      const isInTableHeader = containerRef.current.closest('thead') !== null;
      
      // If in table header or not enough space above, show below
      if (isInTableHeader || (spaceAbove < tooltipHeight && spaceBelow > tooltipHeight)) {
        setTooltipPosition("bottom");
      } else if (spaceAbove >= tooltipHeight) {
        setTooltipPosition("top");
      } else {
        // Default to bottom if both spaces are limited
        setTooltipPosition("bottom");
      }
    } else if (position !== "auto") {
      setTooltipPosition(position);
    }
  }, [isVisible, position]);

  if (!content) return children;

  const isTop = tooltipPosition === "top";

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-50 px-4 py-3 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-xl whitespace-normal max-w-md min-w-[200px] transform -translate-x-1/2 left-1/2 ${
            isTop 
              ? "-top-2 -translate-y-full" 
              : "top-full mt-2"
          }`}
        >
          <div className="break-words leading-relaxed">{content}</div>
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 ${
              isTop
                ? "top-full border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700"
                : "bottom-full border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-700"
            }`}
          ></div>
        </div>
      )}
    </div>
  );
}

export default Tooltip;
