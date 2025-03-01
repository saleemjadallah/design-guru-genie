
import { Droppable, Draggable, DropResult } from "react-beautiful-dnd";
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
  return (
    <div className="mb-8">
      <h4 className="text-lg font-medium mb-3">Step 1: Order Your Screenshots</h4>
      <p className="text-gray-600 mb-4">
        Drag the thumbnails to arrange them from top to bottom of your page.
      </p>
      
      <Droppable droppableId="screenshots" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex items-center space-x-4 min-h-[150px] w-full"
            style={{ overflowX: 'auto' }} // Using style for more control over overflow
          >
            {screenshots.map((screenshot, index) => (
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
    </div>
  );
};
