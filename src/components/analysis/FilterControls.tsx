
import { Button } from "@/components/ui/button";

interface Props {
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  setPriorityFilter: (filter: 'all' | 'high' | 'medium' | 'low') => void;
}

export const FilterControls = ({ priorityFilter, setPriorityFilter }: Props) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <h3 className="text-sm font-medium text-neutral-600">Filter by priority</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setPriorityFilter('all')}
          variant={priorityFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          className={priorityFilter === 'all' ? 'bg-accent hover:bg-accent/90' : ''}
        >
          All
        </Button>
        <Button
          onClick={() => setPriorityFilter('high')}
          variant={priorityFilter === 'high' ? 'default' : 'outline'}
          size="sm"
          className={`${
            priorityFilter === 'high'
              ? 'bg-red-500 hover:bg-red-600 border-red-500'
              : 'border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          High
        </Button>
        <Button
          onClick={() => setPriorityFilter('medium')}
          variant={priorityFilter === 'medium' ? 'default' : 'outline'}
          size="sm"
          className={`${
            priorityFilter === 'medium'
              ? 'bg-orange-500 hover:bg-orange-600 border-orange-500'
              : 'border-orange-200 text-orange-700 hover:border-orange-300 hover:bg-orange-50'
          }`}
        >
          Medium
        </Button>
        <Button
          onClick={() => setPriorityFilter('low')}
          variant={priorityFilter === 'low' ? 'default' : 'outline'}
          size="sm"
          className={`${
            priorityFilter === 'low'
              ? 'bg-green-500 hover:bg-green-600 border-green-500'
              : 'border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50'
          }`}
        >
          Low
        </Button>
      </div>
    </div>
  );
};
