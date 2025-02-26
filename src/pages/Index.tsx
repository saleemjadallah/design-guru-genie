
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { AnnotationCanvas } from "@/components/AnnotationCanvas";
import { FeedbackPanel } from "@/components/FeedbackPanel";
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
    <div className="min-h-screen bg-neutral-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold mb-4 text-neutral-900">
              Design Critique
            </h1>
            <p className="text-lg text-neutral-600">
              Upload your design and get professional feedback
            </p>
          </div>

          {!uploadedImage ? (
            <div className="animate-slide-up">
              <ImageUpload onImageUpload={handleImageUpload} />
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
