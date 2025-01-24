import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Tooltip,
} from "recharts";
import { cn } from "../lib/utils";

// DataVisualizer Component remains the same
interface DataVisualizerProps {
  data: any[];
  type: "line" | "pie";
  metrics: string[];
}

export const DataVisualizer: React.FC<DataVisualizerProps> = ({
  data,
  type,
  metrics,
}) => {
  const [activeMetric, setActiveMetric] = useState(metrics[0]);

  return (
    <div
      className="data-visualizer"
      role="region"
      aria-label="Data visualization"
    >
      <div className="metric-toggle flex gap-2 mb-4">
        {metrics.map((metric) => (
          <button
            key={metric}
            onClick={() => setActiveMetric(metric)}
            aria-pressed={activeMetric === metric}
            className={cn(
              "px-4 py-2 rounded text-sm font-medium",
              activeMetric === metric
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            )}
          >
            {metric}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {type === "line" ? (
          <LineChart data={data}>
            <Line type="monotone" dataKey={activeMetric} stroke="#3b82f6" />
            <Tooltip />
          </LineChart>
        ) : (
          <PieChart>
            <Pie data={data} dataKey={activeMetric} fill="#3b82f6" />
            <Tooltip />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// AddEditPanel Component with stronger light mode enforcement
interface AddEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEditPanel: React.FC<AddEditPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({ name: "", value: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Added a light mode enforcing wrapper */}
      <div className="[color-scheme:light] [&_*]:!text-gray-900">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="value" className="block text-sm font-medium">
                Value
              </label>
              <input
                type="text"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 ml-2 bg-gray-200 rounded hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizer;