
import React from "react";

interface ScoreCardProps {
  label: string;
  score: number;
  maxScore?: number;
  bgColor: string;
  textColor: string;
}

export const ScoreCard = ({ 
  label, 
  score, 
  maxScore = 100, 
  bgColor, 
  textColor 
}: ScoreCardProps) => {
  return (
    <div className={`${bgColor} rounded-lg p-5 text-center`}>
      <div className={`${textColor} text-sm mb-1`}>{label}</div>
      <div className={`text-3xl font-bold ${textColor}`}>
        {score}<span className="text-lg">/{maxScore}</span>
      </div>
    </div>
  );
};
