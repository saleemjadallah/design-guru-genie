
import React from "react";
import { DesignStrength } from "./DesignStrength";

interface PositiveAspect {
  title: string;
  description: string;
}

interface DesignStrengthsSectionProps {
  positiveAspects: PositiveAspect[];
}

export const DesignStrengthsSection = ({ 
  positiveAspects 
}: DesignStrengthsSectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Design Strengths</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {positiveAspects.map((aspect, index) => (
          <DesignStrength 
            key={index}
            title={aspect.title}
            description={aspect.description}
          />
        ))}
      </div>
    </div>
  );
};
