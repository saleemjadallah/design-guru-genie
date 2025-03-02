
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { processWithClaudeAI } from "@/services/claudeAnalysisService";
import { generateDummyFeedback } from "@/utils/upload/dummyData";
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
        method: 'POST'
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
          // Try to generate fresh analysis with Claude
          analysisResults = await processWithClaudeAI(screenshotData.imageUrl);
        } catch (analysisError: any) {
          console.error("Claude analysis error:", analysisError);
          
          // If Claude analysis fails but we have an SVG placeholder,
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
      
      toast({
        title: "Analysis complete",
        description: "Website design has been analyzed successfully.",
      });
      
      return { imageUrl: screenshotData.imageUrl, analysisResults };
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
      
      // For any error, return placeholder and dummy data
      const placeholderSvg = createPlaceholderSvg(normalizedUrl);
      const dummyData = generateDummyFeedback();
      
      return { imageUrl: placeholderSvg, analysisResults: dummyData };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    captureScreenshot
  };
};
