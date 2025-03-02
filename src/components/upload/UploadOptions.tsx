
import React from "react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { MultiScreenshotUpload } from "@/components/multi-upload/MultiScreenshotUpload";
import { UrlUpload } from "@/components/UrlUpload";
import { UploadTypeSelector } from "./UploadTypeSelector";
import { ProcessingState } from "@/components/ProcessingState";

interface UploadOptionsProps {
  uploadType: "image" | "url" | "multi" | null;
  setUploadType: (type: "image" | "url" | "multi" | null) => void;
  handleImageUpload: (file: File) => void;
  handleUrlUpload: (imageUrl: string, data: any) => void;
  isUploading: boolean;
  currentStage: number;
}

export const UploadOptions: React.FC<UploadOptionsProps> = ({
  uploadType,
  setUploadType,
  handleImageUpload,
  handleUrlUpload,
  isUploading,
  currentStage,
}) => {
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
    return <UploadTypeSelector setUploadType={setUploadType} />;
  }

  switch (uploadType) {
    case "image":
      return (
        <div>
          <BackButton />
          <ImageUpload onImageUpload={handleImageUpload} />
        </div>
      );
    case "multi":
      return (
        <div>
          <BackButton />
          <MultiScreenshotUpload onImageUpload={handleImageUpload} />
        </div>
      );
    case "url":
      return (
        <div>
          <BackButton />
          <UrlUpload onUrlAnalyze={handleUrlUpload} />
        </div>
      );
    default:
      return null;
  }
};
