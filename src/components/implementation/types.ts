
export interface ImplementationFeedback {
  id?: number;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  type: "positive" | "improvement";
  principle?: string;
  technical_details?: string;
  impact?: "low" | "medium" | "high";
  effort?: "low" | "medium" | "high";
  time_estimate?: string;
  tools_needed?: string[];
  skill_level?: "beginner" | "intermediate" | "advanced";
  location?: { x: number; y: number };
  completed?: boolean;
}

export interface TimeInvestmentSummary {
  quickWins: number;
  priorityChanges: number;
  extendedImprovements: number;
  totalTime: string;
}
