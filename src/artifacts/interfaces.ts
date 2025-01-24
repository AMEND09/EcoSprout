export interface WaterUsage {
  amount: number;
  date: string;
  efficiency?: number;
}

export interface Field {
  id: number;
  name: string;
  size: string;
  crop: string;
  waterHistory: WaterUsage[];
  fertilizerHistory: any[];
  harvestHistory: any[];
}

export interface WeatherData {
  date: string;
  temp: number;
  weather: string;
  icon: string;
  precipitation?: number;
}

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  completed: boolean;
}

export interface Issue {
  id: number;
  fieldId?: number;
  type: string;
  description: string;
  severity: string;
  status: string;
  dateReported: Date;
}

export interface ConfirmDelete {
  id: number;
  type: string;
  date?: string;
}

export interface ScheduleItem {
  id: number;
  cropId: number;
  type: 'water' | 'fertilize' | 'harvest';
  date: string;
  notes: string;
}
