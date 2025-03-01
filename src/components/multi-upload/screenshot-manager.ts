
import { DropResult } from "react-beautiful-dnd";
import { ScreenshotFile } from "./types";

export function updateScreenshotOverlap(
  screenshots: ScreenshotFile[],
  id: string, 
  overlap: number
): ScreenshotFile[] {
  return screenshots.map(screenshot => 
    screenshot.id === id ? { ...screenshot, overlap } : screenshot
  );
}

export function removeScreenshotById(
  screenshots: ScreenshotFile[],
  id: string
): ScreenshotFile[] {
  const updatedScreenshots = screenshots.filter(s => s.id !== id);
  
  // Reorder the remaining screenshots
  return updatedScreenshots.map((s, index) => ({
    ...s,
    order: index
  }));
}

export function handleDragEndReordering(
  screenshots: ScreenshotFile[],
  result: DropResult
): ScreenshotFile[] {
  // Dropped outside the list or no destination
  if (!result.destination) {
    return screenshots;
  }

  const sourceIndex = result.source.index;
  const destinationIndex = result.destination.index;
  
  // Don't do anything if dropped in the same place
  if (sourceIndex === destinationIndex) {
    return screenshots;
  }

  // Sort by order first to ensure we're working with the right sequence
  const orderedItems = [...screenshots].sort((a, b) => a.order - b.order);
  const [reorderedItem] = orderedItems.splice(sourceIndex, 1);
  orderedItems.splice(destinationIndex, 0, reorderedItem);

  // Update the order properties
  return orderedItems.map((item, index) => ({
    ...item,
    order: index
  }));
}
