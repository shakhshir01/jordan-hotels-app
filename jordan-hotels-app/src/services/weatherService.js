// Weather Integration Service
export const getWeatherForDestination = async (destination) => {
  const weatherData = {
    'Dead Sea': { temp: 28, condition: 'Sunny', humidity: 35, windSpeed: 12, forecast: [28, 29, 27, 26, 30, 28, 29], rain: 0 },
    'Amman': { temp: 18, condition: 'Partly Cloudy', humidity: 45, windSpeed: 8, forecast: [18, 17, 19, 20, 18, 17, 19], rain: 5 },
    'Petra': { temp: 22, condition: 'Clear', humidity: 30, windSpeed: 10, forecast: [22, 23, 21, 20, 24, 22, 23], rain: 0 },
    'Aqaba': { temp: 26, condition: 'Sunny', humidity: 40, windSpeed: 15, forecast: [26, 27, 28, 26, 27, 28, 26], rain: 0 },
    'Wadi Rum': { temp: 20, condition: 'Clear', humidity: 20, windSpeed: 18, forecast: [20, 21, 19, 18, 22, 20, 21], rain: 0 },
  };
  return weatherData[destination] || { temp: 25, condition: 'Unknown', humidity: 50, windSpeed: 10, forecast: [25, 25, 25, 25, 25, 25, 25], rain: 0 };
};

export const getPackingTips = (weather) => {
  const tips = [];
  if (weather.temp > 25) tips.push('Light, breathable clothing');
  if (weather.temp < 20) tips.push('Warm jacket or sweater');
  if (weather.rain > 10) tips.push('Raincoat or umbrella');
  if (weather.humidity > 60) tips.push('Moisture-wicking fabrics');
  if (weather.windSpeed > 15) tips.push('Windproof jacket');
  return tips.length > 0 ? tips : ['Casual comfortable clothing'];
};

export const getBestSeasonInfo = (destination) => {
  const seasons = {
    'Dead Sea': 'Oct-Apr (mild winters)',
    'Amman': 'Sep-Nov, Mar-May (spring/fall)',
    'Petra': 'Oct-Apr (cooler temps)',
    'Aqaba': 'Oct-Apr (perfect diving season)',
    'Wadi Rum': 'Oct-Apr (cool desert nights)',
  };
  return seasons[destination] || 'Year-round destination';
};
