
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

export interface AnalysisDataPoint {
  date: string;
  score: number;
  label?: string;
}

interface ComparisonChartProps {
  data: AnalysisDataPoint[];
  title: string;
  description?: string;
}

export const ComparisonChart = ({ 
  data, 
  title,
  description 
}: ComparisonChartProps) => {
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
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value) => [`${value}`, 'Score']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Bar dataKey="score" fill="#8884d8" name="Analysis Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
