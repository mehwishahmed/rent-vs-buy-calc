
// src/components/charts/SensitivityChart.tsx

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
  ComposedChart,
  Cell
} from 'recharts';
import { SensitivityAnalysis } from '@/types/calculator';

interface SensitivityChartProps {
  data: SensitivityAnalysis[];
}

export function SensitivityChart({ data }: SensitivityChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Create combined data for the tornado chart
  const tornadoData = data.flatMap(analysis => 
    analysis.values.map((value, index) => {
      const isBaseline = index === Math.floor(analysis.values.length / 2);
      const netWorthDiff = analysis.finalNetWorthDifferences[index];
      
      return {
        parameter: analysis.parameter,
        value: value,
        netWorthDifference: netWorthDiff,
        breakEvenYear: analysis.breakEvenYears[index],
        isBaseline,
        scenario: `${analysis.parameter}: ${
          analysis.parameter === 'Home Price' ? formatCurrency(value) : 
          analysis.parameter.includes('Rate') ? `${value.toFixed(1)}%` : value.toString()
        }`
      };
    })
  );

  // Group by parameter for better visualization
  const parameterGroups = data.map((analysis, paramIndex) => {
    const baselineIndex = Math.floor(analysis.values.length / 2);
    const baselineValue = analysis.finalNetWorthDifferences[baselineIndex];
    
    return {
      parameter: analysis.parameter,
      scenarios: analysis.values.map((value, index) => ({
        label: analysis.parameter === 'Home Price' ? formatCurrency(value) :
               analysis.parameter.includes('Rate') ? `${value.toFixed(1)}%` : value.toString(),
        netWorthDiff: analysis.finalNetWorthDifferences[index],
        breakEvenYear: analysis.breakEvenYears[index],
        deviation: analysis.finalNetWorthDifferences[index] - baselineValue,
        isBaseline: index === baselineIndex
      }))
    };
  });

  return (
    <div className="w-full space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Sensitivity Analysis
        </h3>
        <p className="text-sm text-gray-600">
          How changes in key variables affect your final net worth advantage
        </p>
      </div>
      
      {parameterGroups.map((group, groupIndex) => (
        <div key={group.parameter} className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">{group.parameter}</h4>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart 
              data={group.scenarios} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value: any, name: any) => [formatCurrency(value), "Net Worth Advantage"]}
                labelFormatter={(label) => `${group.parameter}: ${label}`}
              />
              
              <Bar dataKey="netWorthDiff" name="Net Worth Advantage">
                {group.scenarios.map((scenario, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      scenario.isBaseline ? "#6366f1" :
                      scenario.netWorthDiff > 0 ? "#10b981" : "#ef4444"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-2 text-xs text-gray-600 grid grid-cols-3 gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-500 rounded mr-1"></div>
              <span>Baseline</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
              <span>Buying favored</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
              <span>Renting favored</span>
            </div>
          </div>
        </div>
      ))}
      
      {/* Summary insights */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <p className="font-medium">Most Sensitive To:</p>
            <ul className="list-disc list-inside">
              {data.map(analysis => {
                const range = Math.max(...analysis.finalNetWorthDifferences) - 
                             Math.min(...analysis.finalNetWorthDifferences);
                return { parameter: analysis.parameter, range };
              })
              .sort((a, b) => b.range - a.range)
              .slice(0, 2)
              .map(item => (
                <li key={item.parameter}>{item.parameter} (±{formatCurrency(item.range / 2)})</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium">Break-even Stability:</p>
            <p>Break-even point varies most with interest rate and home price changes</p>
          </div>
        </div>
      </div>
    </div>
  );
}