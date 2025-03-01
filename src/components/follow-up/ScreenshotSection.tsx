
import React from "react";

interface ScreenshotSectionProps {
  screenshot: string;
  isScreenshotAnalysis: boolean;
}

export const ScreenshotSection = ({ 
  screenshot, 
  isScreenshotAnalysis 
}: ScreenshotSectionProps) => {
  if (!isScreenshotAnalysis || !screenshot) return null;
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Annotated Design</h2>
      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
        <img 
          src={screenshot} 
          alt="Annotated design screenshot" 
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <p className="text-sm text-neutral-600 mt-3">
          The annotated design highlights key areas that have been improved and issues that still need attention.
        </p>
      </div>
    </div>
  );
};
