
import React, { useState } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ScreenshotFile } from "./MultiScreenshotUpload";

interface UploadZoneProps {
  screenshots: ScreenshotFile[];
  onFilesAdded: (files: File[]) => void;
  onRemoveScreenshot: (id: string) => void;
  onContinue: () => void;
}

export const UploadZone = ({ 
  screenshots, 
  onFilesAdded, 
  onRemoveScreenshot, 
  onContinue 
}: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

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
    onFilesAdded(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    onFilesAdded(files);
  };

  return (
    <>
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

      {screenshots.length > 0 && (
        <div className="mb-6 overflow-x-auto mt-6">
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
                  onClick={() => onRemoveScreenshot(screenshot.id)}
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
                onClick={onContinue}
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
    </>
  );
};
