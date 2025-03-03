
/**
 * Types for OpenAI analysis service - simplified
 */

/**
 * Feedback item from OpenAI analysis
 */
export interface FeedbackItem {
  id: number;
  type: "positive" | "improvement";
  title: string;
  description: string;
  location?: string | null;
  priority?: string;
  principle?: string;
  technical_details?: string;
}
