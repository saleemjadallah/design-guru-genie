
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReviewHeaderProps {
  title: string;
  created_at: string;
}

export const ReviewHeader = ({ title, created_at }: ReviewHeaderProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center mb-6">
      <button 
        className="mr-4 text-neutral-600 hover:text-neutral-900"
        onClick={() => navigate("/saved-reviews")}
      >
        <ArrowLeft size={20} />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        <p className="text-sm text-neutral-500">
          Saved on {formatDate(created_at)}
        </p>
      </div>
    </div>
  );
};
