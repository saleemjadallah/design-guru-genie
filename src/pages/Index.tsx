
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { AnnotationCanvas } from "@/components/AnnotationCanvas";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Image, Lightbulb, Trophy, Star } from "lucide-react";

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
