import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Droplet, Leaf, LayoutDashboard, Info, AlertTriangle, Bug, Trash2, Edit3, RotateCw, Download, Upload, Settings } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ReportsPage from '@/components/ReportsPage';
import { FinancialEntry } from '@/types/financialTypes';
import FinancialPlanning from '@/components/FinancialPlanning';

interface WaterUsage {
  amount: number;
  date: string;
  efficiency?: number;  // Add efficiency score for each watering
}

// Update Farm interface to include more data
interface Farm {
  id: number;
  name: string;
  size: string;
  crop: string;
  waterHistory: WaterUsage[];
  fertilizerHistory: any[];
  harvestHistory: any[];
  soilType?: string;
  slopeRatio?: number;
  pesticides?: {
    type: string;
    amount: number;
    date: string;
    toxicity: number;
  }[];
  rotationHistory?: {
    crop: string;
    startDate: string;
    endDate: string;
  }[];
  organicMatter?: number;
  soilPH?: number;
  biodiversityScore?: number;
}

interface WeatherData {
  date: string;
  temp: number;
  weather: string;
  icon: string;
  precipitation?: number;  // mm of rain
}

interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  completed: boolean;
}

interface Issue {
  id: number;
  type: string;
  description: string;
  severity: string;
  status: string;
  dateReported: Date;
}

interface ConfirmDelete {
  id: number;
  type: string;
  date?: string;
  eventId?: number; // Add this for crop plan events
}

interface CropPlanEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  farmId: number;
  type: 'planting' | 'fertilizing' | 'harvesting' | 'other';
  notes?: string;
}

// Update the SustainabilityMetrics interface to only include metrics we have data for
interface SustainabilityMetrics {
  overallScore: number;
  waterEfficiency: number;
  organicScore: number;
  harvestEfficiency: number;
  soilQualityScore: number;
  rotationScore: number;
}

interface WalkthroughStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  tabId?: string;
  onEnter?: () => void;
}

const Walkthrough: React.FC<{ onComplete: () => void, setActiveTab: (tab: string) => void }> = ({ onComplete, setActiveTab }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const WALKTHROUGH_STEPS: WalkthroughStep[] = [
    {
      target: '[data-walkthrough="overview-tab"]',
      title: "Welcome to Farm Management!",
      content: "This is your main dashboard where you can monitor all aspects of your farm. Let's walk through all the features.",
      placement: 'bottom',
      tabId: 'overview'
    },
    {
      target: '[data-walkthrough="quick-actions"]',
      title: "Quick Actions",
      content: "These buttons let you quickly record essential farm activities like water usage, fertilizer applications, and harvests.",
      placement: 'left'
    },
    {
      target: '[data-walkthrough="sustainability"]',
      title: "Sustainability Score",
      content: "Monitor your farm's sustainability metrics here. The score is calculated based on water efficiency, organic practices, harvest efficiency, soil quality, and crop rotation.",
      placement: 'left'
    },
    {
      target: '[data-walkthrough="farms-tab"]',
      title: "Farm Management",
      content: "Click here to manage your farms, add new ones, and track their history.",
      placement: 'bottom',
      tabId: 'farms'
    },
    {
      target: '[data-walkthrough="add-farm"]',
      title: "Adding Farms",
      content: "Click here to add new farms. You can specify size, crop type, and track rotation history.",
      placement: 'right'
    },
    {
      target: '[data-walkthrough="issues-tab"]',
      title: "Farm Issues",
      content: "Track and manage problems in your farms such as pests, diseases, or irrigation issues.",
      placement: 'bottom',
      tabId: 'issues'
    },
    {
      target: '[data-walkthrough="issue-severity"]',
      title: "Issue Management",
      content: "Report issues with different severity levels and track their status. High-severity issues are highlighted for immediate attention.",
      placement: 'left'
    },
    {
      target: '[data-walkthrough="water-tab"]',
      title: "Water Management",
      content: "Monitor water usage trends and efficiency through detailed charts and analytics.",
      placement: 'bottom',
      tabId: 'water'
    },
    {
      target: '[data-walkthrough="crop-plan"]',
      title: "Crop Planning",
      content: "Use the calendar to schedule plantings, harvests, and other farm activities. You can also import and export your crop plans.",
      placement: 'top',
      tabId: 'cropplan'
    },
    {
      target: '[data-walkthrough="reports-tab"]',
      title: "Reports & Analytics",
      content: "View detailed reports on farm performance, including harvest yields, water usage, and sustainability metrics.",
      placement: 'bottom',
      tabId: 'reports'
    }
  ];

  const step = WALKTHROUGH_STEPS[currentStep];

  useEffect(() => {
    const target = document.querySelector(step.target);
    if (target) {
      // Smooth scroll with offset for mobile
      const yOffset = -100; 
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    // Execute onEnter callback if present
    step.onEnter?.();
    // Change tab if specified
    if (step.tabId) {
      setActiveTab(step.tabId);
    }
  }, [currentStep, step, setActiveTab]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black/50" />
      {step && (
        <div
          className="absolute pointer-events-auto bg-white rounded-lg shadow-xl p-4 mx-4 max-w-[calc(100%-2rem)] md:max-w-md animate-bounce-gentle"
          style={{
            ...getPositionForElement(step.target, step.placement),
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold">{step.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onComplete}
              className="hover:bg-gray-100"
            >
              Skip tutorial
            </Button>
          </div>
          <p className="text-gray-600 mb-4">{step.content}</p>
          <div className="flex justify-between items-center">
            <div className="space-x-1">
              {WALKTHROUGH_STEPS.map((_, index) => (
                <span
                  key={index}
                  className={`inline-block w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  Previous
                </Button>
              )}
              {currentStep < WALKTHROUGH_STEPS.length - 1 ? (
                <Button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={onComplete}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getPositionForElement = (selector: string, placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom') => {
  const element = document.querySelector(selector);
  if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  const rect = element.getBoundingClientRect();
  const isMobile = window.innerWidth < 768;
  const margin = isMobile ? 16 : 24;

  // Ensure the tooltip is always visible on mobile by centering horizontally
  if (isMobile) {
    return {
      top: `${rect.bottom + margin}px`,
      left: '50%',
      transform: 'translateX(-50%)',
    };
  }

  const positions: Record<'top' | 'bottom' | 'left' | 'right', { top: string; left: string; transform: string }> = {
    top: { 
      top: `${rect.top - margin}px`, 
      left: `${rect.left + rect.width / 2}px`, 
      transform: 'translate(-50%, -100%)' 
    },
    bottom: { 
      top: `${rect.bottom + margin}px`, 
      left: `${rect.left + rect.width / 2}px`, 
      transform: 'translate(-50%, 0)' 
    },
    left: { 
      top: `${rect.top + rect.height / 2}px`, 
      left: `${rect.left - margin}px`, 
      transform: 'translate(-100%, -50%)' 
    },
    right: { 
      top: `${rect.top + rect.height / 2}px`, 
      left: `${rect.right + margin}px`, 
      transform: 'translate(0, -50%)' 
    },
  };

  // Ensure the position is within viewport bounds
  const position = positions[placement];
  const maxWidth = window.innerWidth - 32; // Account for margins
  const left = Math.min(Math.max(16, parseFloat(position.left)), maxWidth);
  
  return {
    ...position,
    left: `${left}px`,
  };
};

const walkthroughStyles = `
  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  .animate-bounce-gentle {
    animation: bounce-gentle 2s infinite;
  }
`;

const calculateWaterEfficiency = (
  waterHistory: WaterUsage[],
  weatherData: WeatherData[],
): number => {
  if (!waterHistory || waterHistory.length === 0) return 0;
  
  const waterUsage = waterHistory[waterHistory.length - 1]; // Get most recent water usage
  const waterDate = new Date(waterUsage.date).setHours(0, 0, 0, 0);
  
  const dayWeather = weatherData.find(w => 
    new Date(w.date).setHours(0, 0, 0, 0) === waterDate
  );
  const previousDayWeather = weatherData.find(w => 
    new Date(w.date).setHours(0, 0, 0, 0) === waterDate - 86400000
  );

  let efficiencyScore = 100;

  if (dayWeather?.weather.toLowerCase().includes('rain')) {
    efficiencyScore *= 0.5; // 50% penalty for watering during rain
  }

  if (previousDayWeather?.weather.toLowerCase().includes('rain')) {
    efficiencyScore *= 0.7; // 30% penalty for watering after rain
  }

  if (dayWeather?.temp) {
    if (dayWeather.temp > 30) { // Hot day
      efficiencyScore *= 0.9; // 10% penalty for evaporation
    } else if (dayWeather.temp < 10) { // Cold day
      efficiencyScore *= 0.95; // 5% penalty for slower absorption
    }
  }

  return efficiencyScore;
};

// Add new calculation functions
const calculateSoilQualityScore = (farm: Farm): number => {
  let score = 70; // Base score

  // Organic matter content
  if (farm.organicMatter) {
    score += farm.organicMatter * 5; // +5 points per % of organic matter
  }

  // pH balance (ideal range 6.0-7.0)
  if (farm.soilPH) {
    const idealPH = 6.5;
    const phDifference = Math.abs(farm.soilPH - idealPH);
    score -= phDifference * 5; // -5 points per pH unit difference from ideal
  }

  // Crop rotation
  if (farm.rotationHistory && farm.rotationHistory.length) {
    score += Math.min(15, farm.rotationHistory.length * 5); // Up to +15 for rotation
  }

  return Math.max(0, Math.min(100, score));
};

const calculateOrganicScore = (farm: Farm): number => {
  let score = 70; // Base score
  
  // Analyze fertilizer types and amounts
  const totalFertilizerAmount = farm.fertilizerHistory.reduce((sum, f) => sum + f.amount, 0);
  const organicFertilizers = farm.fertilizerHistory.filter(f => 
    f.type?.toLowerCase().includes('organic') || 
    f.type?.toLowerCase().includes('manure') ||
    f.type?.toLowerCase().includes('compost')
  );
  
  const organicFertilizerAmount = organicFertilizers.reduce((sum, f) => sum + f.amount, 0);
  
  if (totalFertilizerAmount > 0) {
    // Calculate percentage of organic fertilizer use
    const organicPercentage = organicFertilizerAmount / totalFertilizerAmount;
    
    // Adjust score based on organic percentage
    score += (organicPercentage * 20); // Up to +20 points for 100% organic fertilizer use
    
    // Penalty for heavy chemical fertilizer use
    const chemicalFertilizerAmount = totalFertilizerAmount - organicFertilizerAmount;
    if (chemicalFertilizerAmount > 0) {
      // Penalty increases with amount of chemical fertilizer
      const chemicalPenalty = Math.min(30, (chemicalFertilizerAmount / 1000) * 10);
      score -= chemicalPenalty;
    }
  }
  
  // Consider crop rotation if available
  if (farm.rotationHistory && farm.rotationHistory.length) {
    score += Math.min(10, farm.rotationHistory.length * 2);
  }

  // Add bonus for consistent organic practices
  const consecutiveOrganicFertilizers = organicFertilizers.length;
  if (consecutiveOrganicFertilizers >= 3) {
    score += 10; // Bonus for consistent organic practices
  }

  return Math.min(100, Math.max(0, score));
};

const calculateHarvestEfficiency = (farm: Farm, weatherData: WeatherData[]): number => {
  if (!farm.harvestHistory.length) return 0;

  let score = 100;
  
  // Remove unused harvestsPerYear calculation or use it in scoring
  // Optionally, you could use it like this:
  // const harvestsPerYear = farm.harvestHistory.length / 
  //   (new Set(farm.harvestHistory.map(h => new Date(h.date).getFullYear())).size || 1);
  // score += harvestsPerYear * 5; // Bonus for multiple harvests per year
  
  // Analyze yield consistency
  const yields = farm.harvestHistory.map(h => h.amount);
  const avgYield = yields.reduce((a, b) => a + b, 0) / yields.length;
  const yieldVariation = Math.sqrt(
    yields.reduce((acc, y) => acc + Math.pow(y - avgYield, 2), 0) / yields.length
  ) / avgYield;

  // Penalize for high yield variation
  score -= yieldVariation * 20;

  // Consider weather impact
  farm.harvestHistory.forEach(harvest => {
    const harvestDate = new Date(harvest.date);
    const weatherOnDay = weatherData.find(w => 
      new Date(w.date).toDateString() === harvestDate.toDateString()
    );
    
    if (weatherOnDay?.weather.toLowerCase().includes('rain')) {
      score -= 5; // Penalty for harvesting in rain
    }
  });

  return Math.min(100, Math.max(0, score));
};

interface MetricsAccumulator {
  [key: string]: number;
}

// Update the calculateSustainabilityMetrics function
const calculateSustainabilityMetrics = (
  farms: Farm[],
  weatherData: WeatherData[]
): SustainabilityMetrics | null => {
  if (farms.length === 0 || weatherData.length === 0) return null;

  const farmMetrics = farms.map(farm => ({
    waterEfficiency: calculateWaterEfficiency(farm.waterHistory, weatherData),
    organicScore: calculateOrganicScore(farm),
    harvestEfficiency: calculateHarvestEfficiency(farm, weatherData),
    soilQualityScore: calculateSoilQualityScore(farm),
    rotationScore: calculateRotationScore(farm),
  }));

  // Initialize accumulator with zeros
  const avgMetrics: MetricsAccumulator = {
    waterEfficiency: 0,
    organicScore: 0,
    harvestEfficiency: 0,
    soilQualityScore: 0,
    rotationScore: 0
  };
  
  // Track how many farms have each metric
  const metricCounts: MetricsAccumulator = {
    waterEfficiency: 0,
    organicScore: 0,
    harvestEfficiency: 0,
    soilQualityScore: 0,
    rotationScore: 0
  };

  // Sum up all valid metrics (non-zero values)
  farmMetrics.forEach(metrics => {
    Object.keys(metrics).forEach(key => {
      const typedKey = key as keyof typeof metrics;
      const value = metrics[typedKey];
      if (value > 0) {
        avgMetrics[key] = (avgMetrics[key] || 0) + value;
        metricCounts[key]++;
      }
    });
  });

  // Calculate averages only for metrics that have values
  const weights: MetricsAccumulator = {
    waterEfficiency: 0.25,
    organicScore: 0.20,
    harvestEfficiency: 0.20,
    soilQualityScore: 0.20,
    rotationScore: 0.15,
  };

  let totalWeight = 0;
  let overallScore = 0;

  // Calculate for metrics that have values
  Object.keys(avgMetrics).forEach(key => {
    if (metricCounts[key] > 0) {
      avgMetrics[key] /= metricCounts[key];
      overallScore += avgMetrics[key] * weights[key];
      totalWeight += weights[key];
    } else {
      // Set metrics with no data to null or zero, so they don't affect the score
      avgMetrics[key] = 0;
    }
  });

  // Adjust the overall score if we're not using all metrics
  if (totalWeight > 0 && totalWeight < 1) {
    overallScore = overallScore / totalWeight;
  }

  return {
    overallScore: Math.round(overallScore),
    waterEfficiency: Math.round(avgMetrics.waterEfficiency),
    organicScore: Math.round(avgMetrics.organicScore),
    harvestEfficiency: Math.round(avgMetrics.harvestEfficiency),
    soilQualityScore: Math.round(avgMetrics.soilQualityScore),
    rotationScore: Math.round(avgMetrics.rotationScore),
  };
};

// Add calculateRotationScore function
const calculateRotationScore = (farm: Farm): number => {
  if (!farm.rotationHistory?.length) return 0;
  
  let score = Math.min(100, farm.rotationHistory.length * 20); // 20 points per rotation, max 100
  
  // Check for variety in crops
  const uniqueCrops = new Set(farm.rotationHistory.map(r => r.crop)).size;
  score += Math.min(20, uniqueCrops * 5); // 5 points per unique crop, max 20 bonus
  
  return Math.min(100, score);
};

// Removed unused Navigation component

const getWeatherInfo = (code: number) => {
  switch (true) {
    case code <= 3: return { desc: 'Clear', icon: '☀️' };
    case code <= 48: return { desc: 'Cloudy', icon: '☁️' };
    case code <= 67: return { desc: 'Rain', icon: '🌧️' };
    case code <= 77: return { desc: 'Snow', icon: '❄️' };
    default: return { desc: 'Unknown', icon: '❓' };
  }
};

interface ExportData {
  version: string;
  exportDate: string;
  farms: Farm[];
  tasks: Task[];
  issues: Issue[];
  cropPlanEvents: CropPlanEvent[];
  financialData?: FinancialEntry[]; // Make this optional for backward compatibility
}

const DefaultComponent: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>(() => {
    const savedFarms = localStorage.getItem('farms');
    return savedFarms ? JSON.parse(savedFarms) : [];
  });

  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isAddingFarm, setIsAddingFarm] = useState(false);
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [newFarm, setNewFarm] = useState({ 
    name: '', 
    size: '', 
    crop: '',
    rotationHistory: [] as { crop: string; startDate: string; endDate: string }[]
  });
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [newWaterUsage, setNewWaterUsage] = useState({ farmId: '', amount: '', date: '' });
  const [isAddingWaterUsage, setIsAddingWaterUsage] = useState(false);
  const [isEditingWaterUsage, setIsEditingWaterUsage] = useState(false);
  const [editingWaterUsage, setEditingWaterUsage] = useState<WaterUsage | null>(null);
  const [isAddingFertilizer, setIsAddingFertilizer] = useState(false);
  const [isEditingFertilizer, setIsEditingFertilizer] = useState(false);
  const [editingFertilizer, setEditingFertilizer] = useState<any | null>(null);
  const [isAddingHarvest, setIsAddingHarvest] = useState(false);
  const [isEditingHarvest, setIsEditingHarvest] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<any | null>(null);
  const [newFertilizer, setNewFertilizer] = useState({ farmId: '', type: '', amount: '', date: '' });
  const [newHarvest, setNewHarvest] = useState({ farmId: '', amount: '', date: '' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null);
  const [cropPlanEvents, setCropPlanEvents] = useState<CropPlanEvent[]>(() => {
    const savedEvents = localStorage.getItem('cropPlanEvents');
    return savedEvents ? JSON.parse(savedEvents, (key, value) => {
      if (key === 'start' || key === 'end') return new Date(value);
      return value;
    }) : [];
  });

  const [showWalkthrough, setShowWalkthrough] = useState(() => {
    return !localStorage.getItem('walkthroughCompleted');
  });

  const [isAddingRotation, setIsAddingRotation] = useState(false);
  const [newRotation, setNewRotation] = useState({
    farmId: '',
    crop: '',
    startDate: '',
    endDate: ''
  });

  const [cropFilter, setCropFilter] = useState<string>("all");

  const [importNotification, setImportNotification] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const getFilteredFarms = () => {
    if (cropFilter === "all") return farms;
    return farms.filter(farm => farm.crop === cropFilter);
  };

  const CropFilter = () => {
    const uniqueCrops = useMemo(() => {
      const crops = new Set(farms.map(farm => farm.crop));
      return ["all", ...Array.from(crops)];
    }, [farms]);

    return (
      <div className="flex items-center gap-2">
        <Label className="text-sm whitespace-nowrap">Filter:</Label>
        <select
          className="border rounded px-2 py-1 text-sm w-[120px]"
          value={cropFilter}
          onChange={(e) => setCropFilter(e.target.value)}
        >
          {uniqueCrops.map(crop => (
            <option key={crop} value={crop}>
              {crop === "all" ? "All Crops" : crop}
            </option>
          ))}
        </select>
      </div>
    );
  };

  useEffect(() => {
    localStorage.setItem('farms', JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
    fetchUserLocation();
  }, []);

  useEffect(() => {
    localStorage.setItem('cropPlanEvents', JSON.stringify(cropPlanEvents));
  }, [cropPlanEvents]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = walkthroughStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const { latitude, longitude } = data;
      fetchWeatherData(latitude, longitude);
    } catch (error) {
      console.error('Error fetching user location:', error);
    }
  };

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=10`
      );
      const data = await response.json();

      const formattedData = data.daily.time.map((date: string, index: number) => {
        const weatherInfo = getWeatherInfo(data.daily.weathercode[index]);
        return {
          date: new Date(date).toLocaleDateString(),
          temp: data.daily.temperature_2m_max[index],
          weather: weatherInfo.desc,
          icon: weatherInfo.icon
        };
      });

      setWeatherData(formattedData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData([]);
    }
  };

  const handleAddFarm = () => {
    setFarms([...farms, {
      id: farms.length + 1,
      name: newFarm.name,
      size: newFarm.size,
      crop: newFarm.crop,
      rotationHistory: newFarm.rotationHistory,
      waterHistory: [],
      fertilizerHistory: [],
      harvestHistory: []
    }]);
    setIsAddingFarm(false);
    setNewFarm({ 
      name: '', 
      size: '', 
      crop: '', 
      rotationHistory: [] 
    });
  };

  // Update handleEditFarm to include rotationHistory
  const handleEditFarm = () => {
    if (editingFarm) {
      const updatedFarms = farms.map(farm => 
        farm.id === editingFarm.id ? { ...editingFarm, ...newFarm } : farm
      );
      setFarms(updatedFarms);
      setIsEditingFarm(false);
      setEditingFarm(null);
      setNewFarm({ 
        name: '', 
        size: '', 
        crop: '', 
        rotationHistory: [] 
      });
    }
  };

  const handleDeleteFarm = (id: number) => {
    setConfirmDelete({ id, type: 'farm' });
  };

  const handleAddWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newWaterUsage.farmId)) {
        return {
          ...farm,
          waterHistory: [...farm.waterHistory, {
            amount: parseFloat(newWaterUsage.amount),
            date: newWaterUsage.date
          }]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setNewWaterUsage({ farmId: '', amount: '', date: '' });
  };

  const handleEditWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWaterUsage) {
      const updatedFarms = farms.map(farm => {
        if (farm.id === parseInt(newWaterUsage.farmId)) {
          return {
            ...farm,
            waterHistory: farm.waterHistory.map(usage =>
              usage.date === editingWaterUsage.date ? { ...usage, amount: parseFloat(newWaterUsage.amount), date: newWaterUsage.date } : usage
            )
          };
        }
        return farm;
      });
      setFarms(updatedFarms);
      setIsEditingWaterUsage(false);
      setEditingWaterUsage(null);
      setNewWaterUsage({ farmId: '', amount: '', date: '' });
    }
  };

  const handleAddFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newFertilizer.farmId)) {
        return {
          ...farm,
          fertilizerHistory: [...farm.fertilizerHistory, {
            type: newFertilizer.type,
            amount: parseFloat(newFertilizer.amount),
            date: newFertilizer.date
          }]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setNewFertilizer({ farmId: '', type: '', amount: '', date: '' });
  };

  const handleEditFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFertilizer) {
      const updatedFarms = farms.map(farm => {
        if (farm.id === parseInt(newFertilizer.farmId)) {
          return {
            ...farm,
            fertilizerHistory: farm.fertilizerHistory.map(fertilizer =>
              fertilizer.date === editingFertilizer.date ? { ...fertilizer, type: newFertilizer.type, amount: parseFloat(newFertilizer.amount), date: newFertilizer.date } : fertilizer
            )
          };
        }
        return farm;
      });
      setFarms(updatedFarms);
      setIsEditingFertilizer(false);
      setEditingFertilizer(null);
      setNewFertilizer({ farmId: '', type: '', amount: '', date: '' });
    }
  };

  const handleAddHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newHarvest.farmId)) {
        return {
          ...farm,
          harvestHistory: [...farm.harvestHistory, {
            amount: parseFloat(newHarvest.amount),
            date: newHarvest.date
          }]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setNewHarvest({ farmId: '', amount: '', date: '' });
  };

  const handleEditHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHarvest) {
      const updatedFarms = farms.map(farm => {
        if (farm.id === parseInt(newHarvest.farmId)) {
          return {
            ...farm,
            harvestHistory: farm.harvestHistory.map(harvest =>
              harvest.date === editingHarvest.date ? { ...harvest, amount: parseFloat(newHarvest.amount), date: newHarvest.date } : harvest
            )
          };
        }
        return farm;
      });
      setFarms(updatedFarms);
      setIsEditingHarvest(false);
      setEditingHarvest(null);
      setNewHarvest({ farmId: '', amount: '', date: '' });
    }
  };

  const handleResolveIssue = (id: number) => {
    setIssues(issues.filter(issue => issue.id !== id));
  };

  const handleDeleteTask = (id: number) => {
    setConfirmDelete({ id, type: 'task' });
  };

  const handleAddRotation = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newRotation.farmId)) {
        return {
          ...farm,
          rotationHistory: [
            ...(farm.rotationHistory || []),
            {
              crop: newRotation.crop,
              startDate: newRotation.startDate,
              endDate: newRotation.endDate
            }
          ]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setIsAddingRotation(false);
    setNewRotation({ farmId: '', crop: '', startDate: '', endDate: '' });
  };

  const confirmDeleteAction = () => {
    if (confirmDelete) {
      switch (confirmDelete.type) {
        case 'farm':
          setFarms(farms.filter(farm => farm.id !== confirmDelete.id));
          break;
        case 'waterUsage':
          setFarms(farms.map(farm => {
            if (farm.id === confirmDelete.id) {
              return {
                ...farm,
                waterHistory: farm.waterHistory.filter(usage => 
                  new Date(usage.date).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return farm;
          }));
          break;
        case 'fertilizer':
          setFarms(farms.map(farm => {
            if (farm.id === confirmDelete.id) {
              return {
                ...farm,
                fertilizerHistory: farm.fertilizerHistory.filter(fertilizer => 
                  new Date(fertilizer.date).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return farm;
          }));
          break;
        case 'harvest':
          setFarms(farms.map(farm => {
            if (farm.id === confirmDelete.id) {
              return {
                ...farm,
                harvestHistory: farm.harvestHistory.filter(harvest => 
                  new Date(harvest.date).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return farm;
          }));
          break;
        case 'rotation':
          setFarms(farms.map(farm => {
            if (farm.id === confirmDelete.id) {
              return {
                ...farm,
                rotationHistory: (farm.rotationHistory || []).filter(rotation => 
                  new Date(rotation.startDate).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return farm;
          }));
          break;
        case 'task':
          setTasks(tasks.filter(task => task.id !== confirmDelete.id));
          break;
        case 'cropEvent':
          setCropPlanEvents(prev => prev.filter(event => event.id !== confirmDelete.eventId));
          break;
        default:
          break;
      }
      setConfirmDelete(null);
    }
  };

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    localStorage.setItem('walkthroughCompleted', 'true');
  };

  const handleStartWalkthrough = () => {
    setShowWalkthrough(true);
    localStorage.removeItem('walkthroughCompleted');
    setActiveTab('overview'); // Switch to overview tab when starting walkthrough
  };

  const handleExportData = () => {
    const exportData: ExportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      farms,
      tasks,
      issues,
      cropPlanEvents,
      financialData // Add financial data to the export
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as ExportData;
        
        // Validate the imported data structure
        if (!importedData.version || !importedData.exportDate) {
          throw new Error('Invalid file format');
        }
  
        // Process the cropPlanEvents to properly convert date strings to Date objects
        const processedEvents = importedData.cropPlanEvents.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
  
        // Update all state
        setFarms(importedData.farms || []);
        setTasks(importedData.tasks || []);
        setIssues(importedData.issues || []);
        setCropPlanEvents(processedEvents || []);
  
        // Also import financial data if present
        if (Array.isArray(importedData.financialData)) {
          setFinancialData(importedData.financialData);
        }
  
        setImportNotification({
          success: true,
          message: 'Data imported successfully'
        });
        
        // Reset the file input so the same file can be selected again if needed
        event.target.value = '';
      } catch (error) {
        console.error("Import error:", error);
        setImportNotification({
          success: false,
          message: 'Error importing file: Invalid format or corrupted data'
        });
        
        // Reset the file input
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const TaskManager = () => {
    const [taskInput, setTaskInput] = useState({ title: '', dueDate: '', priority: 'medium' });

    const handleTaskSubmit = () => {
      setTasks([...tasks, { ...taskInput, id: Date.now(), completed: false }]);
      setTaskInput({ title: '', dueDate: '', priority: 'medium' });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Farm Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                name="title"
                placeholder="New task"
                value={taskInput.title}
                onChange={(e) => setTaskInput(prev => ({ ...prev, title: e.target.value }))}
                className="border rounded px-2 py-1"
              />
              <Input 
                name="dueDate"
                type="date"
                value={taskInput.dueDate}
                onChange={(e) => setTaskInput(prev => ({ ...prev, dueDate: e.target.value }))}
                className="border rounded px-2 py-1"
              />
              <Button onClick={handleTaskSubmit}>Add</Button>
            </div>
            <div className="space-y-2">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className={task.completed ? 'line-through' : ''}>
                    {task.title}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-500">{task.dueDate}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setTasks(tasks.map(t => 
                          t.id === task.id ? {...t, completed: !t.completed} : t
                        ));
                      }}
                    >
                      {task.completed ? 'Undo' : 'Complete'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const IssueTracker = () => {
    const [issueInput, setIssueInput] = useState({ type: '', description: '', severity: 'low' });

    const handleIssueSubmit = () => {
      setIssues([...issues, { ...issueInput, id: Date.now(), status: 'open', dateReported: new Date() }]);
      setIssueInput({ type: '', description: '', severity: 'low' });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Farm Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Input 
                name="type"
                placeholder="Issue type (pest, disease, etc.)"
                value={issueInput.type}
                onChange={(e) => setIssueInput(prev => ({ ...prev, type: e.target.value }))}
                className="border rounded px-2 py-1"
              />
              <select 
                data-walkthrough="issue-severity"
                name="severity"
                className="w-full p-2 border rounded"
                value={issueInput.severity}
                onChange={(e) => setIssueInput(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="low">Low Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="high">High Severity</option>
              </select>
            </div>
            <Input 
              name="description"
              placeholder="Description"
              value={issueInput.description}
              onChange={(e) => setIssueInput(prev => ({ ...prev, description: e.target.value }))}
              className="border rounded px-2 py-1"
            />
            <Button onClick={handleIssueSubmit} className="w-full">Report Issue</Button>
            
            <div className="space-y-2">
              {issues.map(issue => (
                <Alert key={issue.id} variant={issue.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between">
                      <span className="font-bold">{issue.type}</span>
                      <span className="text-sm">{issue.severity} severity</span>
                    </div>
                    <p className="text-sm">{issue.description}</p>
                    <div className="flex justify-end">
                      {issue.status === 'open' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleResolveIssue(issue.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const sustainabilityMetrics = useMemo(() => calculateSustainabilityMetrics(getFilteredFarms(), weatherData), [farms, weatherData, cropFilter]);

  // Update the SustainabilityScoreCard component to show only the metrics we have
  const SustainabilityScoreCard = () => (
    <Card data-walkthrough="sustainability">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Sustainability Score</span>
          <CropFilter />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-6xl font-bold mb-4" style={{
            color: sustainabilityMetrics?.overallScore! >= 80 ? '#16a34a' : 
                   sustainabilityMetrics?.overallScore! >= 60 ? '#ca8a04' : '#dc2626'
          }}>
            {sustainabilityMetrics ? sustainabilityMetrics.overallScore : '-'}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Water Efficiency</p>
              <p className="font-medium text-blue-600">
                {sustainabilityMetrics ? `${sustainabilityMetrics.waterEfficiency}%` : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Organic Practices</p>
              <p className="font-medium text-green-600">
                {sustainabilityMetrics ? `${sustainabilityMetrics.organicScore}%` : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Harvest Efficiency</p>
              <p className="font-medium text-yellow-600">
                {sustainabilityMetrics ? `${sustainabilityMetrics.harvestEfficiency}%` : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Soil Quality</p>
              <p className="font-medium text-brown-600">
                {sustainabilityMetrics ? `${sustainabilityMetrics.soilQualityScore}%` : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Crop Rotation</p>
              <p className="font-medium text-orange-600">
                {sustainabilityMetrics ? `${sustainabilityMetrics.rotationScore}%` : '-'}
              </p>
            </div>
          </div>
          {/* Update recommendations based on new metrics */}
          {sustainabilityMetrics && (
            <div className="mt-4 text-sm text-gray-500">
              <p className="mb-2">Recommendations:</p>
              <ul className="text-left list-disc pl-4 space-y-1">
                {sustainabilityMetrics.waterEfficiency < 80 && (
                  <li>Consider implementing drip irrigation to improve water efficiency</li>
                )}
                {sustainabilityMetrics.organicScore < 80 && (
                  <li>Explore organic fertilizer alternatives</li>
                )}
                {sustainabilityMetrics.harvestEfficiency < 80 && (
                  <li>Review crop density and soil health management</li>
                )}
                {sustainabilityMetrics.soilQualityScore < 80 && (
                  <li>Implement soil improvement measures</li>
                )}
                {sustainabilityMetrics.rotationScore < 80 && (
                  <li>Consider implementing more diverse crop rotations</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const WeatherPreview = () => (
    <Card>
      <CardHeader>
        <CardTitle>10-Day Weather Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {weatherData.length > 0 ? (
            weatherData.map((day, index) => (
              <div key={index} className="text-center p-2 border rounded">
                <p className="text-sm font-medium">{day.date}</p>
                <p className="text-2xl my-2">{day.icon}</p>
                <p className="text-sm text-gray-600">{day.weather}</p>
                <p className="text-lg font-bold">{Math.round(day.temp)}°F</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              Loading weather data...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Update the HistoryPage component to include rotations
  const HistoryPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('all');

    const allHistory = useMemo(() => {
      const history: AnyHistoryEntry[] = farms.flatMap(farm => [
        ...farm.waterHistory.map(usage => ({
          type: 'Water Usage' as const,
          date: new Date(usage.date),
          farm: farm.name,
          amount: `${usage.amount} gallons`,
          icon: <Droplet className="h-4 w-4 text-blue-500" />,
          color: 'blue',
          farmId: farm.id,
          usage
        })),
        ...farm.fertilizerHistory.map(fertilizer => ({
          type: 'Fertilizer Usage' as const,
          date: new Date(fertilizer.date),
          farm: farm.name,
          amount: `${fertilizer.amount} lbs`,
          icon: <Leaf className="h-4 w-4 text-green-500" />,
          color: 'green',
          farmId: farm.id,
          fertilizer
        })),
        ...farm.harvestHistory.map(harvest => ({
          type: 'Harvest' as const,
          date: new Date(harvest.date),
          farm: farm.name,
          amount: `${harvest.amount} bushels`,
          icon: <LayoutDashboard className="h-4 w-4 text-purple-500" />,
          color: 'purple',
          farmId: farm.id,
          harvest
        })),
        ...(farm.rotationHistory || []).map(rotation => ({
          type: 'Crop Rotation' as const,
          date: new Date(rotation.startDate),
          endDate: new Date(rotation.endDate),
          farm: farm.name,
          crop: rotation.crop,
          icon: <RotateCw className="h-4 w-4 text-orange-500" />,
          color: 'orange',
          farmId: farm.id,
          rotation
        }))
      ]);

      return history.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [farms]);

    const filteredHistory = useMemo(() => {
      if (!searchTerm) return allHistory;
      return allHistory.filter(entry => {
        switch (searchBy) {
          case 'farm':
            return entry.farm.toLowerCase().includes(searchTerm.toLowerCase());
          case 'type':
            return entry.type.toLowerCase().includes(searchTerm.toLowerCase());
          case 'amount':
            return entry.amount?.toLowerCase().includes(searchTerm.toLowerCase());
          case 'date':
            return entry.date.toLocaleDateString().includes(searchTerm);
          case 'crop':
            return entry.crop?.toLowerCase().includes(searchTerm.toLowerCase());
          default:
            return (
              entry.farm.toLowerCase().includes(searchTerm.toLowerCase()) ||
              entry.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (entry.amount && entry.amount.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (entry.crop && entry.crop.toLowerCase().includes(searchTerm.toLowerCase())) ||
              entry.date.toLocaleDateString().includes(searchTerm)
            );
        }
      });
    }, [searchTerm, searchBy, allHistory]);

    const handleEditHistory = (entry: any) => {
      switch (entry.type) {
        case 'Water Usage':
          setEditingWaterUsage(entry.usage);
          setNewWaterUsage({ farmId: entry.farmId.toString(), amount: entry.usage.amount.toString(), date: entry.usage.date });
          setIsEditingWaterUsage(true);
          setIsAddingWaterUsage(true);
          break;
        case 'Fertilizer Usage':
          setEditingFertilizer(entry.fertilizer);
          setNewFertilizer({ farmId: entry.farmId.toString(), type: entry.fertilizer.type, amount: entry.fertilizer.amount.toString(), date: entry.fertilizer.date });
          setIsEditingFertilizer(true);
          setIsAddingFertilizer(true);
          break;
        case 'Harvest':
          setEditingHarvest(entry.harvest);
          setNewHarvest({ farmId: entry.farmId.toString(), amount: entry.harvest.amount.toString(), date: entry.harvest.date });
          setIsEditingHarvest(true);
          setIsAddingHarvest(true);
          break;
        case 'Crop Rotation':
          setNewRotation({
            farmId: entry.farmId.toString(),
            crop: entry.rotation.crop,
            startDate: new Date(entry.rotation.startDate).toISOString().split('T')[0],
            endDate: new Date(entry.rotation.endDate).toISOString().split('T')[0]
          });
          setIsAddingRotation(true);
          break;
        default:
          break;
      }
    };

    const handleDeleteHistory = (entry: any) => {
      switch (entry.type) {
        case 'Water Usage':
          setConfirmDelete({ id: entry.farmId, type: 'waterUsage', date: entry.usage.date });
          break;
        case 'Fertilizer Usage':
          setConfirmDelete({ id: entry.farmId, type: 'fertilizer', date: entry.fertilizer.date });
          break;
        case 'Harvest':
          setConfirmDelete({ id: entry.farmId, type: 'harvest', date: entry.harvest.date });
          break;
        case 'Crop Rotation':
          setConfirmDelete({ 
            id: entry.farmId, 
            type: 'rotation', 
            date: entry.rotation.startDate 
          });
          break;
        default:
          break;
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4 border rounded px-2 py-1"
              />
              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="border rounded px-2 py-1 mb-4 h-[38px]" // Match the height of the search bar
              >
                <option value="all">All</option>
                <option value="farm">Farm</option>
                <option value="type">Type</option>
                <option value="amount">Amount</option>
                <option value="date">Date</option>
                <option value="crop">Crop</option>
              </select>
            </div>
            {filteredHistory.map((entry, index) => (
              <div key={index} className={`p-2 border-l-4 ${
                entry.type === 'Crop Rotation' ? 'border-orange-500' : `border-${entry.color}-500`
              } rounded`}>
                <div className="flex items-center gap-2">
                  {entry.icon}
                  <p><strong>{entry.type}</strong></p>
                </div>
                <p><strong>Farm:</strong> {entry.farm}</p>
                <p><strong>Date:</strong> {entry.date.toLocaleDateString()}</p>
                {entry.type === 'Crop Rotation' ? (
                  <>
                    <p><strong>Crop:</strong> {entry.crop}</p>
                    <p><strong>End Date:</strong> {entry.endDate?.toLocaleDateString()}</p>
                  </>
                ) : (
                  <p><strong>Amount:</strong> {entry.amount}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditHistory(entry)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteHistory(entry)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Dialogs for editing entries */}
                {entry.type === 'Water Usage' && (
                  <Dialog 
                    open={isEditingWaterUsage} 
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsEditingWaterUsage(false);
                        setEditingWaterUsage(null);
                        setNewWaterUsage({ farmId: '', amount: '', date: '' });
                      }
                    }}
                  >
                    <DialogContent onClick={(e) => e.stopPropagation()}>
                      <DialogHeader>
                        <DialogTitle>Edit Water Usage</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditWaterUsage} className="space-y-4">
                        <div>
                          <Label>Farm</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={newWaterUsage.farmId}
                            onChange={(e) => setNewWaterUsage({...newWaterUsage, farmId: e.target.value})}
                            required
                          >
                            <option value="">Select Farm</option>
                            {farms.map(farm => (
                              <option key={farm.id} value={farm.id}>{farm.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Amount (gallons)</Label>
                          <Input 
                            type="number"
                            value={newWaterUsage.amount}
                            onChange={(e) => setNewWaterUsage({...newWaterUsage, amount: e.target.value})}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input 
                            type="date"
                            value={newWaterUsage.date}
                            onChange={(e) => setNewWaterUsage({...newWaterUsage, date: e.target.value})}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <Button type="submit" className="w-full">Save Water Usage</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {entry.type === 'Fertilizer Usage' && (
                  <Dialog 
                    open={isEditingFertilizer} 
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsEditingFertilizer(false);
                        setEditingFertilizer(null);
                        setNewFertilizer({ farmId: '', type: '', amount: '', date: '' });
                      }
                    }}
                  >
                    <DialogContent onClick={(e) => e.stopPropagation()}>
                      <DialogHeader>
                        <DialogTitle>Edit Fertilizer Usage</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditFertilizer} className="space-y-4">
                        <div>
                          <Label>Farm</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={newFertilizer.farmId}
                            onChange={(e) => setNewFertilizer({...newFertilizer, farmId: e.target.value})}
                            required
                          >
                            <option value="">Select Farm</option>
                            {farms.map(farm => (
                              <option key={farm.id} value={farm.id}>{farm.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Input 
                            value={newFertilizer.type}
                            onChange={(e) => setNewFertilizer({...newFertilizer, type: e.target.value})}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>Amount (lbs)</Label>
                          <Input 
                            type="number"
                            value={newFertilizer.amount}
                            onChange={(e) => setNewFertilizer({...newFertilizer, amount: e.target.value})}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input 
                            type="date"
                            value={newFertilizer.date}
                            onChange={(e) => setNewFertilizer({...newFertilizer, date: e.target.value})}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <Button type="submit" className="w-full">Save Fertilizer Usage</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {entry.type === 'Harvest' && (
                  <Dialog 
                    open={isEditingHarvest} 
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsEditingHarvest(false);
                        setEditingHarvest(null);
                        setNewHarvest({ farmId: '', amount: '', date: '' });
                      }
                    }}
                  >
                    <DialogContent onClick={(e) => e.stopPropagation()}>
                      <DialogHeader>
                        <DialogTitle>Edit Harvest</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditHarvest} className="space-y-4">
                        <div>
                          <Label>Farm</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={newHarvest.farmId}
                            onChange={(e) => setNewHarvest({...newHarvest, farmId: e.target.value})}
                            required
                          >
                            <option value="">Select Farm</option>
                            {farms.map(farm => (
                              <option key={farm.id} value={farm.id}>{farm.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Amount (bushels)</Label>
                          <Input 
                            type="number"
                            value={newHarvest.amount}
                            onChange={(e) => setNewHarvest({...newHarvest, amount: e.target.value})}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input 
                            type="date"
                            value={newHarvest.date}
                            onChange={(e) => setNewHarvest({...newHarvest, date: e.target.value})}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <Button type="submit" className="w-full">Save Harvest</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {entry.type === 'Crop Rotation' && (
                  <Dialog 
                    open={isAddingRotation} 
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsAddingRotation(false);
                        setNewRotation({ farmId: '', crop: '', startDate: '', endDate: '' });
                      }
                    }}
                  >
                    <DialogContent onClick={(e) => e.stopPropagation()}>
                      <DialogHeader>
                        <DialogTitle>Edit Crop Rotation</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddRotation} className="space-y-4">
                        <div>
                          <Label>Farm</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={newRotation.farmId}
                            onChange={(e) => setNewRotation({...newRotation, farmId: e.target.value})}
                            required
                          >
                            <option value="">Select Farm</option>
                            {farms.map(farm => (
                              <option key={farm.id} value={farm.id}>{farm.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Crop</Label>
                          <Input 
                            value={newRotation.crop}
                            onChange={(e) => setNewRotation({...newRotation, crop: e.target.value})}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input 
                            type="date"
                            value={newRotation.startDate}
                            onChange={(e) => setNewRotation({...newRotation, startDate: e.target.value})}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input 
                            type="date"
                            value={newRotation.endDate}
                            onChange={(e) => setNewRotation({...newRotation, endDate: e.target.value})}
                            required
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        <Button type="submit" className="w-full">Save Crop Rotation</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const Instructions = ({ onStartWalkthrough }: { onStartWalkthrough: () => void }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Instructions & Help
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Button 
            onClick={onStartWalkthrough}
            variant="outline" 
            className="w-full mb-6"
          >
            Start Interactive Walkthrough
          </Button>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </h2>
            <div className="mt-2 space-y-2 text-gray-600">
              <p>The Overview tab is your main dashboard where you can:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use Quick Actions to record water usage, fertilizer applications, and harvests</li>
                <li>View your farm's sustainability score and detailed metrics</li>
                <li>Check the 10-day weather forecast</li>
                <li>See upcoming planned activities</li>
                <li>Monitor active farm issues</li>
                <li>Manage daily tasks</li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              Water Management
            </h2>
            <div className="mt-2 space-y-2 text-gray-600">
              <p>Track and analyze your water usage:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>View historical water usage data in graph form</li>
                <li>Monitor water efficiency scores</li>
                <li>Track irrigation patterns across different farms</li>
                <li>Record new water applications through Quick Actions</li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Crops & Farms
            </h2>
            <div className="mt-2 space-y-2 text-gray-600">
              <p>Manage your farms and crops:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Add new farms with detailed information</li>
                <li>Track crop rotations and farm history</li>
                <li>Monitor harvest records</li>
                <li>View fertilizer applications</li>
                <li>Edit or delete existing farms</li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Farm Issues
            </h2>
            <div className="mt-2 space-y-2 text-gray-600">
              <p>Track and manage farm problems:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Report new issues with severity levels</li>
                <li>Track the status of ongoing problems</li>
                <li>Mark issues as resolved</li>
                <li>Keep a history of past problems</li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Info className="h-4 w-4" />
              Reports & Analytics
            </h2>
            <div className="mt-2 space-y-2 text-gray-600">
              <p>Get detailed insights about your farm's performance:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Generate comprehensive sustainability reports</li>
                <li>Export sustainability reports as PDFs</li>
                <li>Track financial performance with charts and breakdowns</li>
                <li>Calculate ROI for farm investments</li>
                <li>Monitor key metrics like water usage, harvest yields, and chemical reduction</li>
                <li>Get personalized recommendations to improve sustainability</li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Crop Planning
            </h2>
            <div className="mt-2 space-y-2 text-gray-600">
              <p>Plan and schedule your farming activities:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create detailed crop plans with the calendar</li>
                <li>Schedule plantings, harvests, and other activities</li>
                <li>Export and import crop plans</li>
                <li>View upcoming events for the next two weeks</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-blue-700">Sustainability Scoring</h2>
            <p className="text-sm text-blue-600 mb-2">The system calculates your sustainability score based on:</p>
            <ul className="space-y-1 text-blue-600 text-sm">
              <li>• <strong>Water Efficiency</strong>: Based on water usage patterns, irrigation consistency, and crop-specific needs</li>
              <li>• <strong>Organic Practices</strong>: Calculated from your organic vs. chemical fertilizer ratio</li>
              <li>• <strong>Harvest Efficiency</strong>: Measures yield consistency and timing optimization</li>
              <li>• <strong>Soil Quality</strong>: Derived from soil pH, organic matter content, and management practices</li>
              <li>• <strong>Crop Rotation</strong>: Evaluates rotation frequency, diversity, and consistency</li>
            </ul>
            <p className="text-sm text-blue-600 mt-2">All metrics are calculated from your actual farm data - the more data you enter, the more accurate your score will be!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CropPlanCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [newEvent, setNewEvent] = useState({
      title: '',
      start: new Date(),
      end: new Date(),
      farmId: 0,
      type: 'planting',
      notes: ''
    });
    const daysInMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    ).getDay();
    const handleAddEvent = (e: React.FormEvent) => {
      e.preventDefault();
      setCropPlanEvents([...cropPlanEvents, {
        id: Date.now(),
        ...newEvent,
        type: newEvent.type as 'planting' | 'fertilizing' | 'harvesting' | 'other'
      }]);
      setIsAddingEvent(false);
      setNewEvent({
        title: '',
        start: new Date(),
        end: new Date(),
        farmId: 0,
        type: 'planting',
        notes: ''
      });
    };
    const getEventsForDay = (date: Date) => {
      return cropPlanEvents.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.getDate() === date.getDate() &&
               eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
      });
    };
    const eventColors = {
      planting: 'bg-blue-100 text-blue-800',
      fertilizing: 'bg-green-100 text-green-800',
      harvesting: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    const handleExportPlan = () => {
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        events: cropPlanEvents
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crop-plan-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    const handleImportPlan = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          // Validate the imported data
          if (!importedData.events || !Array.isArray(importedData.events)) {
            throw new Error('Invalid file format');
          }
          // Convert date strings back to Date objects
          const processedEvents = importedData.events.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          }));
          // Merge with existing events, avoid duplicates by checking IDs
          const existingIds = new Set(cropPlanEvents.map(e => e.id));
          const newEvents = processedEvents.filter((e: CropPlanEvent) => !existingIds.has(e.id));
          setCropPlanEvents([...cropPlanEvents, ...newEvents]);
        } catch (error) {
          alert('Error importing file: Invalid format');
        }
      };
      reader.readAsText(file);
    };
    const handleDeleteEvent = (eventId: number) => {
      setConfirmDelete({ id: 0, type: 'cropEvent', eventId });
    };
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Crop Planning Calendar</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
              >
                Next
              </Button>
              <div className="space-x-2">
                <Button onClick={() => setIsAddingEvent(true)}>Add Event</Button>
                <Button variant="outline" onClick={handleExportPlan}>
                  Export
                </Button>
                <div className="relative inline-block">
                  <Button variant="outline" onClick={() => document.getElementById('importFile')?.click()}>
                    Import
                  </Button>
                  <input
                    type="file"
                    id="importFile"
                    className="hidden"
                    accept=".json"
                    onChange={handleImportPlan}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-lg font-medium">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2 border min-h-[100px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), index + 1);
              const events = getEventsForDay(date);
              return (
                <div key={index} className="p-2 border min-h-[100px]">
                  <div className="font-medium">{index + 1}</div>
                  <div className="space-y-1">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className={`group relative p-1 rounded text-xs ${eventColors[event.type]}`}
                        title={`${event.title}\nFarm: ${farms.find(f => f.id === event.farmId)?.name}\n${event.notes}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate">{event.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Crop Plan Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                  className="border rounded px-2 py-1"
                />
              </div>
              <div>
                <Label>Farm</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={newEvent.farmId}
                  onChange={(e) => setNewEvent({ ...newEvent, farmId: Number(e.target.value) })}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Type</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  required
                >
                  <option value="planting">Planting</option>
                  <option value="fertilizing">Fertilizing</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newEvent.start.toISOString().split('T')[0]}
                  onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                  required
                  className="border rounded px-2 py-1"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newEvent.end.toISOString().split('T')[0]}
                  onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                  required
                  className="border rounded px-2 py-1"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  className="border rounded px-2 py-1"
                />
              </div>
              <Button type="submit" className="w-full">Add Event</Button>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    );
  };

  const UpcomingCropPlan = () => {
    const nextTwoWeeks = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const twoWeeksFromNow = new Date(today);
      twoWeeksFromNow.setDate(today.getDate() + 14);
      return cropPlanEvents
        .filter(event => {
          const eventDate = new Date(event.start);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today && eventDate <= twoWeeksFromNow;
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 5); // Show only next 5 events for cleaner UI
    }, [cropPlanEvents]);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upcoming Events</span>
            <span className="text-sm font-normal text-gray-500">Next 14 days</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {nextTwoWeeks.length > 0 ? (
              nextTwoWeeks.map(event => (
                <div
                  key={event.id} 
                  className={`p-2 rounded ${
                    event.type === 'planting' ? 'bg-blue-50 border-l-4 border-blue-500' :
                    event.type === 'fertilizing' ? 'bg-green-50 border-l-4 border-green-500' :
                    event.type === 'harvesting' ? 'bg-purple-50 border-l-4 border-purple-500' : 
                    'bg-gray-50 border-l-4 border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Farm: {farms.find(f => f.id === event.farmId)?.name}</span>
                        <span>•</span>
                        <span>{event.type}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(event.start).toLocaleDateString()}
                    </p>
                  </div>
                  {event.notes && (
                    <p className="mt-1 text-sm text-gray-500 italic">
                      {event.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No upcoming events in the next two weeks
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const FarmIssues = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Farm Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.length > 0 ? (
              issues.map(issue => (
                <div key={issue.id} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{issue.type}</h3>
                      <p className="text-sm text-gray-600">{issue.description}</p>
                    </div>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${
                        issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                        issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                   <div className="mt-2 text-sm text-gray-500">
                    <p>Reported: {new Date(issue.dateReported).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No active issues</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const [financialData, setFinancialData] = useState<FinancialEntry[]>(() => {
    const savedData = localStorage.getItem('financialData');
    return savedData ? JSON.parse(savedData) : [];
  });

  useEffect(() => {
    localStorage.setItem('financialData', JSON.stringify(financialData));
  }, [financialData]);

  const Reports = () => (
    <ReportsPage 
      farms={farms} 
      weatherData={weatherData} 
      cropFilter={cropFilter}
      financialData={financialData}
      setFinancialData={setFinancialData}
    />
  );

  return (
    <div>
      {showWalkthrough && <Walkthrough onComplete={handleWalkthroughComplete} setActiveTab={setActiveTab} />}
      <div className="p-6 max-w-7xl mx-auto bg-white">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Farm Management Dashboard</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleExportData}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export Data</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => document.getElementById('importDataFile')?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Import Data</span>
                  <input
                    type="file"
                    id="importDataFile"
                    className="hidden"
                    accept=".json"
                    onChange={handleImportData}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStartWalkthrough}>
                  <Info className="mr-2 h-4 w-4" />
                  <span>Start Tutorial</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Tabs defaultValue="overview" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList className="hidden md:flex">
                <TabsTrigger data-walkthrough="overview-tab" value="overview">Overview</TabsTrigger>
                <TabsTrigger data-walkthrough="water-tab" value="water">Water Management</TabsTrigger>
                <TabsTrigger data-walkthrough="farms-tab" value="farms">Farms</TabsTrigger>
                <TabsTrigger data-walkthrough="issues-tab" value="issues">Farm Issues</TabsTrigger>
                <TabsTrigger data-walkthrough="reports-tab" value="reports">Reports</TabsTrigger>
                <TabsTrigger data-walkthrough="financial-tab" value="financial">Financial Planning</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger data-walkthrough="crop-plan" value="cropplan">Crop Plan</TabsTrigger>
                <TabsTrigger value="instructions"><Info className="h-4 w-4 mr-2" />Instructions</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card data-walkthrough="quick-actions">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Dialog open={isAddingWaterUsage} onOpenChange={setIsAddingWaterUsage}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-blue-500 hover:bg-blue-600">
                            <Droplet className="h-4 w-4 mr-2" />
                            Record Water Usage
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Water Usage</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={isEditingWaterUsage ? handleEditWaterUsage : handleAddWaterUsage} className="space-y-4">
                            <div>
                              <Label>Farm</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newWaterUsage.farmId}
                                onChange={(e) => setNewWaterUsage({...newWaterUsage, farmId: e.target.value})}
                                required
                              >
                                <option value="">Select Farm</option>
                                {farms.map(farm => (
                                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label>Amount (gallons)</Label>
                              <Input 
                                type="number"
                                value={newWaterUsage.amount}
                                onChange={(e) => setNewWaterUsage({...newWaterUsage, amount: e.target.value})}
                                required
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <div>
                              <Label>Date</Label>
                              <Input 
                                type="date"
                                value={newWaterUsage.date}
                                onChange={(e) => setNewWaterUsage({...newWaterUsage, date: e.target.value})}
                                required
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <Button type="submit" className="w-full">Save Water Usage</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isAddingFertilizer} onOpenChange={setIsAddingFertilizer}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-green-500 hover:bg-green-600">
                            <Leaf className="h-4 w-4 mr-2" />
                            Record Fertilizer Application
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Fertilizer Application</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={isEditingFertilizer ? handleEditFertilizer : handleAddFertilizer} className="space-y-4">
                            <div>
                              <Label>Farm</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newFertilizer.farmId}
                                onChange={(e) => setNewFertilizer({...newFertilizer, farmId: e.target.value})}
                                required
                              >
                                <option value="">Select Farm</option>
                                {farms.map(farm => (
                                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label>Type</Label>
                              <Input 
                                value={newFertilizer.type}
                                onChange={(e) => setNewFertilizer({...newFertilizer, type: e.target.value})}
                                required
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <div>
                              <Label>Amount (lbs)</Label>
                              <Input 
                                type="number"
                                value={newFertilizer.amount}
                                onChange={(e) => setNewFertilizer({...newFertilizer, amount: e.target.value})}
                                required
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <div>
                              <Label>Date</Label>
                              <Input 
                                type="date"
                                value={newFertilizer.date}
                                onChange={(e) => setNewFertilizer({...newFertilizer, date: e.target.value})}
                                required
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <Button type="submit" className="w-full">Save Fertilizer Usage</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isAddingHarvest} onOpenChange={setIsAddingHarvest}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-purple-500 hover:bg-purple-600">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Record Harvest
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Harvest</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={isEditingHarvest ? handleEditHarvest : handleAddHarvest} className="space-y-4">
                            <div>
                              <Label>Farm</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newHarvest.farmId}
                                onChange={(e) => setNewHarvest({...newHarvest, farmId: e.target.value})}
                                required
                              >
                                <option value="">Select Farm</option>
                                {farms.map(farm => (
                                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label>Amount (bushels)</Label>
                              <Input 
                                type="number"
                                value={newHarvest.amount}
                                onChange={(e) => setNewHarvest({...newHarvest, amount: e.target.value})}
                                required
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <div>
                              <Label>Date</Label>
                              <Input 
                                type="date"
                                value={newHarvest.date}
                                onChange={(e) => setNewHarvest({...newHarvest, date: e.target.value})}
                                required
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <Button type="submit" className="w-full">Save Harvest</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isAddingRotation} onOpenChange={setIsAddingRotation}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-orange-500 hover:bg-orange-600">
                            <RotateCw className="h-4 w-4 mr-2" />
                            Record Crop Rotation
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Crop Rotation</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddRotation} className="space-y-4">
                            <div>
                              <Label>Farm</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newRotation.farmId}
                                onChange={(e) => setNewRotation({...newRotation, farmId: e.target.value})}
                                required
                              >
                                <option value="">Select Farm</option>
                                {farms.map(farm => (
                                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label>Crop</Label>
                              <Input 
                                value={newRotation.crop}
                                onChange={(e) => setNewRotation({...newRotation, crop: e.target.value})}
                                required
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input 
                                type="date"
                                value={newRotation.startDate}
                                onChange={(e) => setNewRotation({...newRotation, startDate: e.target.value})}
                                required
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input 
                                type="date"
                                value={newRotation.endDate}
                                onChange={(e) => setNewRotation({...newRotation, endDate: e.target.value})}
                                required
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <Button type="submit" className="w-full">Save Crop Rotation</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
                <SustainabilityScoreCard />
                <WeatherPreview />
                <UpcomingCropPlan />
                <FarmIssues />
                <TaskManager />
              </div>
            </TabsContent>
            <TabsContent value="issues">
              <IssueTracker />
            </TabsContent>
            <TabsContent value="water">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Water Usage Tracker</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {farms.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={farms.flatMap(farm => 
                            farm.waterHistory.map(usage => ({
                              farm: farm.name,
                              amount: usage.amount,
                              date: new Date(usage.date).toLocaleDateString()
                            }))
                          )}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill="#3b82f6" name="Water Usage (gal)" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No water usage data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="farms">
              <div className="space-y-4">
                <Button 
                  data-walkthrough="add-farm"
                  onClick={() => setIsAddingFarm(true)}
                  className="mb-4"
                >
                  Add New Farm
                </Button>
                <Dialog open={isAddingFarm} onOpenChange={setIsAddingFarm}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Farm</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddFarm} className="space-y-4">
                      <div>
                        <Label>Farm Name</Label>
                        <Input
                          value={newFarm.name}
                          onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <Label>Size (acres)</Label>
                        <Input
                          type="number"
                          value={newFarm.size}
                          onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <Label>Current Crop</Label>
                        <Input
                          value={newFarm.crop}
                          onChange={(e) => setNewFarm({ ...newFarm, crop: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <Label>Crop Rotation History</Label>
                        <div className="space-y-2">
                          {newFarm.rotationHistory.map((rotation, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <Input
                                placeholder="Crop"
                                value={rotation.crop}
                                onChange={(e) => {
                                  const updated = [...newFarm.rotationHistory];
                                  updated[index].crop = e.target.value;
                                  setNewFarm({ ...newFarm, rotationHistory: updated });
                                }}
                                className="border rounded px-2 py-1"
                              />
                              <Input
                                type="date"
                                value={rotation.startDate}
                                onChange={(e) => {
                                  const updated = [...newFarm.rotationHistory];
                                  updated[index].startDate = e.target.value;
                                  setNewFarm({ ...newFarm, rotationHistory: updated });
                                }}
                                className="border rounded px-2 py-1"
                              />
                              <Input
                                type="date"
                                value={rotation.endDate}
                                onChange={(e) => {
                                  const updated = [...newFarm.rotationHistory];
                                  updated[index].endDate = e.target.value;
                                  setNewFarm({ ...newFarm, rotationHistory: updated });
                                }}
                                className="border rounded px-2 py-1"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = newFarm.rotationHistory.filter((_, i) => i !== index);
                                  setNewFarm({ ...newFarm, rotationHistory: updated });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setNewFarm({
                                ...newFarm,
                                rotationHistory: [
                                  ...newFarm.rotationHistory,
                                  { crop: '', startDate: '', endDate: '' }
                                ]
                              });
                            }}
                          >
                            Add Rotation Entry
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        Add Farm
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog open={isEditingFarm} onOpenChange={setIsEditingFarm}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Farm</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditFarm} className="space-y-4">
                      <div>
                        <Label>Farm Name</Label>
                        <Input
                          value={newFarm.name}
                          onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <Label>Size (acres)</Label>
                        <Input
                          type="number"
                          value={newFarm.size}
                          onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <Label>Crop Type</Label>
                        <Input
                          value={newFarm.crop}
                          onChange={(e) => setNewFarm({ ...newFarm, crop: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Save Changes
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farms.length > 0 ? (
                    farms.map((farm) => (
                      <Card
                        key={farm.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle>{farm.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-gray-500">Current Crop: {farm.crop}</p>
                            <p className="text-gray-500">Size: {farm.size.toLocaleString()} acres</p>
                            {farm.rotationHistory && farm.rotationHistory.length > 0 && (
                              <div className="mt-4">
                                <p className="font-medium mb-2">Crop Rotation History</p>
                                <div className="space-y-1">
                                  {farm.rotationHistory.map((rotation, index) => (
                                    <div key={index} className="text-sm text-gray-600">
                                      {rotation.crop}: {new Date(rotation.startDate).toLocaleDateString()} - {new Date(rotation.endDate).toLocaleDateString()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Droplet className="h-4 w-4 text-blue-500" />
                                <span>
                                  Last watered:{" "}
                                  {farm.waterHistory.length > 0
                                    ? new Date(
                                        farm.waterHistory[farm.waterHistory.length - 1].date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Leaf className="h-4 w-4 text-green-500" />
                                <span>
                                  Last fertilized:{" "}
                                  {farm.fertilizerHistory.length > 0
                                    ? new Date(
                                        farm.fertilizerHistory[farm.fertilizerHistory.length - 1]
                                          .date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4 text-purple-500" />
                                <span>
                                  Last harvest:{" "}
                                  {farm.harvestHistory.length > 0
                                    ? new Date(
                                        farm.harvestHistory[farm.harvestHistory.length - 1].date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <RotateCw className="h-4 w-4 text-orange-500" />
                                <span>
                                  Last rotation:{" "}
                                  {farm.rotationHistory && farm.rotationHistory.length > 0
                                    ? `${farm.rotationHistory[farm.rotationHistory.length - 1].crop} (${
                                        new Date(farm.rotationHistory[farm.rotationHistory.length - 1].startDate).toLocaleDateString()
                                      })`
                                    : "Never"}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingFarm(farm);
                                  setNewFarm({ 
                                    name: farm.name, 
                                    size: farm.size, 
                                    crop: farm.crop, 
                                    rotationHistory: farm.rotationHistory || []
                                  });
                                  setIsEditingFarm(true);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteFarm(farm.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center p-8 border rounded-lg border-dashed">
                      <p className="text-gray-500">
                        No farms added yet. Click "Add New Farm" to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reports">
              <Reports />
            </TabsContent>
            <TabsContent value="instructions">
              <Instructions onStartWalkthrough={handleStartWalkthrough} />
            </TabsContent>
            <TabsContent value="history">
              <HistoryPage />
            </TabsContent>
            <TabsContent value="cropplan">
              <CropPlanCalendar />
            </TabsContent>
            <TabsContent value="financial">
              <FinancialPlanning 
                farms={farms}
                financialData={financialData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this {confirmDelete?.type}?</p>
            <Button onClick={confirmDeleteAction} className="w-full">Confirm</Button>
            <Button variant="outline" onClick={() => setConfirmDelete(null)} className="w-full">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!importNotification} 
        onOpenChange={() => setImportNotification(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {importNotification?.success ? 'Import Successful' : 'Import Failed'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{importNotification?.message}</p>
            <Button 
              variant="outline" 
              onClick={() => setImportNotification(null)} 
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add this type definition before the DefaultComponent
type AnyHistoryEntry = {
  type: 'Water Usage' | 'Fertilizer Usage' | 'Harvest' | 'Crop Rotation';
  date: Date;
  farm: string;
  amount?: string;
  icon: React.ReactNode;
  color: string;
  farmId: number;
  usage?: WaterUsage;
  fertilizer?: any;
  harvest?: any;
  rotation?: {
    crop: string;
    startDate: string;
    endDate: string;
  };
  crop?: string;
  endDate?: Date;
};

export default DefaultComponent;
