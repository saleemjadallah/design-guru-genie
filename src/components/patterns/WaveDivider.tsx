
import React from "react";

type WaveDividerProps = {
  fillColor?: string;
  height?: number;
  className?: string;
};

export const WaveDivider: React.FC<WaveDividerProps> = ({
  fillColor = "#F9FAFB",
  height = 50,
  className = "",
}) => {
  return (
    <div className={`relative w-full ${className}`} style={{ height: `${height}px` }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="absolute w-full h-full"
      >
        <path
          fill={fillColor}
          fillOpacity="1"
          d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
        />
      </svg>
    </div>
  );
};
