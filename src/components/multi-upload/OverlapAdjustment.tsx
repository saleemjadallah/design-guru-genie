
import { Slider } from "@/components/ui/slider";
import { ScreenshotFile } from "./types";

interface OverlapAdjustmentProps {
  selectedScreenshot: ScreenshotFile;
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

  // Get the order of the selected screenshot
  const selectedOrder = selectedScreenshot.order;
  
  // Only show overlap adjustment if this is not the last screenshot
  const isLastScreenshot = screenshots.every(s => s.order <= selectedOrder || s.order > selectedOrder + 1);
  
  if (isLastScreenshot && selectedOrder === screenshots.length - 1) {
    return (
      <div className="mb-8">
        <h4 className="text-lg font-medium mb-3">Step 2: Adjust Overlap</h4>
        <p className="text-gray-600 mb-4">
          This is the last screenshot, so no overlap adjustment is needed.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h4 className="text-lg font-medium mb-3">Step 2: Adjust Overlap</h4>
      <p className="text-gray-600 mb-4">
        Set how much this screenshot should overlap with the next one.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Screenshot {selectedOrder + 1} & {selectedOrder + 2}
          </span>
          <span className="text-sm text-accent font-medium">
            {selectedScreenshot.overlap}% overlap
          </span>
        </div>
        <div className="flex gap-4">
          <div className="w-1/3 relative overflow-hidden rounded border border-gray-200">
            <img
              src={selectedScreenshot.preview}
              alt={`Screenshot ${selectedOrder + 1}`}
              className="w-full object-cover"
            />
            <div 
              className="absolute bottom-0 right-0 h-[calc(var(--overlap-percent)*1%)] w-full bg-gradient-to-t from-accent/30 to-transparent"
              style={{ "--overlap-percent": selectedScreenshot.overlap } as React.CSSProperties}
            />
          </div>
          <div className="flex-1">
            <Slider
              defaultValue={[selectedScreenshot.overlap]}
              min={5}
              max={40}
              step={1}
              onValueChange={(value) => handleOverlapChange(value, selectedScreenshot.id)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Less overlap (5%)</span>
              <span>More overlap (40%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
