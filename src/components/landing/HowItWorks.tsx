
import { Upload, Brain, MessageCircle, Rocket, Globe, Link } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Design or URL",
    description: "Share your website URL or upload a design image in seconds. We support most common file formats."
  },
  {
    icon: Brain,
    title: "AI Analyzes Your Content",
    description: "Our AI examines your website or design using professional principles from color theory, typography, layout, and UX best practices."
  },
  {
    icon: MessageCircle,
    title: "Get Actionable Feedback",
    description: "Receive specific, actionable recommendations with detailed insights highlighting exactly what aspects to improve and why."
  },
  {
    icon: Rocket,
    title: "Elevate Your Design",
    description: "Apply the recommended changes and see immediate improvements in your design's effectiveness and user experience."
  }
];

export const HowItWorks = () => {
  return (
    <section className="mt-24 bg-white rounded-2xl p-12 shadow-sm">
      <h2 className="text-3xl font-bold text-center mb-12 text-neutral-900">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center text-center group"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold text-lg mb-6">
              {index + 1}
            </div>
            
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-[2px] bg-neutral-200" />
            )}
            
            <step.icon className="w-8 h-8 mb-4 text-accent" />
            
            <h3 className="font-semibold text-neutral-800 mb-2 text-lg">
              {step.title}
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
