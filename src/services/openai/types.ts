
/**
 * Types for OpenAI analysis service
 */

/**
 * Compression options for image processing before API submission
 */
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
  forceJpeg?: boolean;
  removeTransparency?: boolean;
}

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

/**
 * OpenAI response format for strengths
 */
export interface Strength {
  title?: string;
  point?: string;
  description?: string;
  details?: string;
  location?: string | null;
}

/**
 * OpenAI response format for issues
 */
export interface Issue {
  issue?: string;
  title?: string;
  priority?: string;
  recommendation?: string;
  description?: string;
  details?: string;
  location?: string | null;
  principle?: string;
  category?: string;
  technical_details?: string;
  solution?: string;
}

/**
 * Expected response format from OpenAI
 */
export interface OpenAIFeedback {
  strengths?: Strength[];
  issues?: Issue[];
  content?: any;
  feedback?: any;
}
