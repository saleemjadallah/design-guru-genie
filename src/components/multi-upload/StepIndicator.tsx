
import React from "react";
import { UploadStep } from "./types";

interface StepIndicatorProps {
  currentStep: UploadStep;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps: UploadStep[] = ["upload", "arrange", "preview"];
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((stepName, index) => (
          <div 
            key={stepName} 
            className="flex flex-col items-center"
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                currentStep === stepName 
                  ? "bg-accent text-white" 
                  : index < steps.indexOf(currentStep) 
                    ? "bg-accent/20 text-accent" 
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            <span className={`text-sm ${currentStep === stepName ? "font-medium text-accent" : "text-gray-500"}`}>
              {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
            </span>
          </div>
        ))}
        
        {/* Connector lines */}
        <div className="h-[2px] w-full absolute top-5 -z-10 bg-gray-200 max-w-[calc(100%-8rem)] mx-auto left-0 right-0">
          <div 
            className="h-full bg-accent transition-all" 
            style={{ 
              width: currentStep === "upload" 
                ? "0%" 
                : currentStep === "arrange" 
                  ? "50%" 
                  : "100%" 
            }}
          />
        </div>
      </div>
    </div>
  );
};
