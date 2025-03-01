
import React from "react";
import { ImprovementCategory } from "./ImprovementCategory";

interface ImprovementArea {
  category: string;
  before: number;
  after: number;
  improvement: number;
}

interface ImprovementSectionProps {
  improvementAreas: ImprovementArea[];
}

export const ImprovementSection = ({ 
  improvementAreas 
}: ImprovementSectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Improvement By Category</h2>
      <div className="space-y-4">
        {improvementAreas.map((area, index) => (
          <ImprovementCategory 
            key={index}
            category={area.category}
            before={area.before}
            after={area.after}
            improvement={area.improvement}
          />
        ))}
      </div>
    </div>
  );
};
