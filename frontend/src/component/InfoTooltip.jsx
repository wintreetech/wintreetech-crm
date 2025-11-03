import { Info } from "lucide-react";
import { useState } from "react";

const InfoTooltip = ({ message }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center">
      {/* Info Icon */}
      <Info
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer"
      />

      {/* Tooltip (conditionally rendered) */}
      {isHovered && (
        <div className="absolute w-56 left-1/2 -translate-x-1/2 bottom-7 bg-gray-800 text-white text-xs px-3 py-2 rounded-md shadow-md whitespace-wrap z-10 text-center">
          {message}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
