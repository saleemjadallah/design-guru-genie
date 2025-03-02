
import React from "react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { MultiScreenshotUpload } from "@/components/multi-upload/MultiScreenshotUpload";
import { UrlUpload } from "@/components/url-upload/UrlUpload";
import { UploadTypeSelector } from "./UploadTypeSelector";
import { ProcessingState } from "@/components/ProcessingState";
import { useUpload } from "./UploadContext";

export const UploadOptions: React.FC = () => {
  const { 
    uploadType, 
    setUploadType, 
    isUploading, 
    currentStage,
    analyzeImage,
    analyzeUrl
  } = useUpload();

  const BackButton = () => (
    <Button
      variant="outline"
      className="mb-6"
      onClick={() => setUploadType(null)}
    >
      ← Back to options
    </Button>
  );

  if (isUploading) {
    return <ProcessingState currentStage={currentStage} />;
  }

  if (!uploadType) {
    return <UploadTypeSelector />;
  }

  switch (uploadType) {
    case "image":
      return (
        <div>
          <BackButton />
          <ImageUpload onImageUpload={analyzeImage} />
        </div>
      );
    case "multi":
      return (
        <div>
          <BackButton />
          <MultiScreenshotUpload onImageUpload={analyzeImage} />
        </div>
      );
    case "url":
      return (
        <div>
          <BackButton />
          <UrlUpload onUrlAnalyze={analyzeUrl} />
        </div>
      );
    default:
      return null;
  }
};
