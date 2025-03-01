
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { GeometricAccents } from "@/components/patterns/GeometricAccents";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SeeItInAction } from "@/components/landing/SeeItInAction";
import { UploadSection } from "../upload/UploadSection";

export const MainContainer = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState([]);

  return (
    <div className="min-h-screen">
      <GeometricAccents />

      <div className="max-w-screen-xl mx-auto px-4 py-12 sm:px-6 lg:py-16">
        <Hero />

        <div className="mt-16">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <Sheet open={showFeedback} onOpenChange={setShowFeedback}>
              <SheetContent
                side="right"
                className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-0"
              >
                <FeedbackPanel 
                  feedback={feedback}
                  selectedIssue={null}
                  setFeedback={setFeedback}
                />
              </SheetContent>

              <UploadSection setShowFeedback={setShowFeedback} />
            </Sheet>
          </div>
        </div>

        <HowItWorks />
        
        <SeeItInAction />
      </div>
    </div>
  );
};
