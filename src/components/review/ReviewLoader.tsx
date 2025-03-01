
interface ReviewLoaderProps {
  loading: boolean;
}

export const ReviewLoader = ({ loading }: ReviewLoaderProps) => {
  if (!loading) return null;
  
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-pulse text-neutral-500">Loading review details...</div>
    </div>
  );
};
