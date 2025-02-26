import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { AnnotationCanvas } from "@/components/AnnotationCanvas";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { AnnotationExample } from "@/components/AnnotationExample";
import { toast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Image, 
  Lightbulb, 
  Trophy, 
  Star, 
  Upload,
  Brain,
  MessageCircle,
  Rocket
} from "lucide-react";

type Feedback = {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
};

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedImage(e.target.result as string);
        toast({
          title: "Image uploaded successfully",
          description: "You can now start adding annotations",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnnotationSave = (annotations: any[]) => {
    toast({
      title: "Annotations saved",
      description: `${annotations.length} annotations added`,
    });
  };

  const handleFeedbackSave = (newFeedback: Feedback[]) => {
    setFeedback(newFeedback);
    toast({
      title: "Feedback saved",
      description: "Your feedback has been added to the list",
    });
  };

  const features = [
    {
      icon: CheckCircle,
      title: "Professional Analysis",
      description: "Get expert insights on your design",
    },
    {
      icon: Image,
      title: "Visual Annotations",
      description: "Clear, actionable visual feedback",
    },
    {
      icon: Lightbulb,
      title: "Actionable Feedback",
      description: "Concrete steps to improve",
    },
    {
      icon: Trophy,
      title: "Design Best Practices",
      description: "Industry-standard guidelines",
    },
  ];

  const steps = [
    {
      icon: Upload,
      title: "Upload Your Design",
      description: "Share your website, app interface, or graphic design in seconds. We support most common file formats."
    },
    {
      icon: Brain,
      title: "AI Analyzes Your Design",
      description: "Our AI examines your design using professional principles from color theory, typography, layout, and UX best practices."
    },
    {
      icon: MessageCircle,
      title: "Get Visual Annotations",
      description: "Receive specific, actionable feedback with visual markers highlighting exactly where and how to improve your design."
    },
    {
      icon: Rocket,
      title: "Elevate Your Design",
      description: "Apply the recommended changes and see immediate improvements in your design's effectiveness."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in space-y-6">
            <h1 className="text-5xl font-bold mb-4 text-neutral-900 font-display">
              Design Critique
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Get expert design feedback with AI-powered visual annotations in minutes
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <feature.icon className="w-8 h-8 mb-3 text-accent" />
                  <h3 className="font-semibold text-neutral-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
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

          {!uploadedImage ? (
            <div className="animate-slide-up space-y-6">
              <ImageUpload onImageUpload={handleImageUpload} />
              <div className="text-center">
                <p className="text-sm text-neutral-600">
                  First analysis free • $18/month after • Cancel anytime
                </p>
              </div>

              {/* How It Works Section */}
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
                      {/* Step number bubble */}
                      <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold text-lg mb-6">
                        {index + 1}
                      </div>
                      
                      {/* Connecting line */}
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-[2px] bg-neutral-200" />
                      )}
                      
                      {/* Icon */}
                      <step.icon className="w-8 h-8 mb-4 text-accent" />
                      
                      {/* Content */}
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

              {/* See It In Action Section */}
              <AnnotationExample />
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <AnnotationCanvas
                image={uploadedImage}
                onSave={handleAnnotationSave}
              />
              <FeedbackPanel feedback={feedback} onSave={handleFeedbackSave} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
