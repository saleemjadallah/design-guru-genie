
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FollowUpPromptProps {
  isSubscribed?: boolean;
}

export const FollowUpPrompt = ({ isSubscribed: propIsSubscribed }: FollowUpPromptProps) => {
  // For demo purposes, we'll always set isSubscribed to true
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        // In demo mode, always set as subscribed regardless of metadata
        setIsSubscribed(true);
      }
    };
    
    checkSubscription();
  }, [propIsSubscribed]);

  const handleFollowUpClick = () => {
    // Always navigate to follow-up analysis in demo mode
    navigate("/follow-up-analysis");
  };

  return (
    <>
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Follow-Up Analysis</h3>
        
        <p className="text-gray-700 mb-4">
          After implementing our recommended changes, submit your updated design for a follow-up analysis to:
        </p>
        
        <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
          <li>Measure improvement with before/after metrics</li>
          <li>Identify any remaining issues</li>
          <li>Get expert verification that changes were implemented correctly</li>
          <li>Receive a professional progress report you can share with stakeholders</li>
        </ul>
        
        <Button 
          onClick={handleFollowUpClick}
          className="bg-accent hover:bg-accent/90"
        >
          Submit Follow-Up Design
        </Button>
      </div>
    </>
  );
};
