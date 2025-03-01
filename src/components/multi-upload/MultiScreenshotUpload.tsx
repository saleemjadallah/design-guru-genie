
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { ScreenshotArrangement } from "./ScreenshotArrangement";
import { ScreenshotPreview } from "./ScreenshotPreview";
import { stitchImages } from "@/utils/image-stitching";
import { ProcessingState } from "@/components/ProcessingState";
import { supabase } from "@/integrations/supabase/client";
import { StepIndicator } from "./StepIndicator";
import { UploadZone } from "./UploadZone";

export interface ScreenshotFile {
  id: string;
  file: File;
  preview: string;
  order: number;
  overlap: number; // Percentage of overlap with the next image (0-100)
}

interface MultiScreenshotUploadProps {
  onImageUpload: (file: File) => void;
}

export const MultiScreenshotUpload = ({ onImageUpload }: MultiScreenshotUploadProps) => {
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);
  const [step, setStep] = useState<"upload" | "arrange" | "preview" | "processing">("upload");
  const [combinedImage, setCombinedImage] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState(0);

  const handleFiles = (files: File[]) => {
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
      return;
    }

    // Create preview URLs for the images
    const newScreenshots = imageFiles.map((file, index) => {
      return {
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        order: screenshots.length + index,
        overlap: 20, // Default overlap percentage
      };
    });

    setScreenshots([...screenshots, ...newScreenshots]);
    
    if (imageFiles.length > 0) {
      toast({
        title: "Images uploaded",
        description: `${imageFiles.length} screenshot${imageFiles.length > 1 ? 's' : ''} added successfully.`,
      });
    }
  };

  const removeScreenshot = (id: string) => {
    const screenshotToRemove = screenshots.find(s => s.id === id);
    if (screenshotToRemove) {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(screenshotToRemove.preview);
    }
    
    const updatedScreenshots = screenshots.filter(s => s.id !== id);
    // Reorder the remaining screenshots
    const reorderedScreenshots = updatedScreenshots.map((s, index) => ({
      ...s,
      order: index
    }));
    
    setScreenshots(reorderedScreenshots);
  };

  const updateScreenshotOrder = (reorderedScreenshots: ScreenshotFile[]) => {
    setScreenshots(reorderedScreenshots);
  };

  const updateOverlap = (id: string, overlap: number) => {
    setScreenshots(screenshots.map(screenshot => 
      screenshot.id === id ? { ...screenshot, overlap } : screenshot
    ));
  };

  const handleGeneratePreview = async () => {
    setStep("preview");
    
    try {
      // Sort screenshots by order
      const orderedScreenshots = [...screenshots].sort((a, b) => a.order - b.order);
      
      // Generate the combined image
      const stitchedImageUrl = await stitchImages(orderedScreenshots);
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
      // Process the combined image
      setProcessingStage(0);
      
      // Convert data URL to File
      const response = await fetch(combinedImage);
      const blob = await response.blob();
      const file = new File([blob], "combined-screenshot.png", { type: "image/png" });
      
      // Update processing stages
      setProcessingStage(1);
      
      // Upload to storage if needed
      const timestamp = new Date().getTime();
      const filePath = `combined_screenshots/${timestamp}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('designs')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      setProcessingStage(2);
      
      // Get the public URL
      const { data } = supabase.storage
        .from('designs')
        .getPublicUrl(filePath);
        
      // Use the uploaded file for analysis
      setProcessingStage(3);
      
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
    screenshots.forEach(screenshot => {
      URL.revokeObjectURL(screenshot.preview);
    });
    
    if (combinedImage) {
      URL.revokeObjectURL(combinedImage);
    }
    
    setScreenshots([]);
    setCombinedImage(null);
    setStep("upload");
  };

  return (
    <div className="w-full">
      {/* Step indicator */}
      {step !== "processing" && <StepIndicator currentStep={step} />}
      
      {/* Step content */}
      {step === "upload" && (
        <UploadZone 
          screenshots={screenshots}
          onFilesAdded={handleFiles}
          onRemoveScreenshot={removeScreenshot}
          onContinue={() => setStep("arrange")}
        />
      )}
      
      {step === "arrange" && (
        <ScreenshotArrangement 
          screenshots={screenshots}
          onUpdateOrder={updateScreenshotOrder}
          onUpdateOverlap={updateOverlap}
          onRemoveScreenshot={removeScreenshot}
          onGeneratePreview={handleGeneratePreview}
          onReset={resetToUpload}
        />
      )}
      
      {step === "preview" && (
        <ScreenshotPreview 
          combinedImage={combinedImage}
          onBack={() => setStep("arrange")}
          onAnalyze={handleAnalyze}
          onReset={resetToUpload}
        />
      )}
      
      {step === "processing" && <ProcessingState currentStage={processingStage} />}
    </div>
  );
};
