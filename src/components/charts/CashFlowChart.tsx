// src/components/charts/CashFlowChart.tsx

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { YearlyProjection } from '@/types/calculator';

interface CashFlowChartProps {
  data: YearlyProjection[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{`Year ${label}`}</p>
          <p className="text-red-500">
            {`Rent Outflow: ${formatCurrency(payload[0].value)}`}
          </p>
          <p className="text-blue-500">
            {`Buy Outflow: ${formatCurrency(payload[1].value)}`}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Difference: {formatCurrency(payload[1].value - payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Transform data to show positive values (since all cash flows are negative outflows)
  const chartData = data.map(item => ({
    ...item,
    rentOutflow: Math.abs(item.rentCashFlow),
    buyOutflow: Math.abs(item.buyCashFlow)
  }));

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Annual Cash Outflow
        </h3>
        <p className="text-sm text-gray-600">
          Understand your yearly budget impact
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          
          <Bar
            dataKey="rentOutflow"
            fill="#ef4444"
            name="Annual Rent Cost"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="buyOutflow"
            fill="#3b82f6"
            name="Annual Ownership Cost"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}