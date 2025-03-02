
import React from "react";

interface UploadBackgroundProps {
  children: React.ReactNode;
}

export const UploadBackground: React.FC<UploadBackgroundProps> = ({ children }) => {
  return (
    <div className="p-8 relative overflow-hidden rounded-xl">
      {/* Background gradient effect with more transparency */}
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl opacity-80"></div>
      <div className="relative">
        {children}
      </div>
    </div>
  );
};
