import React from 'react';
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

interface TotalCostChartProps {
  data: YearlyProjection[];
  totalCostRent?: number;
  totalCostBuy?: number;
}

export function TotalCostChart({ data, totalCostRent, totalCostBuy }: TotalCostChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Transform data to show yearly costs with proper upfront and selling costs
  const chartData = data.map((item, index) => {
    // Get upfront costs from year 1 data
    const upfrontCosts = data[0]?.buyUpfrontCosts || 0;
    const rentUpfrontCosts = data[0]?.rentUpfrontCosts || 0;
    
    // Calculate yearly costs (not cumulative)
    const yearlyRentCost = item.year === 1 ? 
      (item.totalRentPaid - (data[index - 1]?.totalRentPaid || 0)) : 
      (item.totalRentPaid - (data[index - 1]?.totalRentPaid || 0));
    
    const yearlyBuyCost = item.year === 1 ? 
      (item.cumulativeOwnershipCost - (data[index - 1]?.cumulativeOwnershipCost || 0)) : 
      (item.cumulativeOwnershipCost - (data[index - 1]?.cumulativeOwnershipCost || 0));
    
    // Add upfront costs only in Year 1
    const rentTotal = item.totalRentPaid + (item.year === 1 ? rentUpfrontCosts : 0);
    const buyTotal = item.cumulativeOwnershipCost + (item.year === 1 ? upfrontCosts : 0) + 
                    (item.year === data.length ? item.sellingCosts : 0);
    
    return {
      year: item.year,
      // Chart lines (cumulative totals)
      rentTotal,
      buyTotal,
      // Hover box data
      yearlyRentCost: Math.max(0, yearlyRentCost), // Ensure non-negative
      yearlyBuyCost: Math.max(0, yearlyBuyCost), // Ensure non-negative
      rentUpfront: item.year === 1 ? rentUpfrontCosts : 0,
      buyUpfront: item.year === 1 ? upfrontCosts : 0,
      rentMonthly: item.totalRentPaid,
      buyMonthly: item.cumulativeOwnershipCost,
      sellingCosts: item.year === data.length ? item.sellingCosts : 0
    };
  });

  // Validate that final year values match expected totals (if provided)
  if (totalCostRent && totalCostBuy && chartData.length > 0) {
    const finalRentTotal = chartData[chartData.length - 1].rentTotal;
    const finalBuyTotal = chartData[chartData.length - 1].buyTotal;
    
    if (Math.abs(finalRentTotal - totalCostRent) > 1 || Math.abs(finalBuyTotal - totalCostBuy) > 1) {
      console.warn('TotalCostChart: Final year values do not match expected totals:', {
        finalRentTotal,
        expectedRentTotal: totalCostRent,
        finalBuyTotal,
        expectedBuyTotal: totalCostBuy
      });
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const yearData = chartData.find(d => d.year === label);
      if (!yearData) return null;

      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{`Year ${label}`}</p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="text-red-500">
              <p className="font-medium">Rent Scenario:</p>
              <p className="font-semibold">This Year: {formatCurrency(yearData.yearlyRentCost)}</p>
              <p className="text-gray-600">Total So Far: {formatCurrency(yearData.rentTotal)}</p>
              {yearData.rentUpfront > 0 && (
                <p className="text-gray-600">Upfront Costs: {formatCurrency(yearData.rentUpfront)}</p>
              )}
            </div>
            <div className="text-blue-500 mt-2">
              <p className="font-medium">Buy Scenario:</p>
              <p className="font-semibold">This Year: {formatCurrency(yearData.yearlyBuyCost)}</p>
              <p className="text-gray-600">Total So Far: {formatCurrency(yearData.buyTotal)}</p>
              {yearData.buyUpfront > 0 && (
                <p className="text-gray-600">Upfront Costs: {formatCurrency(yearData.buyUpfront)}</p>
              )}
              {yearData.sellingCosts > 0 && (
                <p className="text-gray-600">Selling Costs: {formatCurrency(yearData.sellingCosts)}</p>
              )}
            </div>
            <div className="mt-2 pt-2 border-t">
              <p className="text-gray-700">
                Difference: {formatCurrency(yearData.buyTotal - yearData.rentTotal)}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Cumulative Cost per Year + Initial Costs
        </h3>
        <p className="text-sm text-gray-600">
          Cumulative costs over time: Year 1 includes upfront costs, final year includes selling costs. 
          Hover to see yearly breakdown vs. total so far.
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
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
          
          <Line
            type="monotone"
            dataKey="rentTotal"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            name="Total Rent Cost"
          />
          <Line
            type="monotone"
            dataKey="buyTotal"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="Total Ownership Cost"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">Rent Upfront Costs</h4>
          <div className="text-sm text-red-600 space-y-1">
            <p>Security Deposit: {formatCurrency(data[0]?.rentUpfrontCosts || 0)}</p>
            <p>First Month's Rent: {formatCurrency(data[0]?.rentPayment / 12 || 0)}</p>
            <p>Application Fees: Included in total</p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Buy Upfront & Selling Costs</h4>
          <div className="text-sm text-blue-600 space-y-1">
            <p>Down Payment: {formatCurrency(data[0]?.buyUpfrontCosts * 0.8 || 0)}</p>
            <p>Closing Costs: {formatCurrency(data[0]?.buyUpfrontCosts * 0.15 || 0)}</p>
            <p>Moving & Repairs: {formatCurrency(data[0]?.buyUpfrontCosts * 0.05 || 0)}</p>
            <p className="mt-2">Selling Costs: {formatCurrency(data[data.length - 1]?.sellingCosts || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 