
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ScreenshotPreviewProps {
  combinedImage: string | null;
  onBack: () => void;
  onAnalyze: () => void;
  onReset: () => void;
}

export const ScreenshotPreview = ({
  combinedImage,
  onBack,
  onAnalyze,
  onReset,
}: ScreenshotPreviewProps) => {
  const [zoom, setZoom] = useState(100);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  if (!combinedImage) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No preview available. Please go back and adjust your settings.</p>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold mb-4">Preview Combined Result</h3>
      <p className="text-gray-600 mb-6">
        Check if your screenshots are aligned correctly before proceeding to analysis.
      </p>
      
      {/* Zoom controls */}
      <div className="flex items-center mb-4 space-x-4">
        <ZoomOut className="h-5 w-5 text-gray-500" />
        <div className="flex-1">
          <Slider
            defaultValue={[zoom]}
            min={50}
            max={150}
            step={5}
            onValueChange={handleZoomChange}
          />
        </div>
        <ZoomIn className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium w-16 text-right">{zoom}%</span>
      </div>
      
      {/* Preview area */}
      <div className="border border-gray-200 rounded-lg overflow-auto max-h-[500px] mb-6 bg-gray-100" ref={previewRef}>
        <div className="flex justify-center min-h-[500px]">
          <img 
            src={combinedImage} 
            alt="Combined screenshot" 
            style={{ width: `${zoom}%`, minWidth: `${zoom}%` }}
            className="max-w-none"
          />
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-amber-800 mb-2">Before you proceed</h4>
        <ul className="text-sm text-amber-700 space-y-2">
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-amber-600" />
            Check that the images align properly, especially at the overlap points.
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-amber-600" />
            Verify that all content is visible and nothing important is cut off.
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-amber-600" />
            If you notice any issues, go back and adjust the ordering or overlap settings.
          </li>
        </ul>
      </div>
      
      <div className="flex justify-between">
        <div>
          <Button
            variant="outline"
            onClick={onBack}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Adjust Arrangement
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
          >
            Start Over
          </Button>
        </div>
        <Button 
          onClick={onAnalyze}
          className="bg-accent hover:bg-accent/90"
        >
          Confirm & Analyze
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
