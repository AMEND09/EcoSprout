import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SustainabilityReportData } from '@/types/financialTypes';
import { generateSustainabilityPDF } from '@/utils/pdfUtils';
import { FileText, Droplet, Leaf, BarChart2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface SustainabilityReportProps {
  farmName: string;
  data: SustainabilityReportData;
  period: string;
}

const SustainabilityReport: React.FC<SustainabilityReportProps> = ({ farmName, data, period }) => {
  const handleExportPDF = () => {
    generateSustainabilityPDF(farmName, data, period);
  };

  // Convert metrics object to array for charts
  const metricsArray = useMemo(() => {
    return Object.entries(data.metrics).map(([name, value]) => ({
      name: formatMetricName(name),
      value
    }));
  }, [data.metrics]);

  return (
    <div className="space-y-6" id="sustainability-report">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold">Sustainability Report</CardTitle>
          <Button onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Overall Score</h2>
              <div className="text-4xl font-bold" style={{ color: getScoreColor(data.overallScore) }}>
                {data.overallScore}/100
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {getScoreDescription(data.overallScore)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.metrics).map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-500">{formatMetricName(key)}</h3>
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(value) }}
                  >
                    {value}%
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-base">Water Savings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">
                    {data.waterSavings.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">gallons</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <CardTitle className="text-base">Chemical Reduction</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">
                    {data.chemicalReduction}%
                  </div>
                  <p className="text-sm text-gray-500">Less chemicals used</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-purple-500" />
                    <CardTitle className="text-base">Organic Practices</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700">
                    {data.organicPracticesAdoption}%
                  </div>
                  <p className="text-sm text-gray-500">Adoption rate</p>
                </CardContent>
              </Card>
            </div>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="inline-block h-5 w-5 rounded-full bg-green-100 text-green-800 text-xs flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Sustainability Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Period</th>
                        <th className="px-6 py-3">Score</th>
                        <th className="px-6 py-3">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.trends.map((trend, index, arr) => {
                        const prevScore = index > 0 ? arr[index - 1].score : trend.score;
                        const change = trend.score - prevScore;
                        
                        return (
                          <tr key={index} className="bg-white border-b">
                            <td className="px-6 py-4">{trend.period}</td>
                            <td className="px-6 py-4 font-medium">
                              {trend.score}%
                            </td>
                            <td className="px-6 py-4">
                              {index > 0 && (
                                <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {change >= 0 ? '+' : ''}{change}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Graphs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={metricsArray} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" label>
                          {metricsArray.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsRadarChart data={metricsArray}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis />
                        <Radar name="Metrics" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip />
                      </RechartsRadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const getScoreColor = (score: number): string => {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#ca8a04";
  return "#dc2626";
};

const getScoreDescription = (score: number): string => {
  if (score >= 80) return "Excellent sustainability practices";
  if (score >= 60) return "Good sustainability practices with room for improvement";
  if (score >= 40) return "Moderate sustainability practices - significant improvements needed";
  return "Poor sustainability practices - immediate action recommended";
};

const formatMetricName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default SustainabilityReport;
