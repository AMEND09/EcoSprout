import { WaterUsage, WeatherData } from './interfaces';

export const calculateWaterEfficiency = (
  waterUsage: WaterUsage,
  weatherData: WeatherData[],
): number => {
  const waterDate = new Date(waterUsage.date).setHours(0, 0, 0, 0);
  
  const dayWeather = weatherData.find(w => 
    new Date(w.date).setHours(0, 0, 0, 0) === waterDate
  );
  const previousDayWeather = weatherData.find(w => 
    new Date(w.date).setHours(0, 0, 0, 0) === waterDate - 86400000
  );

  let efficiencyScore = 100;

  // Apply penalties for watering during or after rain
  if (dayWeather?.weather.toLowerCase().includes('rain')) {
    efficiencyScore *= 0.5; // 50% penalty for watering during rain
  }

  if (previousDayWeather?.weather.toLowerCase().includes('rain')) {
    efficiencyScore *= 0.7; // 30% penalty for watering after rain
  }

  // Apply temperature-based penalties
  if (dayWeather?.temp) {
    if (dayWeather.temp > 30) { // Hot day
      efficiencyScore *= 0.9; // 10% penalty for evaporation
    } else if (dayWeather.temp < 10) { // Cold day
      efficiencyScore *= 0.95; // 5% penalty for slower absorption
    }
  }

  return efficiencyScore;
};
