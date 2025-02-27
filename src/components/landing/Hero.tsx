
import { Star, MousePointer, Layout, Palette } from "lucide-react";

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
      icon: Palette,
      title: "Professional Analysis",
      description: "Get expert insights on your design",
    },
    {
      icon: MousePointer,
      title: "Visual Annotations",
      description: "Clear, actionable visual feedback",
    },
    {
      icon: Layout,
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
      <div className="gradient-header rounded-2xl mb-12 relative overflow-hidden">
        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none pattern-dots"></div>
        
        <div className="pt-16 pb-14 px-6 md:px-10 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-sm">
            Design Critique
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
            Get expert design feedback with AI-powered visual annotations in minutes
          </p>
        </div>
      </div>
      
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
