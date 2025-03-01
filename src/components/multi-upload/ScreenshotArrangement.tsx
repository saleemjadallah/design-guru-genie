import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { ChevronLeft, ChevronRight, X, MoveVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { ScreenshotFile } from "./MultiScreenshotUpload";

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

  const handleOverlapChange = (value: number[], id: string) => {
    onUpdateOverlap(id, value[0]);
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Arrange Screenshots</h3>
        <p className="text-gray-600 mb-6">
          Drag to reorder your screenshots and adjust the overlap between adjacent images.
        </p>
        
        {/* Screenshot ordering */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-3">Step 1: Order Your Screenshots</h4>
          <p className="text-gray-600 mb-4">
            Drag the thumbnails to arrange them from top to bottom of your page.
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="screenshots" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex items-center space-x-4 overflow-x-auto pb-4"
                >
                  {orderedScreenshots.map((screenshot, index) => (
                    <Draggable key={screenshot.id} draggableId={screenshot.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative flex-shrink-0 border-2 rounded-md ${
                            activeScreenshot === screenshot.id
                              ? "border-accent"
                              : snapshot.isDragging ? "border-blue-400" : "border-gray-200"
                          } ${snapshot.isDragging ? "shadow-lg" : ""} cursor-pointer`}
                          onClick={() => setActiveScreenshot(screenshot.id)}
                        >
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {index + 1}
                          </div>
                          {/* Use a separate element for the drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-500 text-white rounded-full p-1 cursor-grab"
                          >
                            <MoveVertical className="h-3 w-3" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveScreenshot(screenshot.id);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <img
                            src={screenshot.preview}
                            alt={`Screenshot ${index + 1}`}
                            className="h-36 object-cover rounded-sm"
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        {/* Overlap adjustment */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-3">Step 2: Adjust Overlap</h4>
          <p className="text-gray-600 mb-4">
            Set how much each screenshot should overlap with the next one.
          </p>
          
          <div className="space-y-6">
            {orderedScreenshots.slice(0, -1).map((screenshot, index) => {
              const nextScreenshot = orderedScreenshots[index + 1];
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
