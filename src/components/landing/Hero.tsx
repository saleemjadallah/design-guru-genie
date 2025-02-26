
import { Star } from "lucide-react";

type FeatureProps = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const Feature = ({ icon: Icon, title, description }: FeatureProps) => (
  <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-white hover:shadow-sm transition-all">
    <Icon className="w-8 h-8 mb-3 text-accent" />
    <h3 className="font-semibold text-neutral-800 mb-2">{title}</h3>
    <p className="text-sm text-neutral-600">{description}</p>
  </div>
);

export const Hero = () => {
  const features = [
    {
      icon: Star,
      title: "Professional Analysis",
      description: "Get expert insights on your design",
    },
    {
      icon: Star,
      title: "Visual Annotations",
      description: "Clear, actionable visual feedback",
    },
    {
      icon: Star,
      title: "Actionable Feedback",
      description: "Concrete steps to improve",
    },
    {
      icon: Star,
      title: "Design Best Practices",
      description: "Industry-standard guidelines",
    },
  ];

  return (
    <div className="text-center mb-12 animate-fade-in space-y-6">
      <h1 className="text-5xl font-bold mb-4 text-neutral-900">
        Design Critique
      </h1>
      <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
        Get expert design feedback with AI-powered visual annotations in minutes
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
        {features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-8 text-sm text-neutral-600 mt-8">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-accent" fill="currentColor" />
          <span>4.8/5 average rating</span>
        </div>
        <div className="h-4 w-px bg-neutral-200" />
        <div>Trusted by 1,000+ designers</div>
      </div>
    </div>
  );
};
