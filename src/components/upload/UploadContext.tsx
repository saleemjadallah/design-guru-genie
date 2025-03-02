import React, { createContext, useState, useContext } from 'react';
import { useImageUpload } from './useImageUpload';
import { useUrlAnalysis } from './useUrlAnalysis';

const UploadContext = createContext(null);

export const UploadProvider = ({ children }) => {
  const [uploadData, setUploadData] = useState(null);
  const { uploadImage } = useImageUpload();
  const { analyzeUrl } = useUrlAnalysis();

  const handleUpload = async (image) => {
    const data = await uploadImage(image);
    setUploadData(data);
  };

  const handleAnalysis = async (url, data) => {
    await analyzeUrl(url, data);
  };

  return (
    <UploadContext.Provider value={{ uploadData, handleUpload, handleAnalysis }}>
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  return useContext(UploadContext);
};
