import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Sun, Cloud, CloudRain, Eye, TrendingUp, Activity, Zap, Play, Pause, RotateCcw, Download, Bell, Clock, Target, Settings, MapPin, Calculator, X, Moon } from 'lucide-react';

const SolarDashboard = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [forecastData, setForecastData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(7);
  const [selectedLocation, setSelectedLocation] = useState('mumbai');
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [showCalculator, setShowCalculator] = useState(false);

  const locations = {
    mumbai: { name: 'Mumbai, India', multiplier: 1.0, emoji: '🏙️', peakSunHours: 5.2, avgTemperature: 27 },
    delhi: { name: 'New Delhi, India', multiplier: 0.95, emoji: '🏛️', peakSunHours: 5.8, avgTemperature: 25 },
    bangalore: { name: 'Bangalore, India', multiplier: 1.05, emoji: '🌳', peakSunHours: 5.5, avgTemperature: 24 },
    rajasthan: { name: 'Jaisalmer, Rajasthan', multiplier: 1.2, emoji: '🏜️', peakSunHours: 6.5, avgTemperature: 30 }
  };

  const themes = {
    blue: { primary: 'from-blue-500 to-indigo-600', background: 'from-blue-50 via-indigo-50 to-purple-50' },
    green: { primary: 'from-green-500 to-emerald-600', background: 'from-green-50 via-emerald-50 to-teal-50' },
    orange: { primary: 'from-orange-500 to-red-600', background: 'from-orange-50 via-amber-50 to-yellow-50' },
    purple: { primary: 'from-purple-500 to-violet-600', background: 'from-purple-50 via-violet-50 to-indigo-50' }
  };

  const generateSolarData = useCallback(() => {
    const data = [];
    const baseDate = new Date();
    const location = locations[selectedLocation];
    const hoursToGenerate = selectedTimeRange * 24;
    
    for (let i = 0; i < hoursToGenerate; i++) {
      const date = new Date(baseDate.getTime() + i * 60 * 60 * 1000);
      const hour = date.getHours();
      
      const solarElevation = Math.max(0, Math.sin((hour - 6) * Math.PI / 12));
      
      const weatherRandom = Math.random();
      let weatherType = 'sunny';
      if (weatherRandom < 0.5) weatherType = 'sunny';
      else if (weatherRandom < 0.75) weatherType = 'partly_cloudy';
      else if (weatherRandom < 0.9) weatherType = 'cloudy';
      else weatherType = 'rainy';
      
      const weatherMultiplier = { 'sunny': 1, 'partly_cloudy': 0.7, 'cloudy': 0.3, 'rainy': 0.1 }[weatherType];
      
      const baseIrradiance = 1000 * solarElevation * location.multiplier;
      const irradiance = Math.max(0, baseIrradiance * weatherMultiplier + (Math.random() - 0.5) * 50);
      
      const temperature = location.avgTemperature + 8 * Math.sin((hour - 6) * Math.PI / 12) + (Math.random() - 0.5) * 5;
      const powerGenerated = (irradiance * 0.22 * 100) / 1000;
      
      let predictedPower = powerGenerated;
      const modelError = (Math.random() - 0.5) * 0.2;
      const modelMultipliers = { 'persistence': 0.15, 'arima': 0.12, 'neural_network': 0.08, 'ensemble': 0.05 };
      
      predictedPower = powerGenerated + modelError * powerGenerated * (modelMultipliers[selectedModel] || 0.1);
      
      data.push({
        time: date.toISOString(),
        hour: hour,
        actual: Math.max(0, powerGenerated),
        predicted: Math.max(0, predictedPower),
        irradiance: Math.max(0, irradiance),
        temperature: temperature,
        weather: weatherType,
        efficiency: 85 + Math.random() * 10
      });
    }
    return data;
  }, [selectedTimeRange, selectedLocation, selectedModel]);

  useEffect(() => {
    const data = generateSolarData();
    setForecastData(data);
    setCurrentDataIndex(0);
  }, [generateSolarData]);

  useEffect(() => {
    let interval;
    if (isSimulationRunning && forecastData.length > 0) {
      interval = setInterval(() => {
        setCurrentDataIndex(prev => {
          const next = prev + 1;
          if (next >= forecastData.length) {
            setIsSimulationRunning(false);
            return prev;
          }
          
          if (alertsEnabled && Math.random() < 0.1) {
            setNotifications(prev => [...prev.slice(-3), { 
              id: Date.now(), 
              message: 'System running optimally', 
              timestamp: new Date() 
            }]);
          }
          
          return next;
        });
      }, 1000 / simulationSpeed);
    }
    return () => clearInterval(interval);
  }, [isSimulationRunning, simulationSpeed, forecastData.length, alertsEnabled]);

  const exportData = () => {
    const csvContent = [
      ['Time', 'Actual (kW)', 'Predicted (kW)', 'Temperature (°C)', 'Weather'],
      ...forecastData.map(d => [
        d.time, d.actual.toFixed(2), d.predicted.toFixed(2), d.temperature.toFixed(1), d.weather
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar_forecast_${selectedLocation}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const WeatherIcon = ({ weather, size = 'w-6 h-6' }) => {
    const iconClass = `${size} ${
      weather === 'sunny' ? 'text-yellow-500' :
      weather === 'partly_cloudy' ? 'text-gray-400' :
      weather === 'cloudy' ? 'text-gray-600' : 'text-blue-500'
    }`;
    const icons = { 'sunny': Sun, 'partly_cloudy': Cloud, 'cloudy': Cloud, 'rainy': CloudRain };
    const IconComponent = icons[weather] || Sun;
    return <IconComponent className={iconClass} />;
  };

  const CostCalculator = () => {
    const [panelCount, setPanelCount] = useState(20);
    const totalCapacity = (panelCount * 400) / 1000;
    const monthlyGeneration = totalCapacity * locations[selectedLocation].peakSunHours * 30;
    const monthlySavings = monthlyGeneration * 8;
    const paybackPeriod = 50000 / (monthlySavings * 12);

    if (!showCalculator) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-500" />
              Solar Cost Calculator
            </h3>
            <button onClick={() => setShowCalculator(false)} className="p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Panels: {panelCount}
                </label>
                <input
                  type="range" min="10" max="100" value={panelCount}
                  onChange={(e) => setPanelCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl">
              <h4 className="font-bold text-gray-800 mb-3">System Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Capacity:</span>
                  <span className="font-bold">{totalCapacity.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Generation:</span>
                  <span className="font-bold">{monthlyGeneration.toFixed(0)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Savings:</span>
                  <span className="font-bold text-green-600">₹{monthlySavings.toFixed(0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Payback Period:</span>
                  <span className="font-bold">{paybackPeriod.toFixed(1)} years</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentData = forecastData[currentDataIndex] || {};
  const todayData = forecastData.slice(Math.max(0, currentDataIndex - 23), currentDataIndex + 1);
  const totalEnergyToday = todayData.reduce((sum, d) => sum + d.actual, 0);
  const avgEfficiency = todayData.reduce((sum, d) => sum + d.efficiency, 0) / Math.max(todayData.length, 1);
  const peakPower = Math.max(...todayData.map(d => d.actual), 0);

  const ModelsTab = () => {
    const modelAccuracy = {
      persistence: { mape: 15.2, rmse: 1.1, r2: 0.85, description: 'Simple model using yesterday\'s pattern' },
      arima: { mape: 12.8, rmse: 0.9, r2: 0.89, description: 'Time series statistical model' },
      neural_network: { mape: 8.5, rmse: 0.6, r2: 0.94, description: 'Deep learning neural network' },
      ensemble: { mape: 6.2, rmse: 0.4, r2: 0.97, description: 'Combined multiple ML models' }
    };

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
          <h3 className="text-3xl font-bold mb-8">AI Model Performance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(modelAccuracy).map(([model, metrics]) => (
              <div 
                key={model}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 ${
                  selectedModel === model 
                    ? 'border-blue-500 bg-blue-50 shadow-xl' 
                    : 'border-gray-200 bg-white/40 hover:bg-white/60'
                }`}
                onClick={() => setSelectedModel(model)}
              >
                <h4 className="font-bold text-lg text-gray-800 capitalize mb-2">
                  {model.replace('_', ' ')}
                </h4>
                <p className="text-xs text-gray-600 mb-4">{metrics.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">MAPE:</span>
                    <span className="font-bold text-sm">{metrics.mape}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">RMSE:</span>
                    <span className="font-bold text-sm">{metrics.rmse} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">R²:</span>
                    <span className="font-bold text-sm">{metrics.r2}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={Object.entries(modelAccuracy).map(([model, metrics]) => ({
                model: model.replace('_', ' '),
                MAPE: metrics.mape,
                RMSE: metrics.rmse * 10,
                'R² Score': metrics.r2 * 100
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="model" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="MAPE" fill="#ef4444" name="MAPE (%)" />
              <Bar dataKey="RMSE" fill="#3b82f6" name="RMSE (×10)" />
              <Bar dataKey="R² Score" fill="#10b981" name="R² Score (×100)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const AnalyticsTab = () => {
    const weatherDistribution = [
      { name: 'Sunny', value: forecastData.filter(d => d.weather === 'sunny').length, color: '#f59e0b' },
      { name: 'Partly Cloudy', value: forecastData.filter(d => d.weather === 'partly_cloudy').length, color: '#6b7280' },
      { name: 'Cloudy', value: forecastData.filter(d => d.weather === 'cloudy').length, color: '#374151' },
      { name: 'Rainy', value: forecastData.filter(d => d.weather === 'rainy').length, color: '#3b82f6' }
    ];

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-3xl shadow-2xl text-white">
            <h4 className="text-lg font-bold mb-2">Total Data Points</h4>
            <p className="text-3xl font-bold">{forecastData.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-3xl shadow-2xl text-white">
            <h4 className="text-lg font-bold mb-2">Total Energy</h4>
            <p className="text-3xl font-bold">{(forecastData.reduce((sum, d) => sum + d.actual, 0)).toFixed(0)} kWh</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-3xl shadow-2xl text-white">
            <h4 className="text-lg font-bold mb-2">Peak Power</h4>
            <p className="text-3xl font-bold">{Math.max(...forecastData.map(d => d.actual), 0).toFixed(1)} kW</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-3xl shadow-2xl text-white">
            <h4 className="text-lg font-bold mb-2">Avg Efficiency</h4>
            <p className="text-3xl font-bold">{(forecastData.reduce((sum, d) => sum + d.efficiency, 0) / Math.max(forecastData.length, 1)).toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
          <h3 className="text-2xl font-bold mb-6">Weather Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={weatherDistribution}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {weatherDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themes[selectedTheme].background}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className={`text-6xl font-bold bg-gradient-to-r ${themes[selectedTheme].primary} bg-clip-text text-transparent mb-6`}>
            Solar Energy Forecasting
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
          solar energy prediction system with real-time analytics
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/20">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Eye },
              { id: 'models', label: 'AI Models', icon: TrendingUp },
              { id: 'analytics', label: 'Analytics', icon: Activity }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentTab(id)}
                className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                  currentTab === id
                    ? `bg-gradient-to-r ${themes[selectedTheme].primary} text-white shadow-2xl transform scale-105`
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {currentTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
              <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${themes[selectedTheme].primary} rounded-2xl flex items-center justify-center`}>
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Mission Control</h2>
                    <p className="text-gray-600">Advanced solar forecasting system</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSimulationRunning(!isSimulationRunning)}
                    className={`p-4 rounded-2xl transition-all ${
                      isSimulationRunning 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    }`}
                  >
                    {isSimulationRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  
                  <button
                    onClick={() => {
                      setCurrentDataIndex(0);
                      setIsSimulationRunning(false);
                    }}
                    className="p-4 bg-gray-500 text-white rounded-2xl hover:bg-gray-600"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-4 rounded-2xl ${isDarkMode ? 'bg-yellow-500' : 'bg-gray-700'} text-white`}
                  >
                    {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <select 
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-2xl"
                >
                  {Object.entries(locations).map(([key, location]) => (
                    <option key={key} value={key}>
                      {location.emoji} {location.name}
                    </option>
                  ))}
                </select>
                
                <select 
                  value={selectedTimeRange} 
                  onChange={(e) => setSelectedTimeRange(parseInt(e.target.value))}
                  className="px-4 py-3 border-2 border-gray-200 rounded-2xl"
                >
                  <option value={1}>24 Hours</option>
                  <option value={7}>7 Days</option>
                  <option value={30}>30 Days</option>
                </select>
                
                <select 
                  value={selectedTheme} 
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-2xl"
                >
                  <option value="blue">Blue Theme</option>
                  <option value="green">Green Theme</option>
                  <option value="orange">Orange Theme</option>
                  <option value="purple">Purple Theme</option>
                </select>

                <button
                  onClick={() => setShowCalculator(true)}
                  className={`px-4 py-3 bg-gradient-to-r ${themes[selectedTheme].primary} text-white rounded-2xl flex items-center gap-2`}
                >
                  <Calculator className="w-5 h-5" />
                  Calculator
                </button>
                
                <button 
                  onClick={exportData}
                  className="px-6 py-3 bg-blue-600 text-white rounded-2xl flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-yellow-400 to-red-500 p-6 rounded-3xl shadow-2xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="w-8 h-8" />
                  <div className={`w-3 h-3 rounded-full ${isSimulationRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></div>
                </div>
                <p className="text-sm mb-1">Current Generation</p>
                <p className="text-4xl font-bold">{(currentData.actual || 0).toFixed(1)} kW</p>
                <p className="text-sm opacity-80">Hour: {currentData.hour || 0}:00</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-3xl shadow-2xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8" />
                  <span className="text-xs">Target: 800 kWh</span>
                </div>
                <p className="text-sm mb-1">Today's Energy</p>
                <p className="text-4xl font-bold">{totalEnergyToday.toFixed(0)} kWh</p>
                <p className="text-sm opacity-80">Peak: {peakPower.toFixed(1)} kW</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-3xl shadow-2xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <Sun className="w-8 h-8" />
                  <div className={`w-4 h-4 rounded-full ${avgEfficiency > 85 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                </div>
                <p className="text-sm mb-1">System Efficiency</p>
                <p className="text-4xl font-bold">{avgEfficiency.toFixed(1)}%</p>
                <p className="text-sm opacity-80">{(currentData.temperature || 0).toFixed(1)}°C</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-3xl shadow-2xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <WeatherIcon weather={currentData.weather} size="w-8 h-8" />
                  <span className="text-xs">{locations[selectedLocation].emoji}</span>
                </div>
                <p className="text-sm mb-1">Solar Irradiance</p>
                <p className="text-4xl font-bold">{(currentData.irradiance || 0).toFixed(0)} W/m²</p>
                <p className="text-sm opacity-80 capitalize">{(currentData.weather || 'sunny').replace('_', ' ')}</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
              <h3 className="text-3xl font-bold mb-8">Solar Generation Forecast</h3>
              <ResponsiveContainer width="100%" height={500}>
                <AreaChart data={forecastData.slice(0, currentDataIndex + 24)}>
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#f59e0b" 
                    fill="url(#actualGradient)"
                    name="Actual Generation"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5" 
                    name="ML Prediction"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {notifications.length > 0 && (
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Bell className="w-6 h-6 text-orange-500" />
                  System Alerts
                </h3>
                <div className="grid gap-4">
                  {notifications.slice(-3).map((notification) => (
                    <div key={notification.id} className="p-4 bg-blue-50 rounded-2xl border-l-4 border-blue-400">
                      <p className="font-semibold text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'models' && <ModelsTab />}
        {currentTab === 'analytics' && <AnalyticsTab />}

        <div className="text-center mt-16 p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${themes[selectedTheme].primary} rounded-2xl flex items-center justify-center`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-gray-800">
                Advanced Solar Forecasting System.
              </p>
              <p className="text-sm text-gray-600">
                Powered by Real-time data analytics
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span>Real-time ML predictions</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Multi-location support</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span>Advanced analytics dashboard</span>
            </div>
          </div>
        </div>
      </div>

      <CostCalculator />
    </div>
  );
};

export default SolarDashboard;