
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { AnnotationCanvas } from "@/components/AnnotationCanvas";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { AnnotationExample } from "@/components/AnnotationExample";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { toast } from "@/hooks/use-toast";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Hero />
          
          {!uploadedImage ? (
            <div className="animate-slide-up space-y-6">
              <ImageUpload onImageUpload={handleImageUpload} />
              <div className="text-center">
                <p className="text-sm text-neutral-600">
                  First analysis free • $18/month after • Cancel anytime
                </p>
              </div>

              <HowItWorks />
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
