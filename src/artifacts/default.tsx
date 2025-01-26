import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Droplet, Leaf, LayoutDashboard, Info, AlertTriangle, Bug, Trash2, Menu, Edit3, RotateCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface WaterUsage {
  amount: number;
  date: string;
  efficiency?: number;  // Add efficiency score for each watering
}

// Update Field interface to include more data
interface Field {
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
  fieldId: number;
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
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    target: '[data-walkthrough="overview-tab"]',
    title: "Welcome to Farm Management!",
    content: "This is your main dashboard where you can monitor all aspects of your farm.",
    placement: 'bottom'
  },
  {
    target: '[data-walkthrough="add-field"]',
    title: "Add Your Fields",
    content: "Start by adding your fields. Click here to add information about your farm fields.",
    placement: 'right'
  },
  {
    target: '[data-walkthrough="quick-actions"]',
    title: "Quick Actions",
    content: "Use these buttons to quickly record water usage, fertilizer applications, and harvests.",
    placement: 'left'
  },
  {
    target: '[data-walkthrough="sustainability"]',
    title: "Sustainability Score",
    content: "Monitor your farm's sustainability metrics here. The score updates automatically based on your farming practices.",
    placement: 'left'
  },
  {
    target: '[data-walkthrough="crop-plan"]',
    title: "Plan Your Crops",
    content: "Use the crop planning calendar to schedule plantings, harvests, and other field activities.",
    placement: 'top'
  }
];

const Walkthrough: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = WALKTHROUGH_STEPS[currentStep];

  useEffect(() => {
    const target = document.querySelector(step.target);
    if (target) {
      // Smooth scroll with offset for mobile
      const yOffset = -100; 
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [currentStep, step.target]);

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
                <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                  Next
                </Button>
              ) : (
                <Button onClick={onComplete}>
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
const calculateSoilQualityScore = (field: Field): number => {
  let score = 70; // Base score

  // Organic matter content
  if (field.organicMatter) {
    score += field.organicMatter * 5; // +5 points per % of organic matter
  }

  // pH balance (ideal range 6.0-7.0)
  if (field.soilPH) {
    const idealPH = 6.5;
    const phDifference = Math.abs(field.soilPH - idealPH);
    score -= phDifference * 5; // -5 points per pH unit difference from ideal
  }

  // Crop rotation
  if (field.rotationHistory && field.rotationHistory.length) {
    score += Math.min(15, field.rotationHistory.length * 5); // Up to +15 for rotation
  }

  return Math.max(0, Math.min(100, score));
};

const calculateOrganicScore = (field: Field): number => {
  let score = 70; // Base score
  
  // Analyze fertilizer types and amounts
  const totalFertilizerAmount = field.fertilizerHistory.reduce((sum, f) => sum + f.amount, 0);
  const organicFertilizers = field.fertilizerHistory.filter(f => 
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
  if (field.rotationHistory && field.rotationHistory.length) {
    score += Math.min(10, field.rotationHistory.length * 2);
  }

  // Add bonus for consistent organic practices
  const consecutiveOrganicFertilizers = organicFertilizers.length;
  if (consecutiveOrganicFertilizers >= 3) {
    score += 10; // Bonus for consistent organic practices
  }

  return Math.min(100, Math.max(0, score));
};

const calculateHarvestEfficiency = (field: Field, weatherData: WeatherData[]): number => {
  if (!field.harvestHistory.length) return 0;

  let score = 100;
  
  // Remove unused harvestsPerYear calculation or use it in scoring
  // Optionally, you could use it like this:
  // const harvestsPerYear = field.harvestHistory.length / 
  //   (new Set(field.harvestHistory.map(h => new Date(h.date).getFullYear())).size || 1);
  // score += harvestsPerYear * 5; // Bonus for multiple harvests per year
  
  // Analyze yield consistency
  const yields = field.harvestHistory.map(h => h.amount);
  const avgYield = yields.reduce((a, b) => a + b, 0) / yields.length;
  const yieldVariation = Math.sqrt(
    yields.reduce((acc, y) => acc + Math.pow(y - avgYield, 2), 0) / yields.length
  ) / avgYield;

  // Penalize for high yield variation
  score -= yieldVariation * 20;

  // Consider weather impact
  field.harvestHistory.forEach(harvest => {
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
  fields: Field[],
  weatherData: WeatherData[]
): SustainabilityMetrics | null => {
  if (fields.length === 0 || weatherData.length === 0) return null;

  const fieldMetrics = fields.map(field => ({
    waterEfficiency: calculateWaterEfficiency(field.waterHistory, weatherData),
    organicScore: calculateOrganicScore(field),
    harvestEfficiency: calculateHarvestEfficiency(field, weatherData),
    soilQualityScore: calculateSoilQualityScore(field),
    rotationScore: calculateRotationScore(field),
  }));

  const avgMetrics = fieldMetrics.reduce((acc: MetricsAccumulator, metrics) => {
    Object.keys(metrics).forEach(key => {
      acc[key] = (acc[key] || 0) + metrics[key as keyof typeof metrics];
    });
    return acc;
  }, {});

  Object.keys(avgMetrics).forEach(key => {
    avgMetrics[key] /= fields.length;
  });

  const weights = {
    waterEfficiency: 0.25,
    organicScore: 0.20,
    harvestEfficiency: 0.20,
    soilQualityScore: 0.20,
    rotationScore: 0.15,
  };

  const overallScore = Object.keys(weights).reduce((sum, key) => {
    return sum + avgMetrics[key] * weights[key as keyof typeof weights];
  }, 0);

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
const calculateRotationScore = (field: Field): number => {
  if (!field.rotationHistory?.length) return 0;
  
  let score = Math.min(100, field.rotationHistory.length * 20); // 20 points per rotation, max 100
  
  // Check for variety in crops
  const uniqueCrops = new Set(field.rotationHistory.map(r => r.crop)).size;
  score += Math.min(20, uniqueCrops * 5); // 5 points per unique crop, max 20 bonus
  
  return Math.min(100, score);
};

const Navigation: React.FC<{ activeTab: string, setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { value: "overview", label: "Overview" },
    { value: "water", label: "Water Management" },
    { value: "crops", label: "Crops" },
    { value: "issues", label: "Field Issues" },
    { value: "reports", label: "Reports" },
    { value: "history", label: "History" },
    { value: "cropplan", label: "Crop Plan" },
    { value: "instructions", label: "Instructions" }
  ];

  return (
    <div className="block md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {menuItems.map((item) => (
            <DropdownMenuItem 
              key={item.value}
              className={`cursor-pointer ${activeTab === item.value ? 'bg-gray-100' : ''}`}
              onClick={() => setActiveTab(item.value)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const getWeatherInfo = (code: number) => {
  switch (true) {
    case code <= 3: return { desc: 'Clear', icon: '☀️' };
    case code <= 48: return { desc: 'Cloudy', icon: '☁️' };
    case code <= 67: return { desc: 'Rain', icon: '🌧️' };
    case code <= 77: return { desc: 'Snow', icon: '❄️' };
    default: return { desc: 'Unknown', icon: '❓' };
  }
};

const DefaultComponent: React.FC = () => {
  const [fields, setFields] = useState<Field[]>(() => {
    const savedFields = localStorage.getItem('fields');
    return savedFields ? JSON.parse(savedFields) : [];
  });

  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [isEditingField, setIsEditingField] = useState(false);
  const [newField, setNewField] = useState({ 
    name: '', 
    size: '', 
    crop: '',
    rotationHistory: [] as { crop: string; startDate: string; endDate: string }[]
  });
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [newWaterUsage, setNewWaterUsage] = useState({ fieldId: '', amount: '', date: '' });
  const [isAddingWaterUsage, setIsAddingWaterUsage] = useState(false);
  const [isEditingWaterUsage, setIsEditingWaterUsage] = useState(false);
  const [editingWaterUsage, setEditingWaterUsage] = useState<WaterUsage | null>(null);
  const [isAddingFertilizer, setIsAddingFertilizer] = useState(false);
  const [isEditingFertilizer, setIsEditingFertilizer] = useState(false);
  const [editingFertilizer, setEditingFertilizer] = useState<any | null>(null);
  const [isAddingHarvest, setIsAddingHarvest] = useState(false);
  const [isEditingHarvest, setIsEditingHarvest] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<any | null>(null);
  const [newFertilizer, setNewFertilizer] = useState({ fieldId: '', type: '', amount: '', date: '' });
  const [newHarvest, setNewHarvest] = useState({ fieldId: '', amount: '', date: '' });
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
    fieldId: '',
    crop: '',
    startDate: '',
    endDate: ''
  });

  const [cropFilter, setCropFilter] = useState<string>("all");

  const getFilteredFields = () => {
    if (cropFilter === "all") return fields;
    return fields.filter(field => field.crop === cropFilter);
  };

  const CropFilter = () => {
    const uniqueCrops = useMemo(() => {
      const crops = new Set(fields.map(field => field.crop));
      return ["all", ...Array.from(crops)];
    }, [fields]);

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
    localStorage.setItem('fields', JSON.stringify(fields));
  }, [fields]);

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

  const handleAddField = () => {
    setFields([...fields, {
      id: fields.length + 1,
      name: newField.name,
      size: newField.size,
      crop: newField.crop,
      rotationHistory: newField.rotationHistory,
      waterHistory: [],
      fertilizerHistory: [],
      harvestHistory: []
    }]);
    setIsAddingField(false);
    setNewField({ 
      name: '', 
      size: '', 
      crop: '', 
      rotationHistory: [] 
    });
  };

  // Update handleEditField to include rotationHistory
  const handleEditField = () => {
    if (editingField) {
      const updatedFields = fields.map(field => 
        field.id === editingField.id ? { ...editingField, ...newField } : field
      );
      setFields(updatedFields);
      setIsEditingField(false);
      setEditingField(null);
      setNewField({ 
        name: '', 
        size: '', 
        crop: '', 
        rotationHistory: [] 
      });
    }
  };

  const handleDeleteField = (id: number) => {
    setConfirmDelete({ id, type: 'field' });
  };

  const handleAddWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields = fields.map(field => {
      if (field.id === parseInt(newWaterUsage.fieldId)) {
        return {
          ...field,
          waterHistory: [...field.waterHistory, {
            amount: parseFloat(newWaterUsage.amount),
            date: newWaterUsage.date
          }]
        };
      }
      return field;
    });
    setFields(updatedFields);
    setNewWaterUsage({ fieldId: '', amount: '', date: '' });
  };

  const handleEditWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWaterUsage) {
      const updatedFields = fields.map(field => {
        if (field.id === parseInt(newWaterUsage.fieldId)) {
          return {
            ...field,
            waterHistory: field.waterHistory.map(usage =>
              usage.date === editingWaterUsage.date ? { ...usage, amount: parseFloat(newWaterUsage.amount), date: newWaterUsage.date } : usage
            )
          };
        }
        return field;
      });
      setFields(updatedFields);
      setIsEditingWaterUsage(false);
      setEditingWaterUsage(null);
      setNewWaterUsage({ fieldId: '', amount: '', date: '' });
    }
  };

  const handleAddFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields = fields.map(field => {
      if (field.id === parseInt(newFertilizer.fieldId)) {
        return {
          ...field,
          fertilizerHistory: [...field.fertilizerHistory, {
            type: newFertilizer.type,
            amount: parseFloat(newFertilizer.amount),
            date: newFertilizer.date
          }]
        };
      }
      return field;
    });
    setFields(updatedFields);
    setNewFertilizer({ fieldId: '', type: '', amount: '', date: '' });
  };

  const handleEditFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFertilizer) {
      const updatedFields = fields.map(field => {
        if (field.id === parseInt(newFertilizer.fieldId)) {
          return {
            ...field,
            fertilizerHistory: field.fertilizerHistory.map(fertilizer =>
              fertilizer.date === editingFertilizer.date ? { ...fertilizer, type: newFertilizer.type, amount: parseFloat(newFertilizer.amount), date: newFertilizer.date } : fertilizer
            )
          };
        }
        return field;
      });
      setFields(updatedFields);
      setIsEditingFertilizer(false);
      setEditingFertilizer(null);
      setNewFertilizer({ fieldId: '', type: '', amount: '', date: '' });
    }
  };

  const handleAddHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields = fields.map(field => {
      if (field.id === parseInt(newHarvest.fieldId)) {
        return {
          ...field,
          harvestHistory: [...field.harvestHistory, {
            amount: parseFloat(newHarvest.amount),
            date: newHarvest.date
          }]
        };
      }
      return field;
    });
    setFields(updatedFields);
    setNewHarvest({ fieldId: '', amount: '', date: '' });
  };

  const handleEditHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHarvest) {
      const updatedFields = fields.map(field => {
        if (field.id === parseInt(newHarvest.fieldId)) {
          return {
            ...field,
            harvestHistory: field.harvestHistory.map(harvest =>
              harvest.date === editingHarvest.date ? { ...harvest, amount: parseFloat(newHarvest.amount), date: newHarvest.date } : harvest
            )
          };
        }
        return field;
      });
      setFields(updatedFields);
      setIsEditingHarvest(false);
      setEditingHarvest(null);
      setNewHarvest({ fieldId: '', amount: '', date: '' });
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
    const updatedFields = fields.map(field => {
      if (field.id === parseInt(newRotation.fieldId)) {
        return {
          ...field,
          rotationHistory: [
            ...(field.rotationHistory || []),
            {
              crop: newRotation.crop,
              startDate: newRotation.startDate,
              endDate: newRotation.endDate
            }
          ]
        };
      }
      return field;
    });
    setFields(updatedFields);
    setIsAddingRotation(false);
    setNewRotation({ fieldId: '', crop: '', startDate: '', endDate: '' });
  };

  const confirmDeleteAction = () => {
    if (confirmDelete) {
      switch (confirmDelete.type) {
        case 'field':
          setFields(fields.filter(field => field.id !== confirmDelete.id));
          break;
        case 'waterUsage':
          setFields(fields.map(field => {
            if (field.id === confirmDelete.id) {
              return {
                ...field,
                waterHistory: field.waterHistory.filter(usage => 
                  new Date(usage.date).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return field;
          }));
          break;
        case 'fertilizer':
          setFields(fields.map(field => {
            if (field.id === confirmDelete.id) {
              return {
                ...field,
                fertilizerHistory: field.fertilizerHistory.filter(fertilizer => 
                  new Date(fertilizer.date).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return field;
          }));
          break;
        case 'harvest':
          setFields(fields.map(field => {
            if (field.id === confirmDelete.id) {
              return {
                ...field,
                harvestHistory: field.harvestHistory.filter(harvest => 
                  new Date(harvest.date).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return field;
          }));
          break;
        case 'rotation':
          setFields(fields.map(field => {
            if (field.id === confirmDelete.id) {
              return {
                ...field,
                rotationHistory: (field.rotationHistory || []).filter(rotation => 
                  new Date(rotation.startDate).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return field;
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

  const TaskManager = () => {
    const [taskInput, setTaskInput] = useState({ title: '', dueDate: '', priority: 'medium' });

    const handleTaskSubmit = () => {
      setTasks([...tasks, { ...taskInput, id: Date.now(), completed: false }]);
      setTaskInput({ title: '', dueDate: '', priority: 'medium' });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Field Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                name="title"
                placeholder="New task"
                value={taskInput.title}
                onChange={(e) => setTaskInput(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input 
                name="dueDate"
                type="date"
                value={taskInput.dueDate}
                onChange={(e) => setTaskInput(prev => ({ ...prev, dueDate: e.target.value }))}
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
            Field Issues
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
              />
              <select 
                name="severity"
                className="border rounded p-2"
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

  const sustainabilityMetrics = useMemo(() => calculateSustainabilityMetrics(getFilteredFields(), weatherData), [fields, weatherData, cropFilter]);

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
    const allHistory = useMemo(() => {
      const history: AnyHistoryEntry[] = fields.flatMap(field => [
        ...field.waterHistory.map(usage => ({
          type: 'Water Usage' as const,
          date: new Date(usage.date),
          field: field.name,
          amount: `${usage.amount} gallons`,
          icon: <Droplet className="h-4 w-4 text-blue-500" />,
          color: 'blue',
          fieldId: field.id,
          usage
        })),
        ...field.fertilizerHistory.map(fertilizer => ({
          type: 'Fertilizer Usage' as const,
          date: new Date(fertilizer.date),
          field: field.name,
          amount: `${fertilizer.amount} lbs`,
          icon: <Leaf className="h-4 w-4 text-green-500" />,
          color: 'green',
          fieldId: field.id,
          fertilizer
        })),
        ...field.harvestHistory.map(harvest => ({
          type: 'Harvest' as const,
          date: new Date(harvest.date),
          field: field.name,
          amount: `${harvest.amount} bushels`,
          icon: <LayoutDashboard className="h-4 w-4 text-purple-500" />,
          color: 'purple',
          fieldId: field.id,
          harvest
        })),
        ...(field.rotationHistory || []).map(rotation => ({
          type: 'Crop Rotation' as const,
          date: new Date(rotation.startDate),
          endDate: new Date(rotation.endDate),
          field: field.name,
          crop: rotation.crop,
          icon: <RotateCw className="h-4 w-4 text-orange-500" />,
          color: 'orange',
          fieldId: field.id,
          rotation
        }))
      ]);

      return history.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [fields]);

    const handleEditHistory = (entry: any) => {
      switch (entry.type) {
        case 'Water Usage':
          setEditingWaterUsage(entry.usage);
          setNewWaterUsage({ fieldId: entry.fieldId.toString(), amount: entry.usage.amount.toString(), date: entry.usage.date });
          setIsEditingWaterUsage(true);
          setIsAddingWaterUsage(true);
          break;
        case 'Fertilizer Usage':
          setEditingFertilizer(entry.fertilizer);
          setNewFertilizer({ fieldId: entry.fieldId.toString(), type: entry.fertilizer.type, amount: entry.fertilizer.amount.toString(), date: entry.fertilizer.date });
          setIsEditingFertilizer(true);
          setIsAddingFertilizer(true);
          break;
        case 'Harvest':
          setEditingHarvest(entry.harvest);
          setNewHarvest({ fieldId: entry.fieldId.toString(), amount: entry.harvest.amount.toString(), date: entry.harvest.date });
          setIsEditingHarvest(true);
          setIsAddingHarvest(true);
          break;
        case 'Crop Rotation':
          setNewRotation({
            fieldId: entry.fieldId.toString(),
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
          setConfirmDelete({ id: entry.fieldId, type: 'waterUsage', date: entry.usage.date });
          break;
        case 'Fertilizer Usage':
          setConfirmDelete({ id: entry.fieldId, type: 'fertilizer', date: entry.fertilizer.date });
          break;
        case 'Harvest':
          setConfirmDelete({ id: entry.fieldId, type: 'harvest', date: entry.harvest.date });
          break;
        case 'Crop Rotation':
          setConfirmDelete({ 
            id: entry.fieldId, 
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
            {allHistory.map((entry, index) => (
              <div key={index} className={`p-2 border-l-4 ${
                entry.type === 'Crop Rotation' ? 'border-orange-500' : `border-${entry.color}-500`
              } rounded`}>
                <div className="flex items-center gap-2">
                  {entry.icon}
                  <p><strong>{entry.type}</strong></p>
                </div>
                <p><strong>Field:</strong> {entry.field}</p>
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
                {entry.type === 'Water Usage' && (
                  <Dialog 
                    open={isEditingWaterUsage} 
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsEditingWaterUsage(false);
                        setEditingWaterUsage(null);
                        setNewWaterUsage({ fieldId: '', amount: '', date: '' });
                      }
                    }}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Water Usage</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditWaterUsage} className="space-y-4">
                        <div>
                          <Label>Field</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={newWaterUsage.fieldId}
                            onChange={(e) => setNewWaterUsage({...newWaterUsage, fieldId: e.target.value})}
                            required
                          >
                            <option value="">Select Field</option>
                            {fields.map(field => (
                              <option key={field.id} value={field.id}>{field.name}</option>
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
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input 
                            type="date"
                            value={newWaterUsage.date}
                            onChange={(e) => setNewWaterUsage({...newWaterUsage, date: e.target.value})}
                            required
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
                        setNewFertilizer({ fieldId: '', type: '', amount: '', date: '' });
                      }
                    }}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Fertilizer Usage</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditFertilizer} className="space-y-4">
                        <div>
                          <Label>Field</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={newFertilizer.fieldId}
                            onChange={(e) => setNewFertilizer({...newFertilizer, fieldId: e.target.value})}
                            required
                          >
                            <option value="">Select Field</option>
                            {fields.map(field => (
                              <option key={field.id} value={field.id}>{field.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Input 
                            value={newFertilizer.type}
                            onChange={(e) => setNewFertilizer({...newFertilizer, type: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label>Amount (lbs)</Label>
                          <Input 
                            type="number"
                            value={newFertilizer.amount}
                            onChange={(e) => setNewFertilizer({...newFertilizer, amount: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input 
                            type="date"
                            value={newFertilizer.date}
                            onChange={(e) => setNewFertilizer({...newFertilizer, date: e.target.value})}
                            required
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
                        setNewHarvest({ fieldId: '', amount: '', date: '' });
                      }
                    }}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Harvest</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditHarvest} className="space-y-4">
                        <div>
                          <Label>Field</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={newHarvest.fieldId}
                            onChange={(e) => setNewHarvest({...newHarvest, fieldId: e.target.value})}
                            required
                          >
                            <option value="">Select Field</option>
                            {fields.map(field => (
                              <option key={field.id} value={field.id}>{field.name}</option>
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
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input 
                            type="date"
                            value={newHarvest.date}
                            onChange={(e) => setNewHarvest({...newHarvest, date: e.target.value})}
                            required
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
                        setNewRotation({ fieldId: '', crop: '', startDate: '', endDate: '' });
                      }
                    }}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Crop Rotation</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddRotation} className="space-y-4">
                        <div>
                          <Label>Field</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={newRotation.fieldId}
                            onChange={(e) => setNewRotation({...newRotation, fieldId: e.target.value})}
                            required
                          >
                            <option value="">Select Field</option>
                            {fields.map(field => (
                              <option key={field.id} value={field.id}>{field.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Crop</Label>
                          <Input 
                            value={newRotation.crop}
                            onChange={(e) => setNewRotation({...newRotation, crop: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input 
                            type="date"
                            value={newRotation.startDate}
                            onChange={(e) => setNewRotation({...newRotation, startDate: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input 
                            type="date"
                            value={newRotation.endDate}
                            onChange={(e) => setNewRotation({...newRotation, endDate: e.target.value})}
                            required
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
                <li>Monitor active field issues</li>
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
                <li>Track irrigation patterns across different fields</li>
                <li>Record new water applications through Quick Actions</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Crops & Fields
            </h2>
            <div className="mt-2 space-y-2 text-gray-600">
              <p>Manage your fields and crops:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Add new fields with detailed information</li>
                <li>Track crop rotations and field history</li>
                <li>Monitor harvest records</li>
                <li>View fertilizer applications</li>
                <li>Edit or delete existing fields</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Field Issues
            </h2>
            <div className="mt-2 space-y-2 text-gray-600">
              <p>Track and manage field problems:</p>
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
            <h2 className="text-lg font-bold text-blue-700">Tips</h2>
            <ul className="mt-2 space-y-2 text-blue-600">
              <li>• Use the walkthrough feature above to learn the basics</li>
              <li>• Regular data entry helps maintain accurate sustainability scores</li>
              <li>• Check weather forecasts before scheduling water applications</li>
              <li>• Keep crop rotation records updated for better soil health tracking</li>
            </ul>
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
      fieldId: 0,
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
        fieldId: 0,
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
                        title={`${event.title}\nField: ${fields.find(f => f.id === event.fieldId)?.name}\n${event.notes}`}
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
                />
              </div>
              <div>
                <Label>Field</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={newEvent.fieldId}
                  onChange={(e) => setNewEvent({ ...newEvent, fieldId: Number(e.target.value) })}
                  required
                >
                  <option value="">Select Field</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
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
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newEvent.end.toISOString().split('T')[0]}
                  onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
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
                        <span>Field: {fields.find(f => f.id === event.fieldId)?.name}</span>
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
  
  const FieldIssues = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Field Issues</CardTitle>
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

  const Reports = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Field Performance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <CropFilter />
          {getFilteredFields().length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Droplet className="h-6 w-6 text-blue-500 mb-2" />
                  <p className="text-sm text-gray-500">Total Water Usage</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {getFilteredFields()
                      .reduce(
                        (total, field) =>
                          total +
                          field.waterHistory.reduce(
                            (sum, record) => sum + record.amount,
                            0
                          ),
                        0
                      )
                      .toLocaleString()}{" "}
                    gal
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Leaf className="h-6 w-6 text-green-500 mb-2" />
                  <p className="text-sm text-gray-500">Total Fertilizer Used</p>
                  <p className="text-2xl font-bold text-green-600">
                    {/* ...existing code... */}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <LayoutDashboard className="h-6 w-6 text-yellow-500 mb-2" />
                  <p className="text-sm text-gray-500">Total Harvest</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {/* ...existing code... */}
                  </p>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getFilteredFields().flatMap((field) =>
                      field.harvestHistory.map((harvest) => ({
                        field: field.name,
                        amount: harvest.amount,
                        date: new Date(harvest.date).toLocaleDateString(),
                      }))
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill="#8884d8"
                      name="Harvest Amount (bu)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">
                {fields.length === 0
                  ? "No data available. Add fields and record activities to see reports."
                  : "No fields found for the selected crop."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div>
      {showWalkthrough && <Walkthrough onComplete={handleWalkthroughComplete} />}
      <div className="p-6 max-w-7xl mx-auto bg-white dark:bg-gray-900 dark:text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Farm Management Dashboard</h1>

          <Tabs defaultValue="overview" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList className="hidden md:flex">
                <TabsTrigger data-walkthrough="overview-tab" value="overview">Overview</TabsTrigger>
                <TabsTrigger value="water">Water Management</TabsTrigger>
                <TabsTrigger value="crops">Crops</TabsTrigger>
                <TabsTrigger value="issues">Field Issues</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger data-walkthrough="crop-plan" value="cropplan">Crop Plan</TabsTrigger>
                <TabsTrigger value="instructions"><Info className="h-4 w-4 mr-2" />Instructions</TabsTrigger>
              </TabsList>
              <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
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
                              <Label>Field</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newWaterUsage.fieldId}
                                onChange={(e) => setNewWaterUsage({...newWaterUsage, fieldId: e.target.value})}
                                required
                              >
                                <option value="">Select Field</option>
                                {fields.map(field => (
                                  <option key={field.id} value={field.id}>{field.name}</option>
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
                              />
                            </div>
                            <div>
                              <Label>Date</Label>
                              <Input 
                                type="date"
                                value={newWaterUsage.date}
                                onChange={(e) => setNewWaterUsage({...newWaterUsage, date: e.target.value})}
                                required
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
                              <Label>Field</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newFertilizer.fieldId}
                                onChange={(e) => setNewFertilizer({...newFertilizer, fieldId: e.target.value})}
                                required
                              >
                                <option value="">Select Field</option>
                                {fields.map(field => (
                                  <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label>Type</Label>
                              <Input 
                                value={newFertilizer.type}
                                onChange={(e) => setNewFertilizer({...newFertilizer, type: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label>Amount (lbs)</Label>
                              <Input 
                                type="number"
                                value={newFertilizer.amount}
                                onChange={(e) => setNewFertilizer({...newFertilizer, amount: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label>Date</Label>
                              <Input 
                                type="date"
                                value={newFertilizer.date}
                                onChange={(e) => setNewFertilizer({...newFertilizer, date: e.target.value})}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full">Save Fertilizer Application</Button>
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
                              <Label>Field</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newHarvest.fieldId}
                                onChange={(e) => setNewHarvest({...newHarvest, fieldId: e.target.value})}
                                required
                              >
                                <option value="">Select Field</option>
                                {fields.map(field => (
                                  <option key={field.id} value={field.id}>{field.name}</option>
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
                              />
                            </div>
                            <div>
                              <Label>Date</Label>
                              <Input 
                                type="date"
                                value={newHarvest.date}
                                onChange={(e) => setNewHarvest({...newHarvest, date: e.target.value})}
                                required
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
                              <Label>Field</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newRotation.fieldId}
                                onChange={(e) => setNewRotation({...newRotation, fieldId: e.target.value})}
                                required
                              >
                                <option value="">Select Field</option>
                                {fields.map(field => (
                                  <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label>Crop</Label>
                              <Input 
                                value={newRotation.crop}
                                onChange={(e) => setNewRotation({...newRotation, crop: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input 
                                type="date"
                                value={newRotation.startDate}
                                onChange={(e) => setNewRotation({...newRotation, startDate: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input 
                                type="date"
                                value={newRotation.endDate}
                                onChange={(e) => setNewRotation({...newRotation, endDate: e.target.value})}
                                required
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
                <FieldIssues />
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
                      {fields.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={fields.flatMap(field => 
                            field.waterHistory.map(usage => ({
                              field: field.name,
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

            <TabsContent value="crops">
              <div className="space-y-4">
                <Button
                  data-walkthrough="add-field"
                  onClick={() => setIsAddingField(true)}
                  className="mb-4"
                >
                  Add New Field
                </Button>

                <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Field</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddField} className="space-y-4">
                      <div>
                        <Label>Field Name</Label>
                        <Input
                          value={newField.name}
                          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Size (acres)</Label>
                        <Input
                          type="number"
                          value={newField.size}
                          onChange={(e) => setNewField({ ...newField, size: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Current Crop</Label>
                        <Input
                          value={newField.crop}
                          onChange={(e) => setNewField({ ...newField, crop: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Crop Rotation History</Label>
                        <div className="space-y-2">
                          {newField.rotationHistory.map((rotation, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <Input
                                placeholder="Crop"
                                value={rotation.crop}
                                onChange={(e) => {
                                  const updated = [...newField.rotationHistory];
                                  updated[index].crop = e.target.value;
                                  setNewField({ ...newField, rotationHistory: updated });
                                }}
                              />
                              <Input
                                type="date"
                                value={rotation.startDate}
                                onChange={(e) => {
                                  const updated = [...newField.rotationHistory];
                                  updated[index].startDate = e.target.value;
                                  setNewField({ ...newField, rotationHistory: updated });
                                }}
                              />
                              <Input
                                type="date"
                                value={rotation.endDate}
                                onChange={(e) => {
                                  const updated = [...newField.rotationHistory];
                                  updated[index].endDate = e.target.value;
                                  setNewField({ ...newField, rotationHistory: updated });
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = newField.rotationHistory.filter((_, i) => i !== index);
                                  setNewField({ ...newField, rotationHistory: updated });
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
                              setNewField({
                                ...newField,
                                rotationHistory: [
                                  ...newField.rotationHistory,
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
                        Add Field
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditingField} onOpenChange={setIsEditingField}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Field</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditField} className="space-y-4">
                      <div>
                        <Label>Field Name</Label>
                        <Input
                          value={newField.name}
                          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Size (acres)</Label>
                        <Input
                          type="number"
                          value={newField.size}
                          onChange={(e) => setNewField({ ...newField, size: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Crop Type</Label>
                        <Input
                          value={newField.crop}
                          onChange={(e) => setNewField({ ...newField, crop: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Save Changes
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.length > 0 ? (
                    fields.map((field) => (
                      <Card
                        key={field.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle>{field.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-gray-500">Current Crop: {field.crop}</p>
                            <p className="text-gray-500">Size: {field.size.toLocaleString()} acres</p>
                            
                            {field.rotationHistory && field.rotationHistory.length > 0 && (
                              <div className="mt-4">
                                <p className="font-medium mb-2">Crop Rotation History</p>
                                <div className="space-y-1">
                                  {field.rotationHistory.map((rotation, index) => (
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
                                  {field.waterHistory.length > 0
                                    ? new Date(
                                        field.waterHistory[field.waterHistory.length - 1].date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Leaf className="h-4 w-4 text-green-500" />
                                <span>
                                  Last fertilized:{" "}
                                  {field.fertilizerHistory.length > 0
                                    ? new Date(
                                        field.fertilizerHistory[field.fertilizerHistory.length - 1]
                                          .date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4 text-purple-500" />
                                <span>
                                  Last harvest:{" "}
                                  {field.harvestHistory.length > 0
                                    ? new Date(
                                        field.harvestHistory[field.harvestHistory.length - 1].date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <RotateCw className="h-4 w-4 text-orange-500" />
                                <span>
                                  Last rotation:{" "}
                                  {field.rotationHistory && field.rotationHistory.length > 0
                                    ? `${field.rotationHistory[field.rotationHistory.length - 1].crop} (${
                                        new Date(field.rotationHistory[field.rotationHistory.length - 1].startDate).toLocaleDateString()
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
                                  setEditingField(field);
                                  setNewField({ 
                                    name: field.name, 
                                    size: field.size, 
                                    crop: field.crop,
                                    rotationHistory: field.rotationHistory || []
                                  });
                                  setIsEditingField(true);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteField(field.id)}
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
                        No fields added yet. Click "Add New Field" to get started.
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
          </Tabs>
        </div>
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="bg-white text-black">
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
      </div>
    </div>
  );
};

// Add this type definition before the DefaultComponent
type AnyHistoryEntry = {
  type: 'Water Usage' | 'Fertilizer Usage' | 'Harvest' | 'Crop Rotation';
  date: Date;
  field: string;
  amount?: string;
  icon: React.ReactNode;
  color: string;
  fieldId: number;
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
