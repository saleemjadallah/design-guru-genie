
import { UploadSection } from "@/components/upload/UploadSection";
import { GeometricAccents } from "@/components/patterns/GeometricAccents";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SeeItInAction } from "@/components/landing/SeeItInAction";
import { PricingSection } from "@/components/landing/PricingSection";

export const Index = () => {
  return (
    <div className="min-h-screen">
      <GeometricAccents />

      <div className="max-w-screen-xl mx-auto px-4 py-12 sm:px-6 lg:py-16">
        <Hero />

        <div className="mt-16">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <UploadSection />
          </div>
        </div>

        <HowItWorks />
        
        <SeeItInAction />
        
        <PricingSection />
      </div>
    </div>
  );
};

export default Index;
