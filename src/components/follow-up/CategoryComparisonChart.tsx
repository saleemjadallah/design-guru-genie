
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CategoryData {
  category: string;
  current: number;
  previous: number;
}

interface CategoryComparisonChartProps {
  data: CategoryData[];
  title: string;
  description?: string;
}

export const CategoryComparisonChart = ({ 
  data, 
  title,
  description 
}: CategoryComparisonChartProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-4 text-sm">{description}</p>
      )}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="previous" fill="#94a3b8" name="Previous Analysis" />
            <Bar dataKey="current" fill="#6366f1" name="Current Analysis" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
