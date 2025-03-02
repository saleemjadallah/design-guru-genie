
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "@/utils/upload/errorHandler";

/**
 * Saves a design review to the database
 * @param title The title of the review
 * @param imageUrl The URL of the uploaded image
 * @param feedback The feedback from Claude AI
 * @returns The saved review data
 */
export const saveReviewToDatabase = async (title: string, imageUrl: string, feedback: any) => {
  const { data: reviewData, error: reviewError } = await supabase
    .from('saved_reviews')
    .insert({
      title: title,
      image_url: imageUrl,
      feedback: feedback
    })
    .select()
    .single();
    
  if (reviewError) {
    const dbErrorMsg = handleDatabaseError(reviewError);
    throw new Error(dbErrorMsg);
  }
  
  return reviewData;
};
