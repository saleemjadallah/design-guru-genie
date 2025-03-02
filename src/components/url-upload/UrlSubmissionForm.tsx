
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, AlertCircle } from "lucide-react";
import { validateUrl, normalizeUrl } from "./UrlValidation";

interface UrlSubmissionFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const UrlSubmissionForm: React.FC<UrlSubmissionFormProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFormValidation = (inputUrl: string) => {
    const { isValid, error } = validateUrl(inputUrl);
    setValidationError(error);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (handleFormValidation(url)) {
      const normalizedUrl = normalizeUrl(url);
      onSubmit(normalizedUrl);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (validationError) handleFormValidation(e.target.value);
            }}
            placeholder="www.example.com"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 bg-white/80 ${
              validationError ? "border-red-300 focus:ring-red-200" : "border-neutral-300/80"
            }`}
            disabled={isLoading}
          />
          {validationError && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        
        {validationError && (
          <p className="text-sm text-red-500 mt-1">{validationError}</p>
        )}
        
        <Button 
          type="submit" 
          className="px-6 py-3 bg-gradient-to-r from-teal-500/90 to-emerald-500/90 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">Analyzing...</span>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </>
          ) : (
            "Analyze Website"
          )}
        </Button>
      </div>
    </form>
  );
};
