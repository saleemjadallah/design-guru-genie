
import { Droppable, Draggable } from "react-beautiful-dnd";
import { MoveVertical, X } from "lucide-react";
import type { ScreenshotFile } from "./MultiScreenshotUpload";

interface ScreenshotOrderingProps {
  screenshots: ScreenshotFile[];
  activeScreenshot: string | null;
  setActiveScreenshot: (id: string | null) => void;
  onRemoveScreenshot: (id: string) => void;
}

export const ScreenshotOrdering = ({
  screenshots,
  activeScreenshot,
  setActiveScreenshot,
  onRemoveScreenshot,
}: ScreenshotOrderingProps) => {
  console.log("Rendering ScreenshotOrdering with screenshots:", screenshots);
  
  return (
    <div className="mb-8">
      <h4 className="text-lg font-medium mb-3">Step 1: Order Your Screenshots</h4>
      <p className="text-gray-600 mb-4">
        Drag the thumbnails to arrange them from top to bottom of your page.
      </p>
      
      <Droppable droppableId="screenshots" direction="horizontal">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex items-center space-x-4 pb-4 overflow-x-auto min-h-[150px] w-full ${
              snapshot.isDraggingOver ? "bg-gray-50" : ""
            }`}
          >
            {screenshots.length > 0 ? (
              screenshots
                .sort((a, b) => a.order - b.order)
                .map((screenshot, index) => (
                  <Draggable 
                    key={screenshot.id} 
                    draggableId={screenshot.id} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative flex-shrink-0 border-2 rounded-md ${
                          activeScreenshot === screenshot.id
                            ? "border-accent"
                            : snapshot.isDragging ? "border-blue-400" : "border-gray-200"
                        } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                        onClick={() => setActiveScreenshot(screenshot.id)}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div 
                          {...provided.dragHandleProps}
                          className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 cursor-grab"
                        >
                          <MoveVertical className="h-3 w-3" />
                          <span>{index + 1}</span>
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
                ))
            ) : (
              <div className="text-gray-500 text-center w-full py-4">
                No screenshots added yet
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
