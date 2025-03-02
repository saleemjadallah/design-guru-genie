
import React, { createContext, useState, useContext } from 'react';
import { useImageUpload } from './useImageUpload';
import { useUrlAnalysis } from './useUrlAnalysis';

type UploadType = 'image' | 'multi' | 'url' | null;

interface UploadContextType {
  uploadData: any | null;
  uploadType: UploadType;
  setUploadType: React.Dispatch<React.SetStateAction<UploadType>>;
  isUploading: boolean;
  currentStage: number;
  analyzeImage: (file: File) => Promise<void>;
  analyzeUrl: (url: string, data?: any) => Promise<void>;
}

const UploadContext = createContext<UploadContextType | null>(null);

export const UploadProvider = ({ children }: { children: React.ReactNode }) => {
  const [uploadData, setUploadData] = useState<any | null>(null);
  const [uploadType, setUploadType] = useState<UploadType>(null);
  const { isUploading, currentStage, analyzeImage } = useImageUpload();
  const { analyzeUrl } = useUrlAnalysis();

  return (
    <UploadContext.Provider value={{ 
      uploadData, 
      uploadType,
      setUploadType,
      isUploading,
      currentStage,
      analyzeImage,
      analyzeUrl
    }}>
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};
