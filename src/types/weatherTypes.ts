// Weather-related type definitions

export interface WeatherData {
  date: string;
  temp: number;
  weather: string;
  icon: string;
  precipitation?: number;  // mm of rain
}
