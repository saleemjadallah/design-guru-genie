
import React, { useState } from "react";
import { WaveDivider } from "../patterns/WaveDivider";
import { GeometricAccents } from "../patterns/GeometricAccents";
import { Button } from "@/components/ui/button";

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
    title: "Multiple Screenshot Analysis",
    description: "Long pages require multiple screenshots for complete analysis",
    solution: "Use our new multiple screenshot feature to combine and analyze the entire page"
  }
];

export const SeeItInAction = () => {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<number | null>(null);
  
  const scrollToUploadSection = () => {
    const uploadSection = document.querySelector('.bg-white.shadow-xl.rounded-xl');
    
    if (uploadSection) {
      uploadSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth"
      });
    }
  };

  return (
    <>
      {/* Wave divider before section */}
      <WaveDivider fillColor="#ffffff" height={30} className="my-0" />
      
      <section className="py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl relative mt-2 overflow-hidden">
        {/* Background patterns and geometric accents */}
        <div className="absolute inset-0 topographic-pattern rounded-2xl opacity-20"></div>
        <GeometricAccents variant="cta" className="opacity-70" />
        
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              See It In Action
            </h2>
            <div className="h-1 w-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6"></div>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Experience how our AI provides detailed, actionable feedback to improve your designs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Before Example */}
            <div className="relative rounded-xl overflow-hidden border border-indigo-100 bg-white aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-50"></div>
              <div className="flex flex-col items-center justify-center h-full p-6 relative z-10">
                <div className="bg-red-50 rounded-full px-4 py-1 text-red-500 text-sm font-medium mb-4">Problem</div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-800">Multiple Screenshots Problem</h3>
                <p className="text-neutral-600 text-center mb-6">Long web pages are difficult to capture in a single screenshot</p>
                <div className="flex space-x-3 mb-5 group-hover:translate-y-1 transition-transform duration-500">
                  <div className="w-24 h-40 bg-white rounded border border-gray-200 shadow-sm flex items-center justify-center text-sm text-gray-500 relative overflow-hidden group-hover:-rotate-3 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-50"></div>
                    Screenshot 1
                  </div>
                  <div className="w-24 h-40 bg-white rounded border border-gray-200 shadow-sm flex items-center justify-center text-sm text-gray-500 relative overflow-hidden group-hover:rotate-0 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-transparent opacity-50"></div>
                    Screenshot 2
                  </div>
                  <div className="w-24 h-40 bg-white rounded border border-gray-200 shadow-sm flex items-center justify-center text-sm text-gray-500 relative overflow-hidden group-hover:rotate-3 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-b from-pink-50 to-transparent opacity-50"></div>
                    Screenshot 3
                  </div>
                </div>
                <p className="text-sm text-neutral-500">Fragmented view makes analysis challenging</p>
              </div>
            </div>

            {/* After Example with Annotations */}
            <div className="relative rounded-xl overflow-hidden border border-indigo-100 bg-white aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 opacity-50"></div>
              <div className="flex flex-col items-center justify-center h-full p-6 relative z-10">
                <div className="bg-green-50 rounded-full px-4 py-1 text-green-500 text-sm font-medium mb-4">Solution</div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-800">Multiple Screenshots Solution</h3>
                <p className="text-neutral-600 text-center mb-6">Our tool combines screenshots into one seamless image</p>
                <div className="w-40 h-80 bg-white rounded border border-gray-200 shadow-sm flex items-center justify-center text-sm text-gray-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-30"></div>
                  Combined View
                  
                  {/* Annotation Markers */}
                  {annotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className={`absolute w-7 h-7 -mt-3.5 -ml-3.5 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer
                        ${annotation.type === "high" ? "bg-gradient-to-br from-red-400 to-red-500" : 
                          annotation.type === "medium" ? "bg-gradient-to-br from-amber-400 to-amber-500" : "bg-gradient-to-br from-blue-400 to-blue-500"
                        } shadow-md transition-all duration-200 hover:scale-110 ${hoveredAnnotation === annotation.id ? 'ring-2 ring-white ring-opacity-70 scale-110' : ''}`}
                      style={{
                        left: `${annotation.x}%`,
                        top: `${annotation.y}%`,
                      }}
                      onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                      onMouseLeave={() => setHoveredAnnotation(null)}
                    >
                      {annotation.id}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-neutral-500 mt-4">Complete analysis with advanced AI feedback</p>
              </div>
            </div>
          </div>

          {/* Annotations List */}
          <div className="max-w-3xl mx-auto space-y-4 mb-10">
            <h3 className="text-2xl font-semibold text-center text-neutral-800 mb-6">Detailed Feedback</h3>
            {annotations.map((annotation) => (
              <div 
                key={annotation.id} 
                className={`p-5 rounded-xl border transition-all duration-300 ${
                  hoveredAnnotation === annotation.id 
                    ? 'bg-white shadow-md scale-102 border-transparent' 
                    : 'bg-white/60 border-gray-100 hover:bg-white/90'
                }`}
                onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                onMouseLeave={() => setHoveredAnnotation(null)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0 shadow-sm
                      ${annotation.type === "high" ? "bg-gradient-to-br from-red-400 to-red-500" : 
                        annotation.type === "medium" ? "bg-gradient-to-br from-amber-400 to-amber-500" : "bg-gradient-to-br from-blue-400 to-blue-500"
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
                    <div className="bg-accent/5 px-3 py-2 rounded-md inline-block">
                      <p className="text-sm font-medium text-accent">
                        Solution: {annotation.solution}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Button 
              onClick={scrollToUploadSection}
              className="px-8 py-6 bg-gradient-to-r from-accent to-accent-foreground text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10">Try Multiple Screenshots Now</span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <span className="absolute -inset-x-2 bottom-0 h-1 bg-white opacity-20"></span>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Wave divider after section */}
      <WaveDivider fillColor="#F9FAFB" height={30} className="my-0 transform rotate-180" />
    </>
  );
};
