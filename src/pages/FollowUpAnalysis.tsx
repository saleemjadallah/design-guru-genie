
import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { FollowUpSubmission } from "@/components/analysis/FollowUpSubmission";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FollowUpAnalysis = () => {
  const [followUpImage, setFollowUpImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  
  const handleFollowUpImageSubmission = (imageUrl: string) => {
    setFollowUpImage(imageUrl);
    
    // Simulate starting the analysis
    setIsAnalyzing(true);
    
    // In a real implementation, we would send the image for analysis here
    // For now, we'll just simulate a delay and then show a success message
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete",
        description: "Your follow-up design has been analyzed successfully.",
      });
    }, 3000);
  };
  
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pt-16">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              className="mb-6 flex items-center gap-1 text-neutral-600 hover:text-neutral-900"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h1 className="text-2xl font-bold mb-2">Follow-Up Analysis</h1>
              <p className="text-gray-600 mb-6">
                Submit your improved design to see how much you've progressed and get feedback on any remaining issues.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-800 mb-1">How it works:</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-1 ml-2">
                  <li>Upload your improved design after implementing our recommendations</li>
                  <li>Our AI compares your original and improved designs</li>
                  <li>You'll receive a detailed improvement report with metrics and any remaining issues</li>
                  <li>Use the report to showcase your progress or make additional refinements</li>
                </ol>
              </div>
              
              {!followUpImage ? (
                <FollowUpSubmission 
                  initialAnalysisId="test-analysis-id" 
                  onSubmissionComplete={handleFollowUpImageSubmission} 
                />
              ) : (
                <div className="text-center py-10">
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="animate-pulse text-xl font-semibold text-accent">
                        Analyzing your improved design...
                      </div>
                      <p className="text-gray-600">
                        This may take a minute as we carefully compare your designs.
                      </p>
                      <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mt-6"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-green-600">Analysis Complete!</h2>
                      <p className="text-gray-700">
                        Your follow-up analysis is now ready. You can view the detailed results and improvement metrics.
                      </p>
                      <div className="pt-4">
                        <Button className="bg-accent hover:bg-accent/90">
                          View Analysis Results
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FollowUpAnalysis;
