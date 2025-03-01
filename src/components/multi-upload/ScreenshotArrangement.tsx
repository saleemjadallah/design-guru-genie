
import { useState } from "react";
import { ScreenshotOrdering } from "./ScreenshotOrdering";
import { OverlapAdjustment } from "./OverlapAdjustment";
import { Button } from "@/components/ui/button";
import { ScreenshotFile } from "./types";

interface ScreenshotArrangementProps {
  screenshots: ScreenshotFile[];
  activeScreenshot: string | null;
  setActiveScreenshot: (id: string | null) => void;
  onRemoveScreenshot: (id: string) => void;
  onUpdateOverlap: (id: string, overlap: number) => void;
  onGeneratePreview: () => void;
  onReset: () => void;
}

export const ScreenshotArrangement = ({
  screenshots,
  activeScreenshot,
  setActiveScreenshot,
  onRemoveScreenshot,
  onUpdateOverlap,
  onGeneratePreview,
  onReset,
}: ScreenshotArrangementProps) => {
  console.log("Rendering ScreenshotArrangement with screenshots:", screenshots);
  
  // Find the active screenshot object if there is an active ID
  const selectedScreenshot = activeScreenshot 
    ? screenshots.find(s => s.id === activeScreenshot) 
    : undefined;
  
  return (
    <div className="space-y-6">
      <ScreenshotOrdering
        screenshots={screenshots}
        activeScreenshot={activeScreenshot}
        setActiveScreenshot={setActiveScreenshot}
        onRemoveScreenshot={onRemoveScreenshot}
      />
      
      {activeScreenshot && selectedScreenshot && (
        <OverlapAdjustment
          selectedScreenshot={selectedScreenshot}
          screenshots={screenshots}
          onUpdateOverlap={onUpdateOverlap}
        />
      )}
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onReset}>
          Start Over
        </Button>
        <Button 
          onClick={onGeneratePreview}
          disabled={screenshots.length < 1}
        >
          Generate Preview
        </Button>
      </div>
    </div>
  );
};
