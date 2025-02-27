// Financial data type definitions

export interface FinancialEntry {
  id: number;
  farmId: number;
  date: string;
  type: string;
  amount: number;
  category: 'income' | 'expense';
  description?: string;
}

export interface FinancialGoal {
  id: number;
  title: string;
  amount: number;
  deadline: string;
  progress: number;
}

export interface MonthlyFinancialData {
  month: number;
  income: number;
  expenses: number;
  profit: number;
}

export interface FinancialProjection {
  id: number;
  scenario: string;
  description: string;
  year: number;
  monthlyData: MonthlyFinancialData[];
}

export interface SustainabilityTrend {
  period: string;
  score: number;
}

export interface SustainabilityComparison {
  category: string;
  yours: number;
  average: number;
  target: number;
}

export interface SustainabilityMonthlyData {
  name: string;
  waterEfficiency: number;
  organicPractices: number;
  soilHealth: number;
}

export interface SustainabilityReportData {
  overallScore: number;
  metrics: {
    waterEfficiency: number;
    organicScore: number;
    harvestEfficiency: number;
    soilQuality: number;
    cropRotation: number;
    [key: string]: number;
  };
  waterSavings: number;
  chemicalReduction: number;
  organicPracticesAdoption: number;
  recommendations: string[];
  trends: SustainabilityTrend[];
  monthlyData: SustainabilityMonthlyData[];
  comparisonData: SustainabilityComparison[];
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  roi: number;
  farmSummaries: FarmFinancialSummary[];
  monthlyData: MonthlyFinancialData[];
  incomePieData: { name: string; value: number }[];
  expensePieData: { name: string; value: number }[];
  updatedGoals: FinancialGoal[];
}

export interface FarmFinancialSummary {
  farmId: number;
  farmName: string;
  income: number;
  expenses: number;
  profit: number;
}

// Performance report data types
export interface YieldData {
  name: string;
  current: number;
  previous: number;
  target: number;
}

export interface WaterEfficiencyData {
  date: string;
  usage: number;
  optimal: number;
  efficiency: number;
}

export interface CostCategoryData {
  name: string;
  value: number;
}

export interface QualityMetricData {
  subject: string;
  A: number;
  B: number;
  fullMark: number;
}

export interface PerformanceData {
  yields: YieldData[];
  water: WaterEfficiencyData[];
  costs: CostCategoryData[];
  quality: QualityMetricData[];
}
