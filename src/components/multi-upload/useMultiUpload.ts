
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { DropResult } from "react-beautiful-dnd";
import { ScreenshotFile, UploadStep } from "./types";
import { initialState } from "./upload-state";
import { 
  validateImageFiles,
  createScreenshotPreviews,
  handleSuccessfulUpload,
  revokeObjectURLs
} from "./file-handlers";
import {
  updateScreenshotOverlap,
  removeScreenshotById,
  handleDragEndReordering
} from "./screenshot-manager";
import {
  generateCombinedImagePreview,
  processCombinedImage
} from "./image-processor";

export function useMultiUpload(onImageUpload: (file: File) => void) {
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>(initialState.screenshots);
  const [step, setStep] = useState<UploadStep>(initialState.step);
  const [combinedImage, setCombinedImage] = useState<string | null>(initialState.combinedImage);
  const [processingStage, setProcessingStage] = useState(initialState.processingStage);
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(initialState.activeScreenshot);

  const handleFiles = (files: File[]) => {
    const imageFiles = validateImageFiles(files);
    if (imageFiles.length === 0) return;

    // Create preview URLs for the images
    const newScreenshots = createScreenshotPreviews(imageFiles, screenshots);
    setScreenshots([...screenshots, ...newScreenshots]);
    
    handleSuccessfulUpload(imageFiles.length);
  };

  const removeScreenshot = (id: string) => {
    const screenshotToRemove = screenshots.find(s => s.id === id);
    if (screenshotToRemove) {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(screenshotToRemove.preview);
    }
    
    // If the active screenshot is being removed, clear it
    if (activeScreenshot === id) {
      setActiveScreenshot(null);
    }
    
    const updatedScreenshots = removeScreenshotById(screenshots, id);
    setScreenshots(updatedScreenshots);
  };

  const handleDragEnd = (result: DropResult) => {
    console.log("DragEnd result:", result);
    const updatedScreenshots = handleDragEndReordering(screenshots, result);
    console.log("Updated screenshots:", updatedScreenshots);
    setScreenshots(updatedScreenshots);
  };

  const updateOverlap = (id: string, overlap: number) => {
    const updatedScreenshots = updateScreenshotOverlap(screenshots, id, overlap);
    setScreenshots(updatedScreenshots);
  };

  const handleGeneratePreview = async () => {
    setStep("preview");
    
    try {
      const stitchedImageUrl = await generateCombinedImagePreview(screenshots);
      setCombinedImage(stitchedImageUrl);
    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Preview generation failed",
        description: "There was an error creating the preview. Please try adjusting the overlap.",
        variant: "destructive",
      });
      setStep("arrange");
    }
  };

  const handleAnalyze = async () => {
    if (!combinedImage) return;
    
    setStep("processing");
    
    try {
      // Process the combined image and get a File object
      const file = await processCombinedImage(combinedImage, setProcessingStage);
      
      // Log the file details for debugging
      console.log("Processed combined image:", file.name, file.type, file.size);
      
      // Call the onImageUpload callback with the combined file
      onImageUpload(file);
    } catch (error) {
      console.error("Error processing combined image:", error);
      toast({
        title: "Processing failed",
        description: "There was an error processing the combined image. Please try again.",
        variant: "destructive",
      });
      setStep("preview");
    }
  };

  const resetToUpload = () => {
    // Clean up URL objects to prevent memory leaks
    revokeObjectURLs(screenshots);
    
    if (combinedImage) {
      URL.revokeObjectURL(combinedImage);
    }
    
    setScreenshots([]);
    setCombinedImage(null);
    setActiveScreenshot(null);
    setStep("upload");
  };

  return {
    screenshots,
    step,
    combinedImage,
    processingStage,
    activeScreenshot,
    setActiveScreenshot,
    handleFiles,
    removeScreenshot,
    handleDragEnd,
    updateOverlap,
    handleGeneratePreview,
    handleAnalyze,
    resetToUpload,
    goToStep: setStep
  };
}
