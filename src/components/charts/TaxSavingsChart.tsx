// src/components/charts/TaxSavingsChart.tsx

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { YearlyProjection } from '@/types/calculator';

interface TaxSavingsChartProps {
  data: YearlyProjection[];
}

export function TaxSavingsChart({ data }: TaxSavingsChartProps) {
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
      const yearData = data.find(d => d.year === parseInt(label));
      if (!yearData) return null;

      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{`Year ${label}`}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-blue-600">Annual Tax Savings: {formatCurrency(yearData.taxSavings)}</p>
            <p className="text-gray-600">Mortgage Interest: {formatCurrency(yearData.mortgageInterestPaid)}</p>
            <p className="text-gray-600">Property Tax: {formatCurrency(yearData.propertyTaxPaid)}</p>
            <div className="mt-2 pt-2 border-t">
              <p className="text-green-600 font-medium">
                Cumulative Savings: {formatCurrency(
                  data.slice(0, parseInt(label)).reduce((sum, item) => sum + item.taxSavings, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate cumulative tax savings for line chart
  const chartData = data.map((item, index) => ({
    ...item,
    cumulativeTaxSavings: data.slice(0, index + 1).reduce((sum, proj) => sum + proj.taxSavings, 0)
  }));

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Tax Advantage Analysis
        </h3>
        <p className="text-sm text-gray-600">
          Annual and cumulative tax savings from mortgage interest and property tax deductions
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            yAxisId="left"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Bar
            yAxisId="left"
            dataKey="taxSavings"
            fill="#3b82f6"
            name="Annual Tax Savings"
            radius={[2, 2, 0, 0]}
          />
          
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeTaxSavings"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="Cumulative Tax Savings"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-3 rounded">
          <h4 className="font-medium text-blue-800">Annual Savings</h4>
          <p className="text-sm text-blue-600">
            Peak: {formatCurrency(Math.max(...data.map(d => d.taxSavings)))} (early years)
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <h4 className="font-medium text-green-800">Total Benefit</h4>
          <p className="text-sm text-green-600">
            {data.length}-year total: {formatCurrency(chartData[chartData.length - 1]?.cumulativeTaxSavings || 0)}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium text-gray-800">Note</h4>
          <p className="text-sm text-gray-600">
            Assumes itemizing beats standard deduction
          </p>
        </div>
      </div>
    </div>
  );
}