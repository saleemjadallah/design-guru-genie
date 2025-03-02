
import { useState } from "react";
import { UploadBackground } from "./UploadBackground";
import { UploadHeader } from "./UploadHeader";
import { UploadOptions } from "./UploadOptions";
import { useImageAnalysis } from "./useImageAnalysis";

export const UploadSection = () => {
  const [uploadType, setUploadType] = useState<"image" | "url" | "multi" | null>(null);
  const { isUploading, currentStage, analyzeImage, analyzeUrl } = useImageAnalysis();

  return (
    <UploadBackground>
      <UploadHeader />
      <UploadOptions
        uploadType={uploadType}
        setUploadType={setUploadType}
        handleImageUpload={analyzeImage}
        handleUrlUpload={analyzeUrl}
        isUploading={isUploading}
        currentStage={currentStage}
      />
    </UploadBackground>
  );
};
