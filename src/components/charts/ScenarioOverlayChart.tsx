// src/components/charts/ScenarioOverlayChart.tsx

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Scenario } from '@/types/calculator';

interface ScenarioOverlayChartProps {
  scenarios: Scenario[];
  currentScenario?: {
    name: string;
    data: any[];
    color: string;
  };
}

export function ScenarioOverlayChart({ scenarios, currentScenario }: ScenarioOverlayChartProps) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(
    scenarios.slice(0, 3).map(s => s.id) // Show first 3 by default
  );
  const [viewMode, setViewMode] = useState<'netWorth' | 'cumulativeCost'>('netWorth');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleScenario = (scenarioId: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  // Prepare chart data combining all scenarios
  const maxYears = Math.max(
    ...scenarios.map(s => s.results.yearlyProjections.length),
    currentScenario?.data.length || 0
  );

  const chartData = Array.from({ length: maxYears }, (_, index) => {
    const year = index + 1;
    const dataPoint: any = { year };

    // Add selected scenarios
    scenarios
      .filter(s => selectedScenarios.includes(s.id))
      .forEach(scenario => {
        const projection = scenario.results.yearlyProjections[index];
        if (projection) {
          if (viewMode === 'netWorth') {
            dataPoint[`${scenario.name}_rent`] = projection.rentNetWorth;
            dataPoint[`${scenario.name}_buy`] = projection.buyNetWorth;
          } else {
            dataPoint[`${scenario.name}_rent`] = projection.totalRentPaid;
            dataPoint[`${scenario.name}_buy`] = projection.cumulativeOwnershipCost;
          }
        }
      });

    // Add current scenario if provided
    if (currentScenario && currentScenario.data[index]) {
      const projection = currentScenario.data[index];
      if (viewMode === 'netWorth') {
        dataPoint[`${currentScenario.name}_rent`] = projection.rentNetWorth;
        dataPoint[`${currentScenario.name}_buy`] = projection.buyNetWorth;
      } else {
        dataPoint[`${currentScenario.name}_rent`] = projection.totalRentPaid;
        dataPoint[`${currentScenario.name}_buy`] = projection.cumulativeOwnershipCost;
      }
    }

    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold">{`Year ${label}`}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {formatCurrency(entry.value)}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (scenarios.length === 0 && !currentScenario) {
    return (
      <div className="w-full bg-gray-50 p-8 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Scenario Comparison
        </h3>
        <p className="text-gray-600">
          Save scenarios to compare different assumptions side by side
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Scenario Comparison
        </h3>
        <p className="text-sm text-gray-600">
          Compare different scenarios to explore various assumptions
        </p>
      </div>
      
      {/* Controls */}
      <div className="mb-4 space-y-4">
        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('netWorth')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'netWorth' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Net Worth
          </button>
          <button
            onClick={() => setViewMode('cumulativeCost')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'cumulativeCost' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Cumulative Cost
          </button>
        </div>

        {/* Scenario Selection */}
        {scenarios.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Select scenarios to compare:</p>
            <div className="flex flex-wrap gap-2">
              {scenarios.map(scenario => (
                <label key={scenario.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedScenarios.includes(scenario.id)}
                    onChange={() => toggleScenario(scenario.id)}
                    className="mr-2"
                  />
                  <span 
                    className="px-2 py-1 rounded text-sm text-white"
                    style={{ backgroundColor: scenario.color }}
                  >
                    {scenario.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Add reference line at y=0 for net worth view */}
          {viewMode === 'netWorth' && (
            <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="2 2" />
          )}
          
          {/* Render lines for selected scenarios */}
          {scenarios
            .filter(s => selectedScenarios.includes(s.id))
            .map(scenario => [
              <Line
                key={`${scenario.id}_rent`}
                type="monotone"
                dataKey={`${scenario.name}_rent`}
                stroke={scenario.color}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name={`${scenario.name} (Rent)`}
              />,
              <Line
                key={`${scenario.id}_buy`}
                type="monotone"
                dataKey={`${scenario.name}_buy`}
                stroke={scenario.color}
                strokeWidth={3}
                dot={false}
                name={`${scenario.name} (Buy)`}
              />
            ])
          }
          
          {/* Current scenario */}
          {currentScenario && [
            <Line
              key="current_rent"
              type="monotone"
              dataKey={`${currentScenario.name}_rent`}
              stroke={currentScenario.color}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: currentScenario.color, r: 3 }}
              name={`${currentScenario.name} (Rent)`}
            />,
            <Line
              key="current_buy"
              type="monotone"
              dataKey={`${currentScenario.name}_buy`}
              stroke={currentScenario.color}
              strokeWidth={3}
              dot={{ fill: currentScenario.color, r: 3 }}
              name={`${currentScenario.name} (Buy)`}
            />
          ]}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Solid lines:</strong> Buy scenario | <strong>Dashed lines:</strong> Rent scenario</p>
      </div>
    </div>
  );
}