// src/components/charts/NetWorthChart.tsx

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
import { YearlyProjection } from '@/types/calculator';

interface NetWorthChartProps {
  data: YearlyProjection[];
}

export function NetWorthChart({ data }: NetWorthChartProps) {
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
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{`Year ${label}`}</p>
          <p className="text-green-500">
            {`Rent Net Worth: ${formatCurrency(payload[0].value)}`}
          </p>
          <p className="text-purple-500">
            {`Buy Net Worth: ${formatCurrency(payload[1].value)}`}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Advantage: {payload[1].value > payload[0].value ? 'Buying' : 'Renting'} by {formatCurrency(Math.abs(payload[1].value - payload[0].value))}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          Net Worth Impact Over Time
        </h3>
        <p className="text-sm text-gray-300">
          Wealth-building comparison: Home equity vs Investment portfolio
        </p>
      </div>
      
             <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 12, fill: '#e5e7eb' }}
            axisLine={{ stroke: '#6b7280' }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12, fill: '#e5e7eb' }}
            axisLine={{ stroke: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#e5e7eb' }} />
          
          <Area
            type="monotone"
            dataKey="rentNetWorth"
            stackId="1"
            stroke="#22c55e"
            strokeWidth={3}
            fill="#22c55e"
            fillOpacity={0.3}
            name="Rent + Invest Net Worth"
          />
          <Area
            type="monotone"
            dataKey="buyNetWorth"
            stackId="2"
            stroke="#a855f7"
            strokeWidth={3}
            fill="#a855f7"
            fillOpacity={0.3}
            name="Home Ownership Net Worth"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-3 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
        <p className="text-xs text-blue-200">
          💡 <strong>Tip:</strong> Hover over the chart to see detailed values for each year!
        </p>
      </div>
    </div>
  );
}