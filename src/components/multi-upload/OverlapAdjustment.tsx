
import { Slider } from "@/components/ui/slider";
import type { ScreenshotFile } from "./MultiScreenshotUpload";

interface OverlapAdjustmentProps {
  selectedScreenshot?: ScreenshotFile | undefined;
  screenshots: ScreenshotFile[];
  onUpdateOverlap: (id: string, overlap: number) => void;
}

export const OverlapAdjustment = ({
  selectedScreenshot,
  screenshots,
  onUpdateOverlap,
}: OverlapAdjustmentProps) => {
  const handleOverlapChange = (value: number[], id: string) => {
    onUpdateOverlap(id, value[0]);
  };

  return (
    <div className="mb-8">
      <h4 className="text-lg font-medium mb-3">Step 2: Adjust Overlap</h4>
      <p className="text-gray-600 mb-4">
        Set how much each screenshot should overlap with the next one.
      </p>
      
      <div className="space-y-6">
        {screenshots.slice(0, -1).map((screenshot, index) => {
          const nextScreenshot = screenshots[index + 1];
          if (!nextScreenshot) return null;
          
          return (
            <div key={screenshot.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Screenshot {index + 1} & {index + 2}
                </span>
                <span className="text-sm text-accent font-medium">
                  {screenshot.overlap}% overlap
                </span>
              </div>
              <div className="flex gap-4">
                <div className="w-1/3 relative overflow-hidden rounded border border-gray-200">
                  <img
                    src={screenshot.preview}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full object-cover"
                  />
                  <div 
                    className="absolute bottom-0 right-0 h-[calc(var(--overlap-percent)*1%)] w-full bg-gradient-to-t from-accent/30 to-transparent"
                    style={{ "--overlap-percent": screenshot.overlap } as React.CSSProperties}
                  />
                </div>
                <div className="flex-1">
                  <Slider
                    defaultValue={[screenshot.overlap]}
                    min={5}
                    max={40}
                    step={1}
                    onValueChange={(value) => handleOverlapChange(value, screenshot.id)}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Less overlap (5%)</span>
                    <span>More overlap (40%)</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
