
import { supabase } from "@/integrations/supabase/client";
import { SavedReview } from "./types";

export async function fetchReviewById(reviewId: string): Promise<SavedReview | null> {
  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  // Validate UUID format - This is a basic validation, not comprehensive
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(reviewId)) {
    throw new Error(`Invalid review ID format: ${reviewId}`);
  }

  // Fetch the review from the database
  const { data, error: dbError } = await supabase
    .from('saved_reviews')
    .select('*')
    .eq('id', reviewId)
    .maybeSingle();

  if (dbError) {
    console.error("Database error:", dbError);
    throw new Error("Database error: " + dbError.message);
  }
  
  if (!data) {
    throw new Error("Review not found");
  }

  return data;
}
