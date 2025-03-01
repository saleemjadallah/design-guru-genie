
import { toast } from "@/hooks/use-toast";
import { ScreenshotFile } from "./types";

export function validateImageFiles(files: File[]): File[] {
  const imageFiles = files.filter((file) => 
    file.type === "image/jpeg" || 
    file.type === "image/png" || 
    file.type === "image/webp"
  );

  if (imageFiles.length === 0) {
    toast({
      title: "Invalid files",
      description: "Please upload only image files (JPG, PNG, WebP).",
      variant: "destructive",
    });
  }
  
  return imageFiles;
}

export function createScreenshotPreviews(
  imageFiles: File[], 
  existingScreenshots: ScreenshotFile[]
): ScreenshotFile[] {
  return imageFiles.map((file, index) => {
    return {
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      order: existingScreenshots.length + index,
      overlap: 20, // Default overlap percentage
    };
  });
}

export function handleSuccessfulUpload(imageFilesCount: number): void {
  if (imageFilesCount > 0) {
    toast({
      title: "Images uploaded",
      description: `${imageFilesCount} screenshot${imageFilesCount > 1 ? 's' : ''} added successfully.`,
    });
  }
}

export function revokeObjectURLs(screenshots: ScreenshotFile[]): void {
  screenshots.forEach(screenshot => {
    URL.revokeObjectURL(screenshot.preview);
  });
}
