// Farm-related type definitions

export interface WaterUsage {
  amount: number;
  date: string;
  efficiency?: number;
}

export interface FertilizerUsage {
  type: string;
  amount: number;
  date: string;
}

export interface Harvest {
  amount: number;
  date: string;
}

export interface CropRotation {
  crop: string;
  startDate: string;
  endDate: string;
}

export interface Farm {
  id: number;
  name: string;
  size: string;
  crop: string;
  waterHistory: WaterUsage[];
  fertilizerHistory: FertilizerUsage[];
  harvestHistory: Harvest[];
  soilType?: string;
  slopeRatio?: number;
  pesticides?: {
    type: string;
    amount: number;
    date: string;
    toxicity: number;
  }[];
  rotationHistory?: CropRotation[];
  organicMatter?: number;
  soilPH?: number;
  biodiversityScore?: number;
}
