
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
import { ArrowLeft, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type SavedReview = {
  id: string;
  title: string;
  image_url: string;
  feedback: string;
  created_at: string;
  updated_at: string;
};

const SavedReviews = () => {
  const [reviews, setReviews] = useState<SavedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        navigate("/");
        toast({
          title: "Authentication required",
          description: "Please sign in to view saved reviews",
          variant: "destructive",
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('saved_reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast({
          title: "Failed to load reviews",
          description: "There was an error loading your saved reviews",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [navigate]);

  const handleDeleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReviews(reviews.filter(review => review.id !== id));
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Failed to delete review",
        description: "There was an error deleting your review",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button 
            className="mr-4 text-neutral-600 hover:text-neutral-900"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">Saved Reviews</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-neutral-500">Loading saved reviews...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-xl font-semibold text-neutral-700 mb-4">No saved reviews yet</h2>
            <p className="text-neutral-500 mb-6">Save reviews from your design analyses to access them here.</p>
            <button 
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              onClick={() => navigate("/")}
            >
              Start a new analysis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="h-48 bg-neutral-100 relative">
                  {review.image_url ? (
                    <img 
                      src={review.image_url} 
                      alt={review.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                      No image available
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2">{review.title}</h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    Created on {formatDate(review.created_at)}
                  </p>
                  <div className="flex justify-between">
                    <button
                      className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      onClick={() => navigate(`/review/${review.id}`)}
                    >
                      <Eye size={16} className="mr-1" />
                      View Details
                    </button>
                    <button
                      className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedReviews;
