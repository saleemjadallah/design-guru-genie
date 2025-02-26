
import React from "react";

type AnnotationPoint = {
  id: number;
  x: number;
  y: number;
  type: "high" | "medium" | "low";
  title: string;
  description: string;
  solution: string;
};

const annotations: AnnotationPoint[] = [
  {
    id: 1,
    x: 25,
    y: 20,
    type: "high",
    title: "Poor Text Contrast",
    description: "Light gray text (#999999) on white background fails accessibility standards",
    solution: "Change text color to #333333 for a 7:1 contrast ratio"
  },
  {
    id: 2,
    x: 45,
    y: 40,
    type: "medium",
    title: "Inconsistent Spacing",
    description: "Uneven padding between navigation items creates visual imbalance",
    solution: "Standardize navigation padding to 24px horizontal, 16px vertical"
  },
  {
    id: 3,
    x: 75,
    y: 60,
    type: "high",
    title: "Competing CTAs",
    description: "Multiple primary buttons compete for attention",
    solution: "Use one primary CTA and make others secondary or tertiary"
  }
];

export const AnnotationExample = () => {
  return (
    <section className="py-16 bg-white rounded-2xl">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-8">See It In Action</h2>
        <p className="text-neutral-600 text-center max-w-2xl mx-auto mb-12">
          Experience how our AI provides detailed, actionable feedback to improve your designs
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Before Example */}
          <div className="relative rounded-lg overflow-hidden border bg-neutral-50 aspect-[4/3]">
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
              Original Design Preview
            </div>
          </div>

          {/* After Example with Annotations */}
          <div className="relative rounded-lg overflow-hidden border bg-neutral-50 aspect-[4/3]">
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
              Annotated Design Preview
            </div>
            
            {/* Annotation Markers */}
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`absolute w-6 h-6 -mt-3 -ml-3 rounded-full flex items-center justify-center text-white text-sm font-medium
                  ${annotation.type === "high" ? "bg-red-500" : 
                    annotation.type === "medium" ? "bg-amber-500" : "bg-blue-500"
                  }`}
                style={{
                  left: `${annotation.x}%`,
                  top: `${annotation.y}%`,
                }}
              >
                {annotation.id}
              </div>
            ))}
          </div>
        </div>

        {/* Annotations List */}
        <div className="max-w-3xl mx-auto divide-y">
          {annotations.map((annotation) => (
            <div key={annotation.id} className="py-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0
                    ${annotation.type === "high" ? "bg-red-500" : 
                      annotation.type === "medium" ? "bg-amber-500" : "bg-blue-500"
                    }`}
                >
                  {annotation.id}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {annotation.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    {annotation.description}
                  </p>
                  <p className="text-sm font-medium text-accent">
                    Solution: {annotation.solution}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors">
            Try Design Critique Now
          </button>
        </div>
      </div>
    </section>
  );
};
