
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { MultiScreenshotUpload } from "@/components/multi-upload/MultiScreenshotUpload";
import { UrlUpload } from "@/components/UrlUpload";
import { ProcessingState } from "@/components/ProcessingState";
import { UploadTypeSelector } from "./UploadTypeSelector";

interface UploadSectionProps {
  setShowFeedback: (show: boolean) => void;
}

export const UploadSection = ({ setShowFeedback }: UploadSectionProps) => {
  const [uploadType, setUploadType] = useState<"image" | "url" | "multi" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);

  const handleImageUpload = (file: File) => {
    console.log("Handling image upload:", file.name);
    setIsUploading(true);
    simulateProcessing();
  };

  const handleUrlUpload = (imageUrl: string, data: any) => {
    console.log("Handling URL upload:", imageUrl);
    setAnalysisData(data);
    setIsUploading(true);
    simulateProcessing();
  };

  const simulateProcessing = () => {
    setCurrentStage(0);
    const timer1 = setTimeout(() => setCurrentStage(1), 1500);
    const timer2 = setTimeout(() => setCurrentStage(2), 3000);
    const timer3 = setTimeout(() => {
      setCurrentStage(3);
      setTimeout(() => {
        setIsUploading(false);
        setShowFeedback(true);
      }, 1000);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <div className="p-8 relative overflow-hidden rounded-xl">
      {/* Background gradient effect with more transparency */}
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl opacity-80"></div>
      
      <div className="relative">
        <h2 className="text-3xl font-bold text-center mb-2 text-neutral-900">
          Upload Your Design
        </h2>
        <p className="text-center text-accent font-medium mb-8">
          Free first analysis / $18 after / cancel anytime
        </p>

        {!uploadType && !isUploading && (
          <UploadTypeSelector setUploadType={setUploadType} />
        )}

        {uploadType === "image" && !isUploading && (
          <div>
            <Button
              variant="outline"
              className="mb-6"
              onClick={() => setUploadType(null)}
            >
              ← Back to options
            </Button>
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>
        )}

        {uploadType === "multi" && !isUploading && (
          <div>
            <Button
              variant="outline"
              className="mb-6"
              onClick={() => setUploadType(null)}
            >
              ← Back to options
            </Button>
            <MultiScreenshotUpload onImageUpload={handleImageUpload} />
          </div>
        )}

        {uploadType === "url" && !isUploading && (
          <div>
            <Button
              variant="outline"
              className="mb-6"
              onClick={() => setUploadType(null)}
            >
              ← Back to options
            </Button>
            <UrlUpload onUrlAnalyze={handleUrlUpload} />
          </div>
        )}

        {isUploading && (
          <ProcessingState currentStage={currentStage} />
        )}
      </div>
    </div>
  );
};
