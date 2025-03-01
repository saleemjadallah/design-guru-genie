
import React from "react";
import { ScoreCard } from "./ScoreCard";

interface ScoreSectionProps {
  originalScore: number;
  newScore: number;
  improvement: number;
}

export const ScoreSection = ({ 
  originalScore, 
  newScore, 
  improvement 
}: ScoreSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <ScoreCard 
        label="Original Score" 
        score={originalScore} 
        bgColor="bg-blue-50" 
        textColor="text-blue-800" 
      />
      <ScoreCard 
        label="New Score" 
        score={newScore} 
        bgColor="bg-green-50" 
        textColor="text-green-800" 
      />
      <ScoreCard 
        label="Improvement" 
        score={improvement} 
        bgColor="bg-purple-50" 
        textColor="text-purple-800" 
      />
    </div>
  );
};
