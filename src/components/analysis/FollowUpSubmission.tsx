
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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 overflow-hidden relative">
      {/* Background gradient effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl opacity-50"></div>
      
      <div className="relative">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 shadow-md">2</span>
          Submit Your Improved Design
        </h2>
        
        <p className="text-gray-700 mb-4">
          Upload your updated design after implementing our recommendations. We'll analyze it and show you exactly how much you've improved.
        </p>
        
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center mb-4 transition-all duration-300 ease-in-out ${
            isDragging 
              ? "border-indigo-400 bg-indigo-50 scale-[1.02]" 
              : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            background: isDragging 
              ? "linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(129, 140, 248, 0.05) 100%)" 
              : "linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)",
            boxShadow: isDragging ? "0 4px 20px rgba(79, 70, 229, 0.1)" : "none"
          }}
        >
          <div className="mb-3 relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-md transform scale-110"></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto">
              <Upload className="h-8 w-8 text-white" style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.2))" }} />
            </div>
          </div>
          <p className="text-gray-700 font-medium mb-2">Drag and drop your updated design here</p>
          <p className="text-gray-500 text-sm mb-4">or</p>
          <Button 
            disabled={isUploading}
            className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
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
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Submit for Follow-Up Analysis"}
          </Button>
        </div>
      </div>
    </div>
  );
};
