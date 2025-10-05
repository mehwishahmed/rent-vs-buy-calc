// src/components/charts/MonteCarloChart.tsx

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { MonteCarloResult } from '@/types/calculator';

interface MonteCarloChartProps {
  data: MonteCarloResult[];
}

export function MonteCarloChart({ data }: MonteCarloChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const yearData = data.find(d => d.year === label);
      if (!yearData) return null;

      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{`Year ${label}`}</p>
          <div className="mt-2 space-y-1">
            <div className="text-sm">
              <p className="text-green-600 font-medium">Rent + Invest Scenario:</p>
              <p>90% confidence: {formatCurrency(yearData.rentNetWorth.p10)} - {formatCurrency(yearData.rentNetWorth.p90)}</p>
              <p>Median: {formatCurrency(yearData.rentNetWorth.p50)}</p>
            </div>
            <div className="text-sm mt-2">
              <p className="text-purple-600 font-medium">Buy Scenario:</p>
              <p>90% confidence: {formatCurrency(yearData.buyNetWorth.p10)} - {formatCurrency(yearData.buyNetWorth.p90)}</p>
              <p>Median: {formatCurrency(yearData.buyNetWorth.p50)}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Transform data for stacked areas showing confidence bands
  const chartData = data.map(item => ({
    year: item.year,
    // Rent bands
    rentP10: item.rentNetWorth.p10,
    rentP25: item.rentNetWorth.p25,
    rentP50: item.rentNetWorth.p50,
    rentP75: item.rentNetWorth.p75,
    rentP90: item.rentNetWorth.p90,
    // Buy bands
    buyP10: item.buyNetWorth.p10,
    buyP25: item.buyNetWorth.p25,
    buyP50: item.buyNetWorth.p50,
    buyP75: item.buyNetWorth.p75,
    buyP90: item.buyNetWorth.p90,
  }));

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Monte Carlo Risk Analysis
        </h3>
        <p className="text-sm text-gray-600">
          Range of possible outcomes showing 50% and 80% confidence bands
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          
          {/* Rent confidence bands */}
          <Area
            type="monotone"
            dataKey="rentP90"
            stackId="rent"
            stroke="none"
            fill="#10b981"
            fillOpacity={0.1}
            name="Rent 90th percentile"
          />
          <Area
            type="monotone"
            dataKey="rentP75"
            stackId="rent"
            stroke="none"
            fill="#10b981"
            fillOpacity={0.2}
            name="Rent 75th percentile"
          />
          <Area
            type="monotone"
            dataKey="rentP50"
            stackId="rent"
            stroke="#10b981"
            strokeWidth={3}
            fill="#10b981"
            fillOpacity={0.3}
            name="Rent Median"
          />
          <Area
            type="monotone"
            dataKey="rentP25"
            stackId="rent"
            stroke="none"
            fill="#10b981"
            fillOpacity={0.2}
            name="Rent 25th percentile"
          />
          <Area
            type="monotone"
            dataKey="rentP10"
            stackId="rent"
            stroke="none"
            fill="#10b981"
            fillOpacity={0.1}
            name="Rent 10th percentile"
          />
          
          {/* Buy confidence bands */}
          <Area
            type="monotone"
            dataKey="buyP90"
            stackId="buy"
            stroke="none"
            fill="#8b5cf6"
            fillOpacity={0.1}
            name="Buy 90th percentile"
          />
          <Area
            type="monotone"
            dataKey="buyP75"
            stackId="buy"
            stroke="none"
            fill="#8b5cf6"
            fillOpacity={0.2}
            name="Buy 75th percentile"
          />
          <Area
            type="monotone"
            dataKey="buyP50"
            stackId="buy"
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="#8b5cf6"
            fillOpacity={0.3}
            name="Buy Median"
          />
          <Area
            type="monotone"
            dataKey="buyP25"
            stackId="buy"
            stroke="none"
            fill="#8b5cf6"
            fillOpacity={0.2}
            name="Buy 25th percentile"
          />
          <Area
            type="monotone"
            dataKey="buyP10"
            stackId="buy"
            stroke="none"
            fill="#8b5cf6"
            fillOpacity={0.1}
            name="Buy 10th percentile"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="bg-green-50 p-3 rounded">
          <h4 className="font-medium text-green-800">Rent + Invest</h4>
          <p>Darker bands show more likely outcomes. Market volatility affects investment returns.</p>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <h4 className="font-medium text-purple-800">Buy</h4>
          <p>Home price volatility creates uncertainty in equity building over time.</p>
        </div>
      </div>
    </div>
  );
}