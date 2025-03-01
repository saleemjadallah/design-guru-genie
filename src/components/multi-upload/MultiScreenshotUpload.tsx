
import { useState } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ScreenshotArrangement } from "./ScreenshotArrangement";
import { ScreenshotPreview } from "./ScreenshotPreview";
import { stitchImages } from "@/utils/image-stitching";
import { ProcessingState } from "@/components/ProcessingState";
import { supabase } from "@/integrations/supabase/client";

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
  const [isDragging, setIsDragging] = useState(false);
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);
  const [step, setStep] = useState<"upload" | "arrange" | "preview" | "processing">("upload");
  const [combinedImage, setCombinedImage] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

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

  const renderStepContent = () => {
    switch (step) {
      case "upload":
        return (
          <div
            className={`relative flex flex-col items-center justify-center w-full h-80 p-8 border-2 border-dashed rounded-xl transition-all ${
              isDragging
                ? "border-accent bg-accent/5 scale-[1.02]"
                : "border-neutral-200 hover:border-accent/50 hover:bg-neutral-50"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <Upload
              className={`w-16 h-16 mb-6 ${
                isDragging ? "text-accent" : "text-neutral-400"
              }`}
            />
            <h3 className="text-2xl font-semibold mb-3 text-neutral-800">
              Drop multiple screenshots here
            </h3>
            <p className="mb-6 text-neutral-600">
              Upload multiple screenshots of the same design to stitch them together
            </p>
            <Button className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors">
              Select Files
            </Button>
            <input
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInput}
              accept="image/jpeg,image/png,image/webp"
            />
          </div>
        );
        
      case "arrange":
        return (
          <ScreenshotArrangement 
            screenshots={screenshots}
            onUpdateOrder={updateScreenshotOrder}
            onUpdateOverlap={updateOverlap}
            onRemoveScreenshot={removeScreenshot}
            onGeneratePreview={handleGeneratePreview}
            onReset={resetToUpload}
          />
        );
        
      case "preview":
        return (
          <ScreenshotPreview 
            combinedImage={combinedImage}
            onBack={() => setStep("arrange")}
            onAnalyze={handleAnalyze}
            onReset={resetToUpload}
          />
        );
        
      case "processing":
        return <ProcessingState currentStage={processingStage} />;
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Step indicator */}
      {step !== "processing" && (
        <div className="mb-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {["upload", "arrange", "preview"].map((stepName, index) => (
              <div 
                key={stepName} 
                className="flex flex-col items-center"
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step === stepName 
                      ? "bg-accent text-white" 
                      : index < ["upload", "arrange", "preview"].indexOf(step) 
                        ? "bg-accent/20 text-accent" 
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`text-sm ${step === stepName ? "font-medium text-accent" : "text-gray-500"}`}>
                  {stepName === "upload" ? "Upload" : stepName === "arrange" ? "Arrange" : "Preview"}
                </span>
              </div>
            ))}
            
            {/* Connector lines */}
            <div className="h-[2px] w-full absolute top-5 -z-10 bg-gray-200 max-w-[calc(100%-8rem)] mx-auto left-0 right-0">
              <div 
                className="h-full bg-accent transition-all" 
                style={{ 
                  width: step === "upload" 
                    ? "0%" 
                    : step === "arrange" 
                      ? "50%" 
                      : "100%" 
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Screenshot thumbnails */}
      {step === "upload" && screenshots.length > 0 && (
        <div className="mb-6 overflow-x-auto">
          <h4 className="text-lg font-semibold mb-3">Uploaded Screenshots ({screenshots.length})</h4>
          <div className="flex space-x-4">
            {screenshots.map((screenshot) => (
              <div key={screenshot.id} className="relative flex-shrink-0">
                <img 
                  src={screenshot.preview} 
                  alt={`Screenshot ${screenshot.order + 1}`}
                  className="h-24 object-cover rounded-md border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(screenshot.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          
          {screenshots.length >= 2 && (
            <div className="mt-4">
              <Button 
                onClick={() => setStep("arrange")}
                className="bg-accent hover:bg-accent/90"
              >
                Continue to Arrange
              </Button>
            </div>
          )}
          
          {screenshots.length === 1 && (
            <div className="mt-4 flex items-center text-amber-600 bg-amber-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>You need at least 2 screenshots to continue. Upload more or use the single upload option instead.</span>
            </div>
          )}
        </div>
      )}
      
      {renderStepContent()}
    </div>
  );
};
