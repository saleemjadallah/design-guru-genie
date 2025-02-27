
import { Download, Share2 } from "lucide-react";

type Props = {
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  setPriorityFilter: (filter: 'all' | 'high' | 'medium' | 'low') => void;
};

export const FilterControls = ({ priorityFilter, setPriorityFilter }: Props) => {
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
