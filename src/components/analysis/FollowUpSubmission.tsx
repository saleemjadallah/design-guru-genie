
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FollowUpSubmissionProps {
  initialAnalysisId: string;
  onSubmissionComplete: (followUpImageUrl: string) => void;
}

export const FollowUpSubmission = ({ initialAnalysisId, onSubmissionComplete }: FollowUpSubmissionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      await handleFileUpload(imageFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      await handleFileUpload(imageFile);
    } else if (files.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);

    try {
      // Convert file to data URL for immediate preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const imageDataUrl = e.target.result as string;
          
          // Here we would normally upload the file to storage
          // For now, we'll just simulate a successful upload
          toast({
            title: "Design uploaded",
            description: "Your updated design has been uploaded successfully.",
          });

          // Call the parent component callback with the image URL
          onSubmissionComplete(imageDataUrl);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
        Submit Your Improved Design
      </h2>
      
      <p className="text-gray-700 mb-4">
        Upload your updated design after implementing our recommendations. We'll analyze it and show you exactly how much you've improved.
      </p>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${
          isDragging 
            ? "border-accent bg-accent/5" 
            : "border-gray-300 hover:border-accent/50 hover:bg-gray-50"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mb-3">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
        </div>
        <p className="text-gray-700 mb-2">Drag and drop your updated design here</p>
        <p className="text-gray-500 text-sm mb-4">or</p>
        <Button 
          disabled={isUploading}
          className="relative bg-accent hover:bg-accent/90"
        >
          Choose File
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInput}
            accept="image/*"
            disabled={isUploading}
          />
        </Button>
      </div>
      
      <div className="text-right">
        <Button 
          className="bg-accent hover:bg-accent/90"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Submit for Follow-Up Analysis"}
        </Button>
      </div>
    </div>
  );
};
