
import React, { createContext, useContext, ReactNode, useState } from "react";
import { useImageAnalysis } from "./useImageAnalysis";

// Define the context type
interface UploadContextType {
  uploadType: "image" | "url" | "multi" | null;
  setUploadType: (type: "image" | "url" | "multi" | null) => void;
  isUploading: boolean;
  currentStage: number;
  analyzeImage: (file: File) => Promise<void>;
  analyzeUrl: (imageUrl: string, data: any) => Promise<void>;
}

// Create the context with a default value
const UploadContext = createContext<UploadContextType | undefined>(undefined);

// Create a provider component
export const UploadProvider = ({ children }: { children: ReactNode }) => {
  const { isUploading, currentStage, analyzeImage, analyzeUrl } = useImageAnalysis();
  const [uploadType, setUploadType] = useState<"image" | "url" | "multi" | null>(null);

  const value = {
    uploadType,
    setUploadType,
    isUploading,
    currentStage,
    analyzeImage,
    analyzeUrl
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
};

// Create a custom hook to use the context
export const useUpload = (): UploadContextType => {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
};
