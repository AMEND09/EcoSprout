import React from 'react';
import { Field, WeatherData } from './interfaces';
import { calculateWaterEfficiency } from './utilities';

interface SustainabilityScoreCardProps {
  fields: Field[];
  weatherData: WeatherData[];
  filteredFields: Field[];
}

const SustainabilityScoreCard: React.FC<SustainabilityScoreCardProps> = ({ 
  filteredFields, 
  weatherData 
}) => {
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
          weatherMultiplier = 0.9;
        }
        if (weatherConditions.temp > 35) {
          weatherMultiplier *= 0.95;
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
      weatherMultiplier = 0.95;
    }
    if (currentWeather.temp > 35 || currentWeather.temp < 5) {
      weatherMultiplier *= 0.95;
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

export default SustainabilityScoreCard;
