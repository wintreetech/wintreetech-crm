import { Info } from "lucide-react";
import { useState, useRef, useLayoutEffect } from "react";

const InfoTooltip = ({ message }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({
    left: "50%",
    transform: "translateX(-50%)",
  });
  const tooltipRef = useRef(null);

  const resetStyle = () => ({
    left: "50%",
    transform: "translateX(-50%)",
  });

  useLayoutEffect(() => {
    if (isHovered && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const viewportWidth = window.innerWidth;
      const PADDING = 8;

      tooltip.style.left = "50%";
      tooltip.style.transform = "translateX(-50%)";

      const tooltipRect = tooltip.getBoundingClientRect();
      let offsetX = 0;

      if (tooltipRect.left < PADDING) {
        offsetX = PADDING - tooltipRect.left;
      } else if (tooltipRect.right > viewportWidth - PADDING) {
        offsetX = -(tooltipRect.right - (viewportWidth - PADDING));
      }

      if (offsetX !== 0) {
        setTooltipStyle({
          left: "50%",
          transform: `translateX(calc(-50% + ${offsetX}px))`,
        });
      } else {
        setTooltipStyle(resetStyle());
      }
    }
  }, [isHovered]);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTooltipStyle(resetStyle());
  };

  return (
    <div className="relative flex items-center">
      <Info
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer"
      />

      {isHovered && (
        <div
          ref={tooltipRef}
          style={tooltipStyle}
          className="absolute bottom-8 bg-gray-800 text-white text-xs px-3 py-2 rounded-md shadow-md z-10 text-center
                     w-56 max-w-[90vw] break-words leading-snug"
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
