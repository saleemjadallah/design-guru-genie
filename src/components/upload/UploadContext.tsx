
import React, { createContext, useState, useContext } from 'react';
import { useImageUpload } from './useImageUpload';
import { useUrlAnalysis } from './useUrlAnalysis';

type UploadType = 'image' | 'multi' | 'url' | null;

interface UploadContextType {
  uploadData: any | null;
  handleUpload: (image: File) => Promise<void>;
  handleAnalysis: (url: string, data?: any) => Promise<void>;
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

  const handleUpload = async (image: File) => {
    const data = await analyzeImage(image);
    setUploadData(data);
  };

  const handleAnalysis = async (url: string, data?: any) => {
    await analyzeUrl(url, data);
  };

  return (
    <UploadContext.Provider value={{ 
      uploadData, 
      handleUpload, 
      handleAnalysis,
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
