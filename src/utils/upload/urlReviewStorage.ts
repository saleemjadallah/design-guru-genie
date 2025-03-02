
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "@/utils/upload/errorHandler";
import { toast } from "@/hooks/use-toast";

/**
 * Saves a URL review to the database
 * @param url The website URL being analyzed
 * @param analysisResults The analysis results from Claude AI
 * @returns The saved review data
 */
export const saveUrlReviewToDatabase = async (url: string, analysisResults: any) => {
  if (!analysisResults || (Array.isArray(analysisResults) && analysisResults.length === 0)) {
    throw new Error("Analysis produced no results. Please try again.");
  }

  console.log("Saving URL analysis to database:", analysisResults);
  
  // Extract hostname for title
  let hostname = 'URL';
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    console.warn("Could not parse URL for hostname");
  }
  
  // Save the analysis to the database
  const { data: reviewData, error: reviewError } = await supabase
    .from('saved_reviews')
    .insert({
      title: `Website Review - ${hostname}`,
      image_url: url,
      feedback: analysisResults
    })
    .select()
    .single();
    
  if (reviewError) {
    console.error("Database error:", reviewError);
    const errorMsg = handleDatabaseError(reviewError);
    throw new Error(errorMsg);
  }
  
  toast({
    title: "Review saved",
    description: "Your website design review has been saved. Redirecting to results...",
  });
  
  return reviewData;
};
