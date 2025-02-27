import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Farm } from '@/types/farmTypes';
import { WeatherData } from '@/types/weatherTypes';
import { FinancialEntry, SustainabilityReportData } from '@/types/financialTypes';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Calendar, TrendingUp } from 'lucide-react';
import SustainabilityReport from './SustainabilityReport';
import FinancialTools from './FinancialTools';
import { generatePerformancePDF } from '@/utils/pdfUtils';

interface ReportsPageProps {
  farms: Farm[];
  weatherData: WeatherData[];
  cropFilter: string;
  financialData: FinancialEntry[];
  setFinancialData: React.Dispatch<React.SetStateAction<FinancialEntry[]>>;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ farms, financialData, setFinancialData, cropFilter }) => {
  const [selectedFarm, setSelectedFarm] = useState<number | 'all'>('all');
  const [reportPeriod, setReportPeriod] = useState('last-month');
  const [performanceMetric, setPerformanceMetric] = useState('yields');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisGenerated, setAnalysisGenerated] = useState(false);

  // Move getFilteredFarms function before its usage in performanceData
  const getFilteredFarms = () => {
    if (selectedFarm === 'all') {
      return cropFilter === 'all' ? farms : farms.filter(farm => farm.crop === cropFilter);
    }
    return farms.filter(farm => farm.id === Number(selectedFarm));
  };

  // Calculate performance metrics
  const performanceData = useMemo(() => {
    return {
      yields: calculateYieldPerformance(getFilteredFarms()),
      water: calculateWaterEfficiency(getFilteredFarms()),
      costs: calculateCostEfficiency(getFilteredFarms(), financialData),
      quality: calculateQualityMetrics(getFilteredFarms())
    };
  }, [farms, financialData, selectedFarm, reportPeriod, cropFilter]);  // Added cropFilter dependency

  const filteredFarms = getFilteredFarms();

  const sustainabilityData: SustainabilityReportData = useMemo(() => {
    // Calculate basic sustainability metrics
    const farm = selectedFarm === 'all' ? null : farms.find(f => f.id === Number(selectedFarm));
    
    // Historical trends (simulated data if not available)
    const trends = [
      { period: '3 Months Ago', score: 65 },
      { period: '2 Months Ago', score: 72 },
      { period: 'Last Month', score: 78 },
      { period: 'Current', score: farm ? calculateOverallScore(farm) : calculateAverageScore(filteredFarms) }
    ];
    
    // Water savings calculation compared to industry average
    const totalWaterUsage = filteredFarms.reduce((total, farm) => 
      total + farm.waterHistory.reduce((sum, water) => sum + water.amount, 0), 0);
    
    // Industry average (hypothetical)
    const industryAverage = filteredFarms.reduce((total, farm) => {
      return total + (parseInt(farm.size) * 100); // 100 gallons per acre assumption
    }, 0);
    
    const waterSavings = Math.max(0, industryAverage - totalWaterUsage);
    
    // Chemical reduction calculation based on organic vs. chemical fertilizers
    const organicFertilizerRatio = calculateOrganicFertilizerRatio(filteredFarms);
    const chemicalReduction = Math.round(organicFertilizerRatio * 100);
    
    // Calculate overall metrics
    const organicPracticesAdoption = Math.round(
      filteredFarms.reduce((sum, farm) => sum + (farm.organicMatter || 0), 0) / 
      (filteredFarms.length || 1) * 100
    );
    
    // Set of recommendations based on metrics
    const recommendations = generateRecommendations(filteredFarms);
    
    return {
      overallScore: Math.round(trends[trends.length - 1].score),
      metrics: {
        waterEfficiency: getAverageMetric(filteredFarms, 'waterEfficiency'),
        organicScore: getAverageMetric(filteredFarms, 'organicScore'),
        harvestEfficiency: getAverageMetric(filteredFarms, 'harvestEfficiency'),
        soilQuality: getAverageMetric(filteredFarms, 'soilQualityScore'),
        cropRotation: getAverageMetric(filteredFarms, 'rotationScore')
      },
      waterSavings,
      chemicalReduction,
      organicPracticesAdoption,
      recommendations,
      trends,
      // Add monthly data for graphs
      monthlyData: generateMonthlyData(filteredFarms),
      // Add comparison data for radar chart
      comparisonData: generateComparisonData(filteredFarms)
    };
  }, [filteredFarms, selectedFarm, farms, cropFilter]);

  // Function to load detailed analysis - simulate with a loading state
  const loadDetailedAnalysis = () => {
    setIsLoading(true);
    // Simulate API call or complex calculation
    setTimeout(() => {
      setIsLoading(false);
      setAnalysisGenerated(true);
    }, 1200);
  };

  // Export performance report
  const exportPerformanceReport = () => {
    const selectedFarmName = selectedFarm === 'all' 
      ? 'All Farms' 
      : farms.find(f => f.id === Number(selectedFarm))?.name || 'Unknown Farm';
      
    const reportPeriodText = getReportPeriodText();
    
    generatePerformancePDF(
      selectedFarmName,
      performanceData,
      reportPeriodText,
      performanceMetric
    );
  };

  const selectedFarmName = selectedFarm === 'all' 
    ? 'All Farms' 
    : farms.find(f => f.id === Number(selectedFarm))?.name || 'Unknown Farm';

  const getReportPeriodText = () => {
    const periods: {[key: string]: string} = {
      'last-month': 'Last 30 Days',
      'last-quarter': 'Last Quarter',
      'year-to-date': 'Year to Date',
      'all-time': 'All Time'
    };
    return periods[reportPeriod] || 'Custom Period';
  };

  const reportPeriodText = getReportPeriodText();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Farm Reports & Analytics</h1>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="farm-select">Farm:</Label>
            <Select 
              value={selectedFarm.toString()} 
              onValueChange={(value) => setSelectedFarm(value === 'all' ? 'all' : Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select farm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farms</SelectItem>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id.toString()}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="period-select">Period:</Label>
            <Select 
              value={reportPeriod} 
              onValueChange={setReportPeriod}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-month">Last 30 Days</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="year-to-date">Year to Date</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sustainability">
        <TabsList>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sustainability">
          <SustainabilityReport 
            farmName={selectedFarmName}
            data={sustainabilityData}
            period={reportPeriodText} 
          />
        </TabsContent>
        
        <TabsContent value="financial">
          <FinancialTools 
            farms={farms} 
            financialData={financialData} 
            setFinancialData={setFinancialData} 
          />
        </TabsContent>
        
        <TabsContent value="performance">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold">Farm Performance Analytics</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={loadDetailedAnalysis}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Load Detailed Analysis"}
                  </Button>
                  <Button onClick={exportPerformanceReport}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <Label className="mr-2">Metric:</Label>
                    <Select 
                      value={performanceMetric} 
                      onValueChange={setPerformanceMetric}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yields">Crop Yields</SelectItem>
                        <SelectItem value="water">Water Efficiency</SelectItem>
                        <SelectItem value="costs">Cost Analysis</SelectItem>
                        <SelectItem value="quality">Quality Metrics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Farm:</span> {selectedFarmName} | 
                    <span className="font-medium"> Period:</span> {reportPeriodText}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {performanceMetric === 'yields' && 'Yield Performance'}
                      {performanceMetric === 'water' && 'Water Usage Efficiency'}
                      {performanceMetric === 'costs' && 'Cost Efficiency'}
                      {performanceMetric === 'quality' && 'Quality Metrics'}
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {performanceMetric === 'yields' ? (
                          <BarChart data={performanceData.yields}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value} bushels`} />
                            <Legend />
                            <Bar name="Current Yield" dataKey="current" fill="#4ade80" />
                            <Bar name="Previous Period" dataKey="previous" fill="#94a3b8" />
                            <Bar name="Target" dataKey="target" fill="#60a5fa" />
                          </BarChart>
                        ) : performanceMetric === 'water' ? (
                          <LineChart data={performanceData.water}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value} gallons`} />
                            <Legend />
                            <Line type="monotone" dataKey="usage" stroke="#60a5fa" name="Usage" />
                            <Line type="monotone" dataKey="optimal" stroke="#4ade80" name="Optimal" strokeDasharray="5 5" />
                          </LineChart>
                        ) : performanceMetric === 'costs' ? (
                          <PieChart>
                            <Pie
                              data={performanceData.costs}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {performanceData.costs.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value}`} />
                          </PieChart>
                        ) : (
                          <RadarChart cx="50%" cy="50%" outerRadius={120} width={500} height={350} data={performanceData.quality}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <Tooltip />
                            <Radar name="This Year" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <Radar name="Previous Year" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                            <Legend />
                          </RadarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Trend Analysis</h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={
                            performanceMetric === 'yields' ? performanceData.yields.map(d => ({ ...d, value: d.current })) :
                            performanceMetric === 'water' ? performanceData.water.map(d => ({ ...d, value: d.efficiency })) :
                            performanceMetric === 'costs' ? performanceData.costs.map(d => ({ ...d, month: d.name })) :
                            performanceData.quality.map(d => ({ ...d, value: d.A }))
                          }
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={performanceMetric === 'costs' ? 'month' : (performanceMetric === 'water' ? 'date' : 'name')} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="value" stackId="1" stroke="#8884d8" fill="#8884d8" name="Trend" />
                          {performanceMetric === 'yields' && (
                            <Area type="monotone" dataKey="target" stackId="2" stroke="#4ade80" fill="#4ade80" name="Target" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {analysisGenerated && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-blue-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Historical Comparison
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {performanceMetric === 'yields' && 'Crop yields have improved 12% compared to the same period last year, with the most significant gains in the corn fields.'}
                            {performanceMetric === 'water' && 'Water efficiency has improved by 15% compared to last season, resulting in significant savings.'}
                            {performanceMetric === 'costs' && 'Cost per acre has decreased by 8% from the previous year, primarily due to reduced fertilizer expenses.'}
                            {performanceMetric === 'quality' && 'Product quality metrics show a 5% improvement across all measured parameters compared to last harvest.'}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Performance Factors
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {performanceMetric === 'yields' && 'Key factors: improved seed quality (+5%), better irrigation timing (+8%), and enhanced soil preparation (+4%).'}
                            {performanceMetric === 'water' && 'Improvements from: drip irrigation implementation (+10%), rainfall optimization (+5%), and reduced evaporation (-8%).'}
                            {performanceMetric === 'costs' && 'Savings from: bulk purchasing (15%), equipment maintenance (10%), and reduced waste (12%).'}
                            {performanceMetric === 'quality' && 'Improvements driven by: better harvesting timing (45%), improved storage (30%), and enhanced sorting (25%).'}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-purple-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm list-disc pl-4 space-y-1">
                            {performanceMetric === 'yields' ? (
                              <>
                                <li>Increase plant density in southeast fields</li>
                                <li>Adjust harvest timing based on weather patterns</li>
                                <li>Consider additional soil amendments in low-performing areas</li>
                              </>
                            ) : performanceMetric === 'water' ? (
                              <>
                                <li>Expand drip irrigation to northern fields</li>
                                <li>Implement soil moisture sensors in dry areas</li>
                                <li>Adjust watering schedule based on forecast data</li>
                              </>
                            ) : performanceMetric === 'costs' ? (
                              <>
                                <li>Negotiate volume discounts with seed suppliers</li>
                                <li>Consider equipment sharing for seasonal machinery</li>
                                <li>Implement fuel efficiency training for operators</li>
                              </>
                            ) : (
                              <>
                                <li>Improve post-harvest handling procedures</li>
                                <li>Update storage facility temperature controls</li>
                                <li>Implement more precise grading standards</li>
                              </>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper functions for performance tab
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function calculateYieldPerformance(farms: Farm[]) {
  // Generate realistic yield data for the selected farms
  return [
    { name: 'Corn', current: 185, previous: 165, target: 200 },
    { name: 'Soybeans', current: 52, previous: 48, target: 55 },
    { name: 'Wheat', current: 75, previous: 70, target: 80 },
    { name: 'Cotton', current: 950, previous: 920, target: 1000 },
    { name: 'Rice', current: 8500, previous: 8200, target: 9000 }
  ].filter(crop => {
    // Only include crops that are grown on the selected farms
    return farms.some(farm => farm.crop.toLowerCase().includes(crop.name.toLowerCase()));
  });
}

function calculateWaterEfficiency(farms: Farm[]) {
  // Generate water usage data with efficiency metrics
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => {
    const baseUsage = 5000 + Math.sin(i / 2) * 3000; // Seasonal pattern
    const farmFactor = farms.reduce((sum, farm) => sum + parseInt(farm.size), 0) / 100;
    const usage = baseUsage * (farmFactor || 1);
    const optimal = baseUsage * 0.8 * (farmFactor || 1);
    const efficiency = (optimal / usage) * 100;
    
    return {
      date: month,
      usage,
      optimal,
      efficiency
    };
  });
}

function calculateCostEfficiency(farms: Farm[], financialData: FinancialEntry[]) {
  // Calculate cost breakdown from financial data
  const costCategories = [
    { name: 'Seeds', value: 0 },
    { name: 'Fertilizer', value: 0 },
    { name: 'Labor', value: 0 },
    { name: 'Equipment', value: 0 },
    { name: 'Fuel', value: 0 },
    { name: 'Other', value: 0 }
  ];
  
  // Populate with actual data from financialData if available
  financialData
    .filter(entry => entry.category === 'expense' && farms.some(farm => farm.id === entry.farmId))
    .forEach(entry => {
      const category = costCategories.find(c => c.name.toLowerCase() === entry.type.toLowerCase());
      if (category) {
        category.value += entry.amount;
      } else {
        costCategories.find(c => c.name === 'Other')!.value += entry.amount;
      }
    });
  
  // Ensure we have some data for visualization even if financialData is empty
  if (costCategories.every(c => c.value === 0)) {
    costCategories.forEach((category, i) => {
      category.value = 1000 + i * 500 + Math.random() * 1000;
    });
  }
  
  return costCategories;
}

function calculateQualityMetrics(_farms: Farm[]) {
  // Generate quality metrics data for radar chart
  return [
    { subject: 'Size/Weight', A: 80 + Math.random() * 20, B: 70 + Math.random() * 20, fullMark: 100 },
    { subject: 'Color', A: 85 + Math.random() * 15, B: 75 + Math.random() * 20, fullMark: 100 },
    { subject: 'Uniformity', A: 75 + Math.random() * 25, B: 65 + Math.random() * 25, fullMark: 100 },
    { subject: 'Moisture', A: 90 + Math.random() * 10, B: 80 + Math.random() * 15, fullMark: 100 },
    { subject: 'Defects', A: 70 + Math.random() * 30, B: 65 + Math.random() * 25, fullMark: 100 },
  ];
}

// Helper functions for sustainability data
function calculateOverallScore(_farm: Farm): number {
  // Implementation for a single farm...
  return Math.round(70 + Math.random() * 20); // Placeholder value 
}

function calculateAverageScore(farms: Farm[]): number {
  if (farms.length === 0) return 0;
  // Return a range between 60 and 90
  return Math.round(60 + Math.random() * 30);
}

function calculateOrganicFertilizerRatio(farms: Farm[]): number {
  let organicCount = 0;
  let totalCount = 0;
  
  farms.forEach(farm => {
    if (farm.fertilizerHistory && farm.fertilizerHistory.length) {
      totalCount += farm.fertilizerHistory.length;
      organicCount += farm.fertilizerHistory.filter(f => 
        f.type?.toLowerCase().includes('organic') ||
        f.type?.toLowerCase().includes('compost')
      ).length;
    }
  });
  
  return totalCount > 0 ? organicCount / totalCount : 0.5; // Default to 50% if no data
}

function getAverageMetric(_farms: Farm[], metricName: string): number {
  // Return a range between 60 and 95 based on the metric name
  const baseValue = {
    'waterEfficiency': 75,
    'organicScore': 65,
    'harvestEfficiency': 80,
    'soilQualityScore': 70,
    'rotationScore': 60
  }[metricName] || 70;
  
  return Math.round(baseValue + (Math.random() * 15));
}

function generateRecommendations(_farms: Farm[]): string[] {
  const baseRecommendations = [
    "Implement drip irrigation to improve water usage efficiency",
    "Increase use of organic fertilizers to reduce chemical dependency",
    "Implement more diverse crop rotation practices to improve soil health",
    "Consider cover crops during off-seasons to improve soil structure",
    "Install soil moisture sensors to optimize irrigation timing",
    "Consider installing rainwater harvesting systems for natural irrigation"
  ];
  
  // Return a subset of recommendations
  return baseRecommendations.slice(0, 3 + Math.floor(Math.random() * 3));
}

// Functions to generate additional data for graphs
function generateMonthlyData(_farms: Farm[] = []) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => {
    const baseValue = 50 + Math.random() * 30;
    return {
      name: month,
      waterEfficiency: Math.round(baseValue + Math.random() * 10),
      organicPractices: Math.round(baseValue - 5 + Math.random() * 10),
      soilHealth: Math.round(baseValue - 10 + Math.random() * 15)
    };
  });
}

function generateComparisonData(_farms: Farm[] = []) {
  return [
    {
      category: "Water Usage",
      yours: Math.round(70 + Math.random() * 20),
      average: 65,
      target: 85
    },
    {
      category: "Organic Practices",
      yours: Math.round(60 + Math.random() * 30),
      average: 55,
      target: 80
    },
    {
      category: "Soil Health",
      yours: Math.round(65 + Math.random() * 25),
      average: 60,
      target: 85
    },
    {
      category: "Biodiversity",
      yours: Math.round(50 + Math.random() * 30),
      average: 45,
      target: 75
    },
    {
      category: "Energy Efficiency",
      yours: Math.round(60 + Math.random() * 25),
      average: 50,
      target: 80
    }
  ];
}

export default ReportsPage;
