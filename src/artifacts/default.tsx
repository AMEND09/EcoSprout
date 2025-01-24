import React, { useState, useMemo, useEffect } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet, Leaf, LayoutDashboard, Info, AlertTriangle, Trash2, Menu, Edit3, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface WaterUsage {
  amount: number;
  date: string;
  efficiency?: number;  // Add efficiency score for each watering
}

interface Field {
  id: number;
  name: string;
  size: string;
  crop: string;
  waterHistory: WaterUsage[];
  fertilizerHistory: any[];
  harvestHistory: any[];
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
  fieldId?: number;  // Add this line
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
}

interface ScheduleItem {
  id: number;
  cropId: number;
  type: 'water' | 'fertilize' | 'harvest';
  date: string;
  notes: string;
}

const calculateWaterEfficiency = (
  waterUsage: WaterUsage,
  weatherData: WeatherData[],
) => {
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

const Navigation: React.FC<{ activeTab: string, setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { value: "overview", label: "Overview" },
    { value: "water", label: "Water Management" },
    { value: "crops", label: "Crops" },
    { value: "cropplan", label: "Crop Plan" },
    { value: "issues", label: "Tasks/Issues" },
    { value: "reports", label: "Reports" },
    { value: "history", label: "History" },
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

const DefaultComponent: React.FC = () => {
  const [fields, setFields] = useState<Field[]>(() => {
    const savedFields = localStorage.getItem('fields');
    return savedFields ? JSON.parse(savedFields) : [];
  });

  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [isEditingField, setIsEditingField] = useState(false);
  const [newField, setNewField] = useState({ name: '', size: '', crop: '' });
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [newWaterUsage, setNewWaterUsage] = useState({ fieldId: '', amount: '', date: '' });
  const [isEditingWaterUsage, setIsEditingWaterUsage] = useState(false);
  const [editingWaterUsage, setEditingWaterUsage] = useState<WaterUsage | null>(null);
  const [isEditingFertilizer, setIsEditingFertilizer] = useState(false);
  const [editingFertilizer, setEditingFertilizer] = useState<any | null>(null);
  const [isEditingHarvest, setIsEditingHarvest] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<any | null>(null);
  const [newFertilizer, setNewFertilizer] = useState({ fieldId: '', type: '', amount: '', date: '' });
  const [newHarvest, setNewHarvest] = useState({ fieldId: '', amount: '', date: '' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null);
  const [selectedFieldForWater, setSelectedFieldForWater] = useState<string>('all');
  const [selectedFieldForIssues] = useState<string>('all');
  const [selectedFieldForReport, setSelectedFieldForReport] = useState<string>('all');
  const [selectedFieldForSustainability, setSelectedFieldForSustainability] = useState<string>('all');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() => {
    const savedSchedule = localStorage.getItem('scheduleItems');
    return savedSchedule ? JSON.parse(savedSchedule) : [];
  });
  const [isAddingScheduleItem, setIsAddingScheduleItem] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'water' | 'fertilizer' | 'harvest' | null>(null);
  
  useEffect(() => {
    localStorage.setItem('fields', JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    fetchUserLocation();
  }, []);

  useEffect(() => {
    localStorage.setItem('scheduleItems', JSON.stringify(scheduleItems));
  }, [scheduleItems]);

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
      const weatherData = await response.json();

      const getWeatherInfo = (code: number) => {
        switch (true) {
          case code <= 3: return { desc: 'Clear', icon: '☀️' };
          case code <= 48: return { desc: 'Cloudy', icon: '☁️' };
          case code <= 67: return { desc: 'Rain', icon: '🌧️' };
          case code <= 77: return { desc: 'Snow', icon: '❄️' };
          default: return { desc: 'Storm', icon: '⛈️' };
        }
      };

      const formattedData = weatherData.daily.time.map((date: string, index: number) => {
        const weatherInfo = getWeatherInfo(weatherData.daily.weathercode[index]);
        return {
          date: new Date(date).toLocaleDateString(),
          temp: weatherData.daily.temperature_2m_max[index],
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
      waterHistory: [],
      fertilizerHistory: [],
      harvestHistory: []
    }]);
    setIsAddingField(false);
    setNewField({ name: '', size: '', crop: '' });
  };

  const handleEditField = () => {
    if (editingField) {
      const updatedFields = fields.map(field => 
        field.id === editingField.id ? { ...editingField, ...newField } : field
      );
      setFields(updatedFields);
      setIsEditingField(false);
      setEditingField(null);
      setNewField({ name: '', size: '', crop: '' });
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

  const handleDeleteScheduleItem = (id: number) => {
    setConfirmDelete({ id, type: 'scheduleItem' });
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
                waterHistory: field.waterHistory.filter(usage => usage.date !== confirmDelete.date)
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
                fertilizerHistory: field.fertilizerHistory.filter(fertilizer => fertilizer.date !== confirmDelete.date)
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
                harvestHistory: field.harvestHistory.filter(harvest => harvest.date !== confirmDelete.date)
              };
            }
            return field;
          }));
          break;
        case 'task':
          setTasks(tasks.filter(task => task.id !== confirmDelete.id));
          break;
        case 'scheduleItem':
          setScheduleItems(scheduleItems.filter(item => item.id !== confirmDelete.id));
          break;
        default:
          break;
      }
      setConfirmDelete(null);
    }
  };

  const TaskManager = () => {
    const [taskInput, setTaskInput] = useState({ title: '', dueDate: '', priority: 'medium' });
    const [showAddTask, setShowAddTask] = useState(false);
  
    const handleTaskSubmit = () => {
      setTasks([...tasks, { ...taskInput, id: Date.now(), completed: false }]);
      setTaskInput({ title: '', dueDate: '', priority: 'medium' });
      setShowAddTask(false);
    };
  
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tasks</CardTitle>
            <Button onClick={() => setShowAddTask(true)}>Add Task</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className={task.completed ? 'line-through' : ''}>
                    {task.title}
                  </span>
                  <div className="flex gap-2">
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
        <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  name="title"
                  placeholder="New task"
                  value={taskInput.title}
                  onChange={(e) => setTaskInput(prev => ({ ...prev, title: e.target.value }))}
                />
                <Button onClick={handleTaskSubmit}>Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  };
  
  const IssueManager = () => {
    const [issueInput, setIssueInput] = useState({ type: '', description: '', severity: 'low' });
    const [showAddIssue, setShowAddIssue] = useState(false);
  
    const handleIssueSubmit = () => {
      setIssues([...issues, { 
        ...issueInput, 
        id: Date.now(), 
        status: 'open', 
        dateReported: new Date(),
        fieldId: selectedFieldForIssues === 'all' ? undefined : parseInt(selectedFieldForIssues)
      }]);
      setIssueInput({ type: '', description: '', severity: 'low' });
      setShowAddIssue(false);
    };
  
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Crop Issues</CardTitle>
            <Button onClick={() => setShowAddIssue(true)}>Report Issue</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {issues.map(issue => (
                <Alert key={issue.id} variant={issue.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between">
                      <span className="font-bold">{issue.type}</span>
                      <span className="text-sm">{issue.severity} severity</span>
                    </div>
                    <p className="text-sm">{issue.description}</p>
                    {issue.status === 'open' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleResolveIssue(issue.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        </CardContent>
        <Dialog open={showAddIssue} onOpenChange={setShowAddIssue}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report New Issue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input 
                  name="type"
                  placeholder="Issue type"
                  value={issueInput.type}
                  onChange={(e) => setIssueInput(prev => ({ ...prev, type: e.target.value }))}
                />
                <select 
                  name="severity"
                  className="w-full border rounded p-2"
                  value={issueInput.severity}
                  onChange={(e) => setIssueInput(prev => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="low">Low Severity</option>
                  <option value="medium">Medium Severity</option>
                  <option value="high">High Severity</option>
                </select>
                <Input 
                  name="description"
                  placeholder="Description"
                  value={issueInput.description}
                  onChange={(e) => setIssueInput(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button onClick={handleIssueSubmit} className="w-full">Report Issue</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  };
  

  const calculateSustainabilityMetrics = (filteredFields: Field[]) => {
    if (filteredFields.length === 0 || weatherData.length === 0) return null;
  
    const calculateFieldMetrics = (field: Field) => {
      const waterUsageWithEfficiency = field.waterHistory.map(usage => ({
        ...usage,
        efficiency: calculateWaterEfficiency(usage, weatherData)
      }));
  
      const avgWaterEfficiency = waterUsageWithEfficiency.length > 0
        ? waterUsageWithEfficiency.reduce((sum, usage) => sum + (usage.efficiency || 0), 0) / waterUsageWithEfficiency.length
        : 100;
  
      const fieldSize = parseFloat(field.size);
      
      const totalWaterUsage = waterUsageWithEfficiency.reduce((sum, usage) => 
        sum + (usage.amount * (usage.efficiency || 100) / 100), 0);
      const waterPerAcre = totalWaterUsage / fieldSize || 0;
      const waterEfficiency = Math.min(100, Math.max(0, 100 - (waterPerAcre / 100)));
  
      const totalFertilizer = field.fertilizerHistory.reduce((sum, record) => sum + record.amount, 0);
      const fertilizerPerAcre = totalFertilizer / fieldSize || 0;
      const organicScore = Math.min(100, Math.max(0, 100 - (fertilizerPerAcre / 10)));
  
      const harvestWithWeather = field.harvestHistory.map(harvest => {
        const harvestDate = new Date(harvest.date).setHours(0, 0, 0, 0);
        const weatherConditions = weatherData.find(w => 
          new Date(w.date).setHours(0, 0, 0, 0) === harvestDate
        );
        
        let weatherMultiplier = 1;
        if (weatherConditions) {
          if (weatherConditions.weather.toLowerCase().includes('rain')) {
            weatherMultiplier = 0.9; // 10% penalty for harvesting in rain
          }
          if (weatherConditions.temp > 35) {
            weatherMultiplier *= 0.95; // 5% penalty for extreme heat
          }
        }
        
        return harvest.amount * weatherMultiplier;
      });
  
      const totalWeatherAdjustedHarvest = harvestWithWeather.reduce((sum, amount) => sum + amount, 0);
      const harvestPerAcre = totalWeatherAdjustedHarvest / fieldSize || 0;
      const harvestEfficiency = Math.min(100, Math.max(0, (harvestPerAcre / 50) * 100));
  
      return {
        waterEfficiency: waterEfficiency * (avgWaterEfficiency / 100),
        organicScore,
        harvestEfficiency
      };
    };
  
    const fieldMetrics = filteredFields.map(calculateFieldMetrics);
  
    const avgWaterEfficiency = fieldMetrics.reduce((sum, metrics) => sum + metrics.waterEfficiency, 0) / filteredFields.length;
    const avgOrganicScore = fieldMetrics.reduce((sum, metrics) => sum + metrics.organicScore, 0) / filteredFields.length;
    const avgHarvestEfficiency = fieldMetrics.reduce((sum, metrics) => sum + metrics.harvestEfficiency, 0) / filteredFields.length;
  
    const currentWeather = weatherData[0];
    let weatherMultiplier = 1;
    
    if (currentWeather) {
      if (currentWeather.weather.toLowerCase().includes('rain')) {
        weatherMultiplier = 0.95; // Slight penalty during rainy periods
      }
      if (currentWeather.temp > 35 || currentWeather.temp < 5) {
        weatherMultiplier *= 0.95; // Penalty for extreme temperatures
      }
    }
  
    const overallScore = Math.round(
      ((avgWaterEfficiency * 0.4) +
      (avgOrganicScore * 0.4) +
      (avgHarvestEfficiency * 0.2)) *
      weatherMultiplier
    );
  
    return (
      <div className="text-center">
        <div className="text-6xl font-bold mb-4" style={{
          color: overallScore >= 80 ? '#16a34a' : 
                 overallScore >= 60 ? '#ca8a04' : '#dc2626'
        }}>
          {overallScore}
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Water Efficiency</p>
            <p className="font-medium text-blue-600">
              {Math.round(avgWaterEfficiency)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">Organic Practices</p>
            <p className="font-medium text-green-600">
              {Math.round(avgOrganicScore)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">Harvest Efficiency</p>
            <p className="font-medium text-yellow-600">
              {Math.round(avgHarvestEfficiency)}%
            </p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p className="mb-2">Recommendations:</p>
          <ul className="text-left list-disc pl-4 space-y-1">
            {avgWaterEfficiency < 80 && (
              <li>Consider implementing drip irrigation to improve water efficiency</li>
            )}
            {avgOrganicScore < 80 && (
              <li>Explore organic fertilizer alternatives</li>
            )}
            {avgHarvestEfficiency < 80 && (
              <li>Review crop density and soil health management</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const WeatherPreview = () => {
    const weatherInfo = useMemo<WeatherData[]>(() => {
      return weatherData?.slice(0, 5) || [];
    }, [weatherData]);
  
    return (
      <div className="space-y-4">
        {weatherInfo && weatherInfo.length > 0 ? (
          <div className="grid grid-cols-5 gap-2">
            {weatherInfo.map((day: WeatherData, index: number) => (
              <div key={index} className="text-center p-1 border rounded">
                <p className="text-xs font-medium truncate">{day.date}</p>
                <p className="text-xl my-1">{day.icon}</p>
                <p className="text-xs text-gray-600 truncate">{day.weather}</p>
                <p className="text-sm font-bold">{Math.round(day.temp)}°F</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            Loading weather data...
          </div>
        )}
      </div>
    );
  };
  

const CropPlan = () => {
  const [newScheduleItem, setNewScheduleItem] = useState<ScheduleItem>({
    id: Date.now(),
    cropId: 0,
    type: 'water',
    date: '',
    notes: ''
  });

  const handleAddScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleItems([...scheduleItems, newScheduleItem]);
    setIsAddingScheduleItem(false);
    setNewScheduleItem({
      id: Date.now(),
      cropId: 0,
      type: 'water',
      date: '',
      notes: ''
    });
  };

  const sortedScheduleItems = useMemo(() => {
    return [...scheduleItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [scheduleItems]);

  const ScheduleContent = () => (
    <>
      <div className="space-y-2">
        {sortedScheduleItems.length > 0 ? (
          sortedScheduleItems.map(item => {
            const field = fields.find(f => f.id === item.cropId);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 border rounded bg-white"
              >
                <div className="flex items-center gap-2">
                  {item.type === 'water' && <Droplet className="h-4 w-4 text-blue-500" />}
                  {item.type === 'fertilize' && <Leaf className="h-4 w-4 text-green-500" />}
                  {item.type === 'harvest' && <LayoutDashboard className="h-4 w-4 text-purple-500" />}
                  <div>
                    <p className="font-medium">{field?.name} - {item.type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString()} {item.notes && `- ${item.notes}`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteScheduleItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-4">
            No tasks scheduled. Click "Add Task" to get started.
          </div>
        )}
      </div>

      <Dialog open={isAddingScheduleItem} onOpenChange={setIsAddingScheduleItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddScheduleItem} className="space-y-4">
            <div>
              <Label>Field</Label>
              <select 
                className="w-full p-2 border rounded"
                value={newScheduleItem.cropId}
                onChange={(e) => setNewScheduleItem({ ...newScheduleItem, cropId: parseInt(e.target.value) })}
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
                value={newScheduleItem.type}
                onChange={(e) => setNewScheduleItem({ ...newScheduleItem, type: e.target.value as 'water' | 'fertilize' | 'harvest' })}
                required
              >
                <option value="">Select Type</option>
                <option value="water">Water</option>
                <option value="fertilize">Fertilize</option>
                <option value="harvest">Harvest</option>
              </select>
            </div>
            <div>
              <Label>Date</Label>
              <Input 
                type="date"
                value={newScheduleItem.date}
                onChange={(e) => setNewScheduleItem({ ...newScheduleItem, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input 
                value={newScheduleItem.notes}
                onChange={(e) => setNewScheduleItem({ ...newScheduleItem, notes: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">Add Schedule Item</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );

  // When used in the main CropPlan tab
  if (activeTab === 'cropplan') {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Scheduled Tasks</CardTitle>
            <Button onClick={() => setIsAddingScheduleItem(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScheduleContent />
        </CardContent>
      </Card>
    );
  }

  // When used in the overview tab - removed button from header
  return <ScheduleContent />;
};

  const HistoryPage = () => {
    const allHistory = useMemo(() => {
      const history = fields.flatMap(field => [
        ...field.waterHistory.map(usage => ({
          type: 'Water Usage',
          date: new Date(usage.date),
          field: field.name,
          amount: `${usage.amount} gallons`,
          icon: <Droplet className="h-4 w-4 text-blue-500" />,
          color: 'blue',
          fieldId: field.id,
          usage
        })),
        ...field.fertilizerHistory.map(fertilizer => ({
          type: 'Fertilizer Usage',
          date: new Date(fertilizer.date),
          field: field.name,
          amount: `${fertilizer.amount} lbs`,
          icon: <Leaf className="h-4 w-4 text-green-500" />,
          color: 'green',
          fieldId: field.id,
          fertilizer
        })),
        ...field.harvestHistory.map(harvest => ({
          type: 'Harvest',
          date: new Date(harvest.date),
          field: field.name,
          amount: `${harvest.amount} bushels`,
          icon: <LayoutDashboard className="h-4 w-4 text-purple-500" />,
          color: 'purple',
          fieldId: field.id,
          harvest
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
          setActiveDialog('water'); // Use activeDialog instead
          break;
        case 'Fertilizer Usage':
          setEditingFertilizer(entry.fertilizer);
          setNewFertilizer({ fieldId: entry.fieldId.toString(), type: entry.fertilizer.type, amount: entry.fertilizer.amount.toString(), date: entry.fertilizer.date });
          setIsEditingFertilizer(true);
          setActiveDialog('fertilizer'); // Use activeDialog instead
          break;
        case 'Harvest':
          setEditingHarvest(entry.harvest);
          setNewHarvest({ fieldId: entry.fieldId.toString(), amount: entry.harvest.amount.toString(), date: entry.harvest.date });
          setIsEditingHarvest(true);
          setActiveDialog('harvest'); // Use activeDialog instead
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
              <div key={index} className={`p-2 border-l-4 border-${entry.color}-500 rounded`}>
                <div className="flex items-center gap-2">
                  {entry.icon}
                  <p><strong>{entry.type}</strong></p>
                </div>
                <p><strong>Field:</strong> {entry.field}</p>
                <p><strong>Date:</strong> {entry.date.toLocaleDateString()}</p>
                <p><strong>Amount:</strong> {entry.amount}</p>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const Instructions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h2 className="font-bold">Overview</h2>
            <p>In the Overview tab, you can quickly record water usage, fertilizer applications, and harvests. You can also view the sustainability score and a 10-day weather preview.</p>
          </div>
          <div>
            <h2 className="font-bold">Water Management</h2>
            <p>In the Water Management tab, you can view a detailed report of water usage for each field. Ensure you have added fields in the "Crops" tab before recording water usage in the "Overview" tab.</p>
          </div>
          <div>
            <h2 className="font-bold">Crops</h2>
            <p>In the Crops tab, you can manage fields, record fertilizer applications, and harvests. Add new fields here before tracking water usage or harvests in the "Overview" tab.</p>
          </div>
          <div>
            <h2 className="font-bold">Tasks/Issues</h2>
            <p>In the Tasks/Issues tab, you can report and track issues such as pests, diseases, and other problems affecting your fields. You can also resolve reported issues here.</p>
          </div>
          <div>
            <h2 className="font-bold">Reports</h2>
            <p>In the Reports tab, you can view detailed reports on field performance, including total water usage, fertilizer used, and harvest amounts. Ensure you have recorded activities in the "Overview" tab to see comprehensive reports.</p>
          </div>
          <div>
            <h2 className="font-bold">History</h2>
            <p>In the History tab, you can view and edit the history of water usage, fertilizer applications, and harvests for each field. Click the edit button to pull up the edit/add form popup.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ReportsComponent = () => {
    // Generate report data for the selected field or all fields
    const reportData = useMemo(() => {
      const filtered = selectedFieldForReport === 'all' 
        ? fields 
        : fields.filter(f => f.id.toString() === selectedFieldForReport);
  
      const waterData = filtered.flatMap(field => 
        field.waterHistory.map(usage => ({
          date: new Date(usage.date).toLocaleDateString(),
          type: 'Water Usage',
          amount: usage.amount,
          field: field.name
        }))
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
      const fertilizerData = filtered.flatMap(field => 
        field.fertilizerHistory.map(usage => ({
          date: new Date(usage.date).toLocaleDateString(),
          type: 'Fertilizer',
          amount: usage.amount,
          field: field.name
        }))
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
      const harvestData = filtered.flatMap(field => 
        field.harvestHistory.map(harvest => ({
          date: new Date(harvest.date).toLocaleDateString(),
          type: 'Harvest',
          amount: harvest.amount,
          field: field.name
        }))
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
      return {
        water: waterData,
        fertilizer: fertilizerData,
        harvest: harvestData,
        totals: {
          water: waterData.reduce((sum, item) => sum + item.amount, 0),
          fertilizer: fertilizerData.reduce((sum, item) => sum + item.amount, 0),
          harvest: harvestData.reduce((sum, item) => sum + item.amount, 0)
        }
      };
    }, [fields, selectedFieldForReport]);
  
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Crop Performance Report</CardTitle>
              <select
                className="border rounded p-2"
                value={selectedFieldForReport}
                onChange={(e) => setSelectedFieldForReport(e.target.value)}
              >
                <option value="all">All Crops</option>
                {fields.map(field => (
                  <option key={field.id} value={field.id.toString()}>{field.name}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Water Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{reportData.totals.water.toLocaleString()} gal</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Fertilizer Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{reportData.totals.fertilizer.toLocaleString()} lbs</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Total Harvest</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{reportData.totals.harvest.toLocaleString()} bushels</p>
                </CardContent>
              </Card>
            </div>
  
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" allowDuplicatedCategory={false} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    data={reportData.water}
                    dataKey="amount"
                    name="Water (gal)"
                    stroke="#3b82f6"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    data={reportData.harvest}
                    dataKey="amount"
                    name="Harvest (bushels)"
                    stroke="#ca8a04"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  

  return (
    <div>
      <div className="p-6 max-w-7xl mx-auto bg-white dark:bg-gray-900 dark:text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Farm Management Dashboard</h1>

          <Tabs defaultValue="overview" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList className="hidden md:flex">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="water">Water Management</TabsTrigger>
                <TabsTrigger value="crops">Crops</TabsTrigger>
                <TabsTrigger value="cropplan">Crop Plan</TabsTrigger>
                <TabsTrigger value="issues">Tasks/Issues</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="instructions"><Info className="h-4 w-4 mr-2" />Instructions</TabsTrigger>
              </TabsList>
              <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4 h-[300px]">
                  <CardHeader className="p-2">
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-2">
                      <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={() => setActiveDialog('water')}>
                        <Droplet className="h-4 w-4 mr-2" />
                        Record Water Usage
                      </Button>
                      <Button className="w-full bg-green-500 hover:bg-green-600" onClick={() => setActiveDialog('fertilizer')}>
                        <Leaf className="h-4 w-4 mr-2" />
                        Record Fertilizer
                      </Button>
                      <Button className="w-full bg-purple-500 hover:bg-purple-600" onClick={() => setActiveDialog('harvest')}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Record Harvest
                      </Button>
                      
                      {/* Add Quick Action Dialogs */}
                      <Dialog open={activeDialog === 'water'} onOpenChange={() => setActiveDialog(null)}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Water Usage</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddWaterUsage} className="space-y-4">
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
                            <Button type="submit" className="w-full">Record Water Usage</Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={activeDialog === 'fertilizer'} onOpenChange={() => setActiveDialog(null)}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Fertilizer Usage</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddFertilizer} className="space-y-4">
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
                                placeholder="Fertilizer type"
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
                            <Button type="submit" className="w-full">Record Fertilizer Usage</Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={activeDialog === 'harvest'} onOpenChange={() => setActiveDialog(null)}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Harvest</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddHarvest} className="space-y-4">
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
                            <Button type="submit" className="w-full">Record Harvest</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-4 h-[300px]">
                  <CardHeader className="p-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Sustainability Score</CardTitle>
                      <select
                        className="w-full max-w-[200px] p-2 border rounded"
                        value={selectedFieldForSustainability}
                        onChange={(e) => setSelectedFieldForSustainability(e.target.value)}
                      >
                        <option value="all">All Crops</option>
                        {fields.map(field => (
                          <option key={field.id} value={field.id.toString()}>{field.name}</option>
                        ))}
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2">
                    {(() => {
                      const filteredFields = fields.filter(field => 
                        selectedFieldForSustainability === 'all' || 
                        field.id.toString() === selectedFieldForSustainability
                      );
                      
                      const hasActivity = filteredFields.some(f => 
                        f.waterHistory.length > 0 || 
                        f.fertilizerHistory.length > 0 || 
                        f.harvestHistory.length > 0
                      );
                
                      if (filteredFields.length === 0) {
                        return (
                          <div className="text-center text-gray-500">
                            No crops added yet. Add crops to see sustainability metrics.
                          </div>
                        );
                      }
                
                      if (!hasActivity) {
                        return (
                          <div className="text-center text-gray-500">
                            No activity recorded yet. Add water usage, fertilizer, or harvest data to see sustainability metrics.
                          </div>
                        );
                      }
                
                      return calculateSustainabilityMetrics(filteredFields);
                    })()}
                  </CardContent>
                </Card>

                <Card className="p-4 h-[300px]">
                  <CardHeader className="p-2">
                    <CardTitle>Weather Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <WeatherPreview />
                  </CardContent>
                </Card>

                <Card className="p-4 h-[300px] overflow-auto">
                  <CardHeader className="p-2">
                    <CardTitle>Tasks</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <TaskManager />
                  </CardContent>
                </Card>

                <Card className="p-4 h-[300px] overflow-auto">
                  <CardHeader className="p-2">
                    <CardTitle>Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <IssueManager />
                  </CardContent>
                </Card>

                <Card className="p-4 h-[300px] overflow-auto">
                  <CardHeader className="p-2">
                    <CardTitle>Upcoming Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <CropPlan />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="issues">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaskManager />
                <IssueManager />
              </div>
            </TabsContent>

            <TabsContent value="water">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Water Usage Tracker</CardTitle>
                      <select
                        className="border rounded p-2"
                        value={selectedFieldForWater}
                        onChange={(e) => setSelectedFieldForWater(e.target.value)}
                      >
                        <option value="all">All Crops</option>
                        {fields.map(field => (
                          <option key={field.id} value={field.id.toString()}>{field.name}</option>
                        ))}
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {fields.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={fields
                            .filter(field => selectedFieldForWater === 'all' || field.id.toString() === selectedFieldForWater)
                            .flatMap(field => 
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
                  onClick={() => setIsAddingField(true)}
                  className="mb-4"
                >
                  Add New Crop
                </Button>

                <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Crop</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddField} className="space-y-4">
                      <div>
                        <Label>Crop Name</Label>
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
                        Add Crop
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditingField} onOpenChange={setIsEditingField}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Crop</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditField} className="space-y-4">
                      <div>
                        <Label>Crop Name</Label>
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
                            <p className="text-gray-500">Crop: {field.crop}</p>
                            <p className="text-gray-500">Size: {field.size.toLocaleString()} acres</p>
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
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingField(field);
                                  setNewField({ name: field.name, size: field.size, crop: field.crop });
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
                        No crops added yet. Click "Add New Crop" to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-4">
                <ReportsComponent />
              </div>
            </TabsContent>

            <TabsContent value="instructions">
              <Instructions />
            </TabsContent>

            <TabsContent value="history">
              <HistoryPage />
            </TabsContent>

            <TabsContent value="cropplan">
              <CropPlan />
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

export default DefaultComponent;
