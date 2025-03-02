
import React from "react";
import { Globe } from "lucide-react";
import { UrlSubmissionForm } from "./UrlSubmissionForm";
import { WebsiteAnalysisInfo, ProcessingNotice } from "./WebsiteAnalysisInfo";
import { useUrlScreenshot } from "./useUrlScreenshot";

interface UrlUploadProps {
  onUrlAnalyze: (imageUrl: string, analysisData: any) => void;
}

export const UrlUpload: React.FC<UrlUploadProps> = ({ onUrlAnalyze }) => {
  const { isLoading, captureScreenshot } = useUrlScreenshot();

  const handleSubmit = async (normalizedUrl: string) => {
    const { imageUrl, analysisResults } = await captureScreenshot(normalizedUrl);
    onUrlAnalyze(imageUrl, analysisResults);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl border-neutral-200/70 hover:border-accent/50 hover:bg-neutral-50/30 transition-all"
         style={{
           background: "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(246, 245, 252, 0.7) 100%)",
           backdropFilter: "blur(8px)",
           boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)"
         }}
    >
      <Globe
        className="w-16 h-16 mb-6 text-teal-500/80"
      />
      <h3 className="text-2xl font-semibold mb-3 text-neutral-800">
        Analyze website by URL
      </h3>
      <p className="mb-6 text-neutral-600">
        Enter the website URL below and we'll analyze its design
      </p>
      
      <UrlSubmissionForm onSubmit={handleSubmit} isLoading={isLoading} />
      
      <WebsiteAnalysisInfo />
      
      {isLoading && <ProcessingNotice />}
    </div>
  );
};
