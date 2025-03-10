import { useState } from "react";
import { Globe, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { processWithClaudeAI } from "@/services/claudeAnalysisService";
import { generateDummyFeedback } from "@/utils/upload/dummyData";

export const UrlUpload = ({ onUrlAnalyze }: { onUrlAnalyze: (imageUrl: string, analysisData: any) => void }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateUrl = (inputUrl: string): boolean => {
    setValidationError(null);
    
    if (!inputUrl) {
      setValidationError("URL is required");
      return false;
    }
    
    // Add protocol if missing
    const normalizedUrl = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;
    
    try {
      const parsed = new URL(normalizedUrl);
      if (!parsed.hostname || parsed.hostname.length < 3) {
        setValidationError("Please enter a valid website URL");
        return false;
      }
      return true;
    } catch (e) {
      setValidationError("Please enter a valid website URL");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: validationError || "Please enter a valid website URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    // Add protocol if missing
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    setIsLoading(true);
    setValidationError(null);

    try {
      toast({
        title: "Analyzing URL",
        description: "Our AI is capturing and analyzing the website design...",
      });

      try {
        // First step: Generate a screenshot using the screenshot-url edge function
        const { data: screenshotData, error: screenshotError } = await supabase.functions.invoke("screenshot-url", {
          body: { url: normalizedUrl },
        });

        if (screenshotError) {
          console.error("URL screenshot error:", screenshotError);
          throw new Error(`Failed to capture website: ${screenshotError.message}`);
        }

        if (!screenshotData?.imageUrl) {
          throw new Error("Failed to generate website screenshot");
        }

        console.log("Screenshot generated:", screenshotData.imageUrl);
        
        let analysisResults;
        
        // Check if screenshot is an SVG placeholder (which means the screenshot failed)
        const isSvgPlaceholder = typeof screenshotData.imageUrl === 'string' && 
          (screenshotData.imageUrl.startsWith('data:image/svg') || 
           screenshotData.imageUrl.includes('<svg'));
          
        // If we have analysis directly from the screenshot-url function, use it
        if (screenshotData.analysis && !isSvgPlaceholder) {
          console.log("Using analysis from screenshot-url function");
          analysisResults = screenshotData.analysis;
        } else {
          try {
            // Use Claude AI for analysis
            analysisResults = await processWithClaudeAI(screenshotData.imageUrl);
          } catch (analysisError: any) {
            console.error("Claude analysis error:", analysisError);
            
            // If analysis fails but we have an SVG placeholder,
            // use a fallback dummy analysis so user gets something
            if (isSvgPlaceholder) {
              console.log("Using dummy feedback for placeholder image");
              toast({
                title: "Limited Analysis",
                description: "We couldn't capture the actual website. Using simulated analysis instead.",
                variant: "destructive",
              });
              analysisResults = generateDummyFeedback();
            } else {
              throw analysisError;
            }
          }
        }
        
        // Pass both the screenshot URL and analysis to the parent component
        onUrlAnalyze(screenshotData.imageUrl, analysisResults);
        
        toast({
          title: "Analysis complete",
          description: "Website design has been analyzed successfully.",
        });
      } catch (error: any) {
        console.error("URL processing error:", error);
        
        // Check if the error is related to the Edge Function availability
        if (error.message?.includes("Failed to send a request to the Edge Function") || 
            error.name === "FunctionsFetchError") {
          toast({
            title: "Service unavailable",
            description: "The URL analysis feature is currently unavailable. Please try again later or upload a screenshot instead.",
            variant: "destructive",
          });
        } else if (error.message?.includes("non-2xx status code")) {
          toast({
            title: "Website access error",
            description: "We couldn't access this website. It may be blocking our service, have security measures in place, or be temporarily down. Please try uploading a screenshot instead.",
            variant: "destructive",
          });
        } else if (error.message?.includes("timeout")) {
          toast({
            title: "Request timeout",
            description: "The website took too long to respond. It might be too complex or temporarily slow. Please try uploading a screenshot instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Processing failed",
            description: error instanceof Error 
              ? error.message 
              : "Failed to process the URL. Please check the URL and try again.",
            variant: "destructive",
          });
        }
        
        // For any error, return to the caller with an SVG placeholder and dummy data
        // so the user gets something rather than nothing
        const placeholderSvg = createPlaceholderSvg(normalizedUrl);
        const dummyData = generateDummyFeedback();
        
        onUrlAnalyze(placeholderSvg, dummyData);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create placeholder SVG when screenshot fails
  const createPlaceholderSvg = (websiteUrl: string) => {
    const encodedUrl = encodeURIComponent(websiteUrl);
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="white"/><text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="black">Website Analysis: ${encodedUrl}</text></svg>`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl border-neutral-200/70 hover:border-accent/50 hover:bg-neutral-50/30 transition-all"
         style={{
           background: "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(246, 245, 252, 0.7) 100%)",
           backdropFilter: "blur(8px)",
           boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)"
         }}
    >
      <Globe
        className="w-16 h-16 mb-6 text-teal-500/80"
      />
      <h3 className="text-2xl font-semibold mb-3 text-neutral-800">
        Analyze website by URL
      </h3>
      <p className="mb-6 text-neutral-600">
        Enter the website URL below and we'll analyze its design
      </p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) validateUrl(e.target.value);
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
      
      <div className="mt-6 text-center text-sm text-neutral-500 bg-gray-50 p-4 rounded-lg w-full max-w-md">
        <h4 className="font-medium text-gray-700 mb-2">What we analyze:</h4>
        <ul className="text-left space-y-1">
          <li>• Visual hierarchy and layout design</li>
          <li>• Color scheme and contrast ratios</li>
          <li>• Typography and readability</li>
          <li>• UI component consistency</li>
          <li>• Accessibility considerations</li>
        </ul>
      </div>
      
      {isLoading && (
        <div className="mt-4 text-center text-sm text-amber-700 bg-amber-50 p-3 rounded-lg w-full max-w-md">
          <p>Analysis may take up to 30 seconds for complex websites.</p>
        </div>
      )}
    </div>
  );
};
