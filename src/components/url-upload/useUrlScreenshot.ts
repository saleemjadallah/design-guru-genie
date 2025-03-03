
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { processWithOpenAI } from "@/services/openaiAnalysisService";
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

      // Use Promise.race for timeout handling
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Screenshot capture timed out after 30 seconds")), 30000);
      });

      // Log function name for debugging
      console.log("Invoking Supabase Edge Function: 'screenshot-url'");

      // First step: Generate a screenshot using the screenshot-url edge function
      const screenshotPromise = supabase.functions.invoke("screenshot-url", {
        body: { url: normalizedUrl },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Race between the screenshot capture and timeout
      const { data: screenshotData, error: screenshotError } = await Promise.race([
        screenshotPromise,
        timeoutPromise.then(() => {
          throw new Error("Screenshot generation timed out");
        })
      ]) as any;

      if (screenshotError) {
        console.error("URL screenshot error:", screenshotError);
        
        // Check for function invocation errors
        if (screenshotError.message?.includes("Failed to send a request to the Edge Function")) {
          throw new Error("Failed to call the screenshot-url Edge Function. Please check that the function is deployed correctly.");
        }
        
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
      
      // Log function name for debugging
      console.log("Starting Claude analysis via processWithOpenAI function");
      
      // Use Claude (via the same processWithOpenAI function) for analysis
      let analysisResults;
      try {
        analysisResults = await processWithOpenAI(screenshotData.imageUrl);
        
        toast({
          title: "Analysis complete",
          description: "Website design has been analyzed successfully.",
        });
      } catch (analysisError: any) {
        console.error("Claude analysis error:", analysisError);
        
        // Provide more specific error messages for API key issues
        if (analysisError.message?.includes("ANTHROPIC_API_KEY")) {
          throw new Error("API key configuration issue: Please make sure the ANTHROPIC_API_KEY is correctly set with the EXACT name in Edge Function secrets.");
        }
        
        throw new Error(`AI analysis failed: ${analysisError.message}`);
      }
      
      return { 
        imageUrl: screenshotData.imageUrl, 
        analysisResults
      };
    } catch (error: any) {
      console.error("URL processing error:", error);
      
      // Handle specific error cases with more detailed messages
      if (error.message?.includes("Failed to send a request to the Edge Function") || 
          error.name === "FunctionsFetchError") {
        toast({
          title: "Edge Function Error",
          description: "Could not connect to the Edge Function. Please check that 'analyze-design' and 'screenshot-url' functions are deployed correctly in Supabase.",
          variant: "destructive",
        });
      } else if (error.message?.includes("Claude API key access issue")) {
        toast({
          title: "API Key Configuration Issue",
          description: "The system cannot access the Claude API key. Please check that the key is correctly set with the EXACT name 'ANTHROPIC_API_KEY' in the Edge Function secrets.",
          variant: "destructive",
        });
      } else if (error.message?.includes("Claude API key appears to be invalid")) {
        toast({
          title: "Invalid API Key",
          description: "The Claude API key appears to be invalid or has expired. Please update it in the Edge Function secrets.",
          variant: "destructive",
        });
      } else if (error.message?.includes("ANTHROPIC_API_KEY is not accessible")) {
        toast({
          title: "API Key Access Issue",
          description: "The ANTHROPIC_API_KEY is not accessible by the Edge Function. Check the exact name 'ANTHROPIC_API_KEY' in Edge Function secrets.",
          variant: "destructive",
        });
      } else if (error.message?.includes("ANTHROPIC_API_KEY")) {
        toast({
          title: "API Key Configuration Issue",
          description: "Please verify the API key is set with the EXACT name 'ANTHROPIC_API_KEY' (case sensitive) in Edge Function secrets.",
          variant: "destructive",
        });
      } else if (error.message?.includes("timeout")) {
        toast({
          title: "Request timeout",
          description: "The analysis took too long to complete. It might be too complex or our service is busy. Please try again later.",
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
