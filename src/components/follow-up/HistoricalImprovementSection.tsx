
import React from "react";
import { ComparisonChart, AnalysisDataPoint } from "./ComparisonChart";
import { CategoryComparisonChart } from "./CategoryComparisonChart";

interface CategoryData {
  category: string;
  current: number;
  previous: number;
}

interface HistoricalImprovementSectionProps {
  overallScoreHistory: AnalysisDataPoint[];
  categoryComparisons: CategoryData[];
  analysisCount: number;
}

export const HistoricalImprovementSection = ({ 
  overallScoreHistory,
  categoryComparisons,
  analysisCount
}: HistoricalImprovementSectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Improvement Over Time</h2>
      
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-indigo-700 font-medium">
            {analysisCount} Analysis{analysisCount !== 1 ? 'es' : ''} Completed
          </span>
        </div>
        <p className="text-sm text-indigo-700 mt-1">
          Track your design progress over time as you continue to make improvements.
        </p>
      </div>
      
      <ComparisonChart 
        data={overallScoreHistory}
        title="Overall Score History"
        description="See how your design score has improved over multiple analyses"
      />
      
      <CategoryComparisonChart 
        data={categoryComparisons}
        title="Category Improvement"
        description="Compare your current scores with previous analysis results by category"
      />
    </div>
  );
};
