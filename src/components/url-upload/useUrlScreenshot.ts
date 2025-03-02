
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { processWithClaudeAI } from "@/services/claudeAnalysisService";
import { createPlaceholderSvg } from "./UrlValidation";

export const useUrlScreenshot = () => {
  const [isLoading, setIsLoading] = useState(false);

  const captureScreenshot = async (normalizedUrl: string) => {
    setIsLoading(true);
    
    try {
      toast({
        title: "Analyzing URL",
        description: "Our AI is capturing and analyzing the website design...",
      });

      // First step: Generate a screenshot using the screenshot-url edge function
      const { data: screenshotData, error: screenshotError } = await supabase.functions.invoke("screenshot-url", {
        body: { url: normalizedUrl },
        method: 'POST',
        options: {
          timeout: 30000 // 30 seconds timeout for screenshot generation
        }
      });

      if (screenshotError) {
        console.error("URL screenshot error:", screenshotError);
        throw new Error(`Failed to capture website: ${screenshotError.message}`);
      }

      if (!screenshotData?.imageUrl) {
        throw new Error("Failed to generate website screenshot");
      }

      console.log("Screenshot generated:", screenshotData.imageUrl);
      
      // Check if screenshot is an SVG placeholder (which means the screenshot failed)
      const isSvgPlaceholder = typeof screenshotData.imageUrl === 'string' && 
        (screenshotData.imageUrl.startsWith('data:image/svg') || 
         screenshotData.imageUrl.includes('<svg'));
        
      if (isSvgPlaceholder) {
        console.error("Screenshot failed - received SVG placeholder");
        throw new Error("Failed to capture website screenshot. The website may be blocking our capture service or have security measures in place.");
      }
      
      // Try to generate analysis with Claude - no fallbacks
      let analysisResults;
      try {
        analysisResults = await processWithClaudeAI(screenshotData.imageUrl);
        
        toast({
          title: "Analysis complete",
          description: "Website design has been analyzed successfully.",
        });
      } catch (analysisError: any) {
        console.error("Claude analysis error:", analysisError);
        throw new Error(`Claude analysis failed: ${analysisError.message}`);
      }
      
      return { 
        imageUrl: screenshotData.imageUrl, 
        analysisResults
      };
    } catch (error: any) {
      console.error("URL processing error:", error);
      
      // Handle specific error cases
      if (error.message?.includes("Failed to send a request to the Edge Function") || 
          error.name === "FunctionsFetchError") {
        toast({
          title: "Service unavailable",
          description: "The URL analysis feature is currently unavailable. Please try again later or upload a screenshot instead.",
          variant: "destructive",
        });
      } else if (error.message?.includes("non-2xx status code")) {
        toast({
          title: "Analysis service error",
          description: "Our AI analysis service encountered an issue. This might be due to image size or complexity. Please try uploading a smaller or simpler screenshot.",
          variant: "destructive",
        });
      } else if (error.message?.includes("timeout")) {
        toast({
          title: "Request timeout",
          description: "The analysis took too long to complete. It might be too complex or our service is busy. Please try again with a smaller screenshot.",
          variant: "destructive",
        });
      } else if (error.message?.includes("maximum call stack")) {
        toast({
          title: "Processing error",
          description: "The image is too complex for our analysis service. Please try uploading a smaller or simpler screenshot.",
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
      
      throw error; // Re-throw the error so the caller knows it failed
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    captureScreenshot
  };
};
