
import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScreenshotFile } from "./MultiScreenshotUpload";
import { ScreenshotOrdering } from "./ScreenshotOrdering";
import { OverlapAdjustment } from "./OverlapAdjustment";

interface ScreenshotArrangementProps {
  screenshots: ScreenshotFile[];
  onUpdateOrder: (screenshots: ScreenshotFile[]) => void;
  onUpdateOverlap: (id: string, overlap: number) => void;
  onRemoveScreenshot: (id: string) => void;
  onGeneratePreview: () => void;
  onReset: () => void;
}

export const ScreenshotArrangement = ({
  screenshots,
  onUpdateOrder,
  onUpdateOverlap,
  onRemoveScreenshot,
  onGeneratePreview,
  onReset,
}: ScreenshotArrangementProps) => {
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(
    screenshots.length > 0 ? screenshots[0].id : null
  );
  
  // Local state to ensure drag and drop works properly
  const [orderedScreenshots, setOrderedScreenshots] = useState<ScreenshotFile[]>(screenshots);
  
  // Update local state when screenshots prop changes
  useEffect(() => {
    setOrderedScreenshots(screenshots);
  }, [screenshots]);

  const handleDragEnd = (result: DropResult) => {
    console.log('Drag ended:', result);
    if (!result.destination) return;
    
    const items = Array.from(orderedScreenshots);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    console.log('Reordered items:', updatedItems);
    setOrderedScreenshots(updatedItems);
    
    // Check if this function exists and is being called
    if (typeof onUpdateOrder === 'function') {
      onUpdateOrder(updatedItems);
    } else {
      console.error('onUpdateOrder is not a function or not provided');
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Arrange Screenshots</h3>
        <p className="text-gray-600 mb-6">
          Drag to reorder your screenshots and adjust the overlap between adjacent images.
        </p>
        
        {/* DragDropContext wraps the entire reordering section */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <ScreenshotOrdering 
            screenshots={orderedScreenshots}
            activeScreenshot={activeScreenshot}
            setActiveScreenshot={setActiveScreenshot}
            onRemoveScreenshot={onRemoveScreenshot}
          />
        </DragDropContext>
        
        {/* Overlap adjustment section */}
        <OverlapAdjustment 
          screenshots={orderedScreenshots}
          onUpdateOverlap={onUpdateOverlap}
        />
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onReset}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Upload
          </Button>
          <Button 
            onClick={onGeneratePreview}
            className="bg-accent hover:bg-accent/90"
          >
            Preview Combined Result
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
