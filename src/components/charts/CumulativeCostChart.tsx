// src/components/charts/CumulativeCostChart.tsx

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
import { YearlyProjection } from '@/types/calculator';

interface CumulativeCostChartProps {
  data: YearlyProjection[];
  breakEvenYear: number | null;
}

export function CumulativeCostChart({ data, breakEvenYear }: CumulativeCostChartProps) {
  const [showBenefits, setShowBenefits] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate compounded investment returns first
  const compoundedInvestments = data.reduce((acc: number[], item, index) => {
    const monthlyCostDiff = (item.totalOwnershipCost - item.rentPayment) / 12;
    let compoundedInvestment = 0;
    
    if (index > 0) {
      // Add previous year's compounded investment
      compoundedInvestment = acc[index - 1];
      // Add monthly differences from previous year
      compoundedInvestment += monthlyCostDiff * 12;
      // Apply investment return rate
      compoundedInvestment *= (1 + 0.08); // Using 8% return rate
    }
    
    acc.push(compoundedInvestment);
    return acc;
  }, []);

  // Transform data to show monthly costs with compounded investment returns
  const chartData = data.map((item, index) => ({
    year: item.year,
    rentMonthly: item.rentPayment / 12,
    rentWithInvestment: (item.rentPayment - (item.investmentValue * 0.08 / 12) - (compoundedInvestments[index] * 0.08 / 12)) / 12,
    buyMonthly: item.totalOwnershipCost / 12,
    buyWithTax: (item.totalOwnershipCost - item.taxSavings) / 12,
    compoundedInvestment: compoundedInvestments[index]
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const yearData = chartData.find(d => d.year === label);
      if (!yearData) return null;

      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{`Year ${label}`}</p>
          <p className="text-red-500">
            {`Monthly Rent: ${formatCurrency(yearData.rentMonthly)}`}
          </p>
          {showBenefits && (
            <>
              <p className="text-red-500">
                {`Monthly Rent (with investment): ${formatCurrency(yearData.rentWithInvestment)}`}
              </p>
              <p className="text-gray-600 text-sm">
                {`Compounded Investment: ${formatCurrency(yearData.compoundedInvestment)}`}
              </p>
            </>
          )}
          <p className="text-blue-500">
            {`Monthly Ownership: ${formatCurrency(yearData.buyMonthly)}`}
          </p>
          {showBenefits && (
            <p className="text-blue-500">
              {`Monthly Ownership (with tax): ${formatCurrency(yearData.buyWithTax)}`}
            </p>
          )}
          <p className="text-gray-600 text-sm mt-2">
            Difference: {formatCurrency(yearData.buyMonthly - yearData.rentMonthly)}
          </p>
          {showBenefits && (
            <p className="text-gray-600 text-sm">
              Difference (with benefits): {formatCurrency(yearData.buyWithTax - yearData.rentWithInvestment)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Monthly Cost Comparison
          </h3>
          <p className="text-sm text-gray-300">
            Monthly expenses for renting vs. buying
          </p>
        </div>
        <button
          onClick={() => setShowBenefits(!showBenefits)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            showBenefits 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showBenefits ? 'Hide Benefits' : 'Include Tax & Investment Benefits'}
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
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
          
          {breakEvenYear && (
            <ReferenceLine 
              x={breakEvenYear} 
              stroke="#10b981" 
              strokeDasharray="5 5"
              label={{ value: "Break-even", position: "top" }}
            />
          )}
          
          {/* Base Rent Line */}
          <Line
            type="monotone"
            dataKey="rentMonthly"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            name="Monthly Rent"
          />

          {/* Rent with Investment (dashed) */}
          {showBenefits && (
            <Line
              type="monotone"
              dataKey="rentWithInvestment"
              stroke="#ef4444"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              name="Monthly Rent (with investment)"
            />
          )}

          {/* Base Buy Line */}
          <Line
            type="monotone"
            dataKey="buyMonthly"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="Monthly Ownership"
          />

          {/* Buy with Tax (dashed) */}
          {showBenefits && (
            <Line
              type="monotone"
              dataKey="buyWithTax"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Monthly Ownership (with tax)"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-3 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
        <p className="text-xs text-blue-200">
          💡 <strong>Tip:</strong> Hover over the chart to see detailed monthly costs for each year!
        </p>
      </div>

      {showBenefits && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Benefits Included</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Investment returns are calculated based on the Investment Return % from the form</p>
            <p>• Returns are applied to the down payment and other purchasing costs</p>
            <p>• Monthly cost differences are added to the investment pool and compounded</p>
            <p>• Tax benefits include mortgage interest and property tax deductions</p>
            <p>• Benefits are calculated based on your marginal tax rate</p>
          </div>
        </div>
      )}
    </div>
  );
}

