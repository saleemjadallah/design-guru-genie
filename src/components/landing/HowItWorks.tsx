
import { Upload, Brain, MessageCircle, Rocket } from "lucide-react";
import { useState } from "react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Design or URL",
    description: "Share your website URL or upload a design image in seconds. We support most common file formats.",
    color: "#4F46E5", // Indigo-blue
    gradient: "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)",
  },
  {
    icon: Brain,
    title: "AI Analyzes Your Content",
    description: "Our AI examines your website or design using professional principles from color theory, typography, layout, and UX best practices.",
    color: "#7C3AED", // Purple
    gradient: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
  },
  {
    icon: MessageCircle,
    title: "Get Actionable Feedback",
    description: "Receive specific, actionable recommendations with detailed insights highlighting exactly what aspects to improve and why.",
    color: "#0D9488", // Teal
    gradient: "linear-gradient(135deg, #0D9488 0%, #5EEAD4 100%)",
  },
  {
    icon: Rocket,
    title: "Elevate Your Design",
    description: "Apply the recommended changes and see immediate improvements in your design's effectiveness and user experience.",
    color: "#10B981", // Green
    gradient: "linear-gradient(135deg, #10B981 0%, #86EFAC 100%)",
  }
];

export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="mt-24 bg-white rounded-2xl p-12 shadow-sm">
      <h2 className="text-3xl font-bold text-center mb-12 text-neutral-900">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center text-center group transition-all duration-300 ease-in-out transform hover:scale-[1.03]"
            style={{ animationDelay: `${index * 150}ms` }}
            onMouseEnter={() => setActiveStep(index)}
            onMouseLeave={() => setActiveStep(null)}
          >
            <div 
              className={`rounded-xl p-6 h-full w-full ${activeStep !== null && activeStep !== index ? 'opacity-80' : 'opacity-100'} 
                transition-all duration-300 ease-in-out shadow-md hover:shadow-lg`}
              style={{ 
                background: `${step.gradient}`,
                opacity: activeStep !== null && activeStep !== index ? 0.7 : 1
              }}
            >
              {/* Step Number */}
              <div 
                className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center font-bold text-xl mb-6 mx-auto shadow-md"
                style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.2)" }}
              >
                {index + 1}
              </div>
              
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 left-[60%] w-[80%] h-[3px]" style={{ 
                  background: `linear-gradient(to right, ${step.color}, ${steps[index + 1].color})`,
                  opacity: 0.7
                }}>
                  <div className="absolute h-full w-[6px] animate-pulse rounded-full bg-white" 
                       style={{ 
                         animation: `moveRight 3s infinite ${index * 0.5}s`,
                         left: '0%'
                       }} />
                </div>
              )}
              
              {/* Icon */}
              <div className="relative mx-auto">
                <div className="absolute inset-0 rounded-full bg-white/30 blur-md transform scale-110" />
                <div className="relative w-16 h-16 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                  <step.icon className="w-10 h-10 text-white" style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.2))" }} />
                </div>
              </div>
              
              {/* Content */}
              <div className="mt-4 text-white" style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.1)" }}>
                <h3 className="font-bold text-xl mb-3 leading-tight">
                  {step.title}
                </h3>
                <p className="text-white/90 leading-relaxed text-base">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom animation keyframes for the moving dots - fix the style tag */}
      <style>{`
        @keyframes moveRight {
          0% { left: 0%; }
          100% { left: 100%; }
        }
      `}</style>
    </section>
  );
};
