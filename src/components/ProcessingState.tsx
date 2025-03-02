
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

const stages = [
  { 
    id: "upload", 
    label: "Uploading image...",
    description: "Securely transferring your design to our servers"
  },
  { 
    id: "process", 
    label: "Processing image...",
    description: "Optimizing and preparing your design for analysis"
  },
  { 
    id: "analyze", 
    label: "Analyzing design...",
    description: "Our AI is examining UI patterns, accessibility, and usability"
  },
  { 
    id: "generate", 
    label: "Generating feedback...",
    description: "Creating actionable recommendations based on design principles"
  },
];

const designTips = [
  "Tip: White space is not empty space - it's a powerful design element that helps create visual hierarchy.",
  "Tip: Color contrast is crucial for accessibility. Aim for a ratio of at least 4.5:1 for text.",
  "Tip: Consistent spacing between elements helps create rhythm and harmony in your design.",
  "Tip: Typography hierarchy helps users scan and understand content more effectively.",
  "Tip: Consider responsive design to ensure your interface works well on all screen sizes.",
  "Tip: Use clear visual feedback for interactive elements to improve usability.",
  "Tip: Limit your color palette to 3-5 colors for a more cohesive design.",
  "Tip: Group related elements together to create a clear information hierarchy.",
];

export const ProcessingState = ({ currentStage }: { currentStage: number }) => {
  const [tip, setTip] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState("15-30 seconds");

  // Update elapsed time and estimated time remaining
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      
      // Adjust estimated time based on current stage and elapsed time
      if (currentStage === 0 && elapsed > 5) {
        setEstimatedTimeRemaining("10-20 seconds");
      } else if (currentStage === 1 && elapsed > 10) {
        setEstimatedTimeRemaining("5-15 seconds");
      } else if (currentStage === 2 && elapsed > 15) {
        setEstimatedTimeRemaining("just a few more seconds");
      } else if (currentStage === 3) {
        setEstimatedTimeRemaining("almost done");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStage]);

  // Rotate through design tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTip((current) => (current + 1) % designTips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="space-y-8 max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-800">Analyzing Your Design</h2>
        <p className="text-gray-600">Please wait while we process your design. This typically takes less than a minute.</p>
        
        <div className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${Math.min(25 + (currentStage * 25), 100)}%` }}
            ></div>
          </div>
          
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className={`flex items-start gap-3 transition-opacity ${
                  index === currentStage
                    ? "opacity-100"
                    : index < currentStage
                    ? "opacity-70"
                    : "opacity-40"
                }`}
              >
                <div className="pt-0.5">
                  {index < currentStage ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : index === currentStage ? (
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  ) : (
                    <div
                      className="h-5 w-5 rounded-full bg-neutral-200"
                    />
                  )}
                </div>
                <div className="text-left">
                  <span
                    className={`block font-medium ${
                      index === currentStage
                        ? "text-accent"
                        : index < currentStage
                        ? "text-gray-700"
                        : "text-gray-500"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-sm text-gray-500">{stage.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-700 italic animate-fade-in">
            {designTips[tip]}
          </p>
        </div>

        <div className="text-sm text-gray-500">
          <p>Time elapsed: {elapsedTime} seconds</p>
          <p>Estimated time remaining: {estimatedTimeRemaining}</p>
        </div>
        
        {elapsedTime > 45 && (
          <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded-md">
            This is taking longer than usual. Our servers might be busy. 
            Please continue to wait or try again later if this persists.
          </div>
        )}
      </div>
    </div>
  );
};
