
import { Json } from "@/integrations/supabase/types";

export type Feedback = {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  location?: { x: number; y: number };
  id?: number;
  principle?: string;
  technical_details?: string;
};

export type SavedReview = {
  id: string;
  title: string;
  image_url: string;
  feedback: string | any;
  created_at: string;
  updated_at: string;
  user_id?: string;
};

// Helper to type check Claude AI response structure
export interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}
