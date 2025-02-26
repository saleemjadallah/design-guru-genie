
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const stages = [
  { id: "upload", label: "Uploading image..." },
  { id: "process", label: "Processing image..." },
  { id: "analyze", label: "Analyzing design..." },
  { id: "generate", label: "Generating feedback..." },
];

const designTips = [
  "Tip: White space is not empty space - it's a powerful design element that helps create visual hierarchy.",
  "Tip: Color contrast is crucial for accessibility. Aim for a ratio of at least 4.5:1 for text.",
  "Tip: Consistent spacing between elements helps create rhythm and harmony in your design.",
  "Tip: Typography hierarchy helps users scan and understand content more effectively.",
];

export const ProcessingState = ({ currentStage }: { currentStage: number }) => {
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTip((current) => (current + 1) % designTips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="space-y-8">
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`flex items-center gap-3 transition-opacity ${
                index === currentStage
                  ? "opacity-100"
                  : index < currentStage
                  ? "opacity-50"
                  : "opacity-30"
              }`}
            >
              {index === currentStage ? (
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              ) : (
                <div
                  className={`h-5 w-5 rounded-full ${
                    index < currentStage ? "bg-accent" : "bg-neutral-200"
                  }`}
                />
              )}
              <span
                className={
                  index === currentStage
                    ? "text-accent font-medium"
                    : "text-neutral-500"
                }
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <p className="text-sm text-neutral-600 italic animate-fade-in">
            {designTips[tip]}
          </p>
        </div>

        <div className="text-sm text-neutral-500">
          Estimated time remaining: 15-30 seconds
        </div>
      </div>
    </div>
  );
};
