
import { Download, Share2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  setPriorityFilter: (filter: 'all' | 'high' | 'medium' | 'low') => void;
  uploadedImage: string | null;
  feedback: any[];
  isUrlAnalysis: boolean;
};

export const FilterControls = ({ 
  priorityFilter, 
  setPriorityFilter,
  uploadedImage,
  feedback,
  isUrlAnalysis
}: Props) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveReview = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save reviews",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const title = isUrlAnalysis ? "Website Analysis" : "Design Analysis";
      const currentDate = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('saved_reviews')
        .insert({
          title: `${title} - ${currentDate.split('T')[0]}`,
          image_url: uploadedImage,
          feedback: JSON.stringify(feedback),
          user_id: session.session.user.id
        })
        .select();

      if (error) throw error;

      toast({
        title: "Review saved",
        description: "Your review has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving review:", error);
      toast({
        title: "Failed to save review",
        description: "There was an error saving your review",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-center">
        <span className="text-sm text-neutral-700 mr-2">Filter by:</span>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              priorityFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            } border border-neutral-300`}
            onClick={() => setPriorityFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              priorityFilter === 'high'
                ? 'bg-red-500 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            } border-t border-b border-r border-neutral-300`}
            onClick={() => setPriorityFilter('high')}
          >
            High
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              priorityFilter === 'medium'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            } border-t border-b border-r border-neutral-300`}
            onClick={() => setPriorityFilter('medium')}
          >
            Medium
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              priorityFilter === 'low'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            } border-t border-b border-r border-neutral-300`}
            onClick={() => setPriorityFilter('low')}
          >
            Low
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          className="flex items-center px-4 py-2 bg-white border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          onClick={handleSaveReview}
          disabled={isSaving}
        >
          <Save size={16} className="mr-2" />
          {isSaving ? "Saving..." : "Save Review"}
        </button>
        <button className="flex items-center px-4 py-2 bg-white border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          <Download size={16} className="mr-2" />
          Export PDF
        </button>
        <button className="flex items-center px-4 py-2 bg-white border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          <Share2 size={16} className="mr-2" />
          Share
        </button>
      </div>
    </div>
  );
};
