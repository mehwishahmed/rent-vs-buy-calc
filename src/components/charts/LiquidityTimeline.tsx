// src/components/charts/LiquidityTimeline.tsx

import React from 'react';
import {
  ComposedChart,
  Bar,
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

interface LiquidityTimelineProps {
  data: YearlyProjection[];
  downPayment: number;
}

export function LiquidityTimeline({ data, downPayment }: LiquidityTimelineProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate additional metrics for liquidity analysis
  const chartData = data.map(item => {
    const totalInvestment = downPayment + item.cumulativeOwnershipCost;
    const liquidityPenalty = Math.max(0, totalInvestment - item.netProceedsIfSold);
    const opportunityCost = item.rentNetWorth - item.netProceedsIfSold;
    const mobilityScore = Math.max(0, Math.min(100, 
      (item.netProceedsIfSold / totalInvestment) * 100
    ));

    return {
      ...item,
      totalInvestment,
      liquidityPenalty,
      opportunityCost,
      mobilityScore,
      breaksEven: item.netProceedsIfSold >= totalInvestment
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const yearData = chartData.find(d => d.year === parseInt(label));
      if (!yearData) return null;

      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{`Year ${label} - Selling Analysis`}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-blue-600">Home Value: {formatCurrency(yearData.homeValue)}</p>
            <p className="text-gray-600">Mortgage Balance: {formatCurrency(yearData.mortgageBalance)}</p>
            <p className="text-red-600">Selling Costs: {formatCurrency(yearData.sellingCosts)}</p>
            <p className="text-green-600 font-medium">Net Proceeds: {formatCurrency(yearData.netProceedsIfSold)}</p>
            
            <div className="mt-2 pt-2 border-t">
              <p className="text-gray-700">Total Invested: {formatCurrency(yearData.totalInvestment)}</p>
              <p className={`font-medium ${yearData.breaksEven ? 'text-green-600' : 'text-red-600'}`}>
                {yearData.breaksEven ? 'Profit' : 'Loss'}: {formatCurrency(yearData.netProceedsIfSold - yearData.totalInvestment)}
              </p>
              
              <div className="mt-2">
                <p className="text-purple-600">vs Renting: {formatCurrency(Math.abs(yearData.opportunityCost))}</p>
                <p className="text-xs text-gray-500">
                  {yearData.opportunityCost > 0 ? 'Renting would be better' : 'Buying is better'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.homeValue, d.totalInvestment, d.rentNetWorth))
  );

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Liquidity & Mobility Timeline
        </h3>
        <p className="text-sm text-gray-600">
          Cost and flexibility of selling at different time horizons
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
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
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Reference line at investment break-even */}
          <ReferenceLine 
            yAxisId="left"
            y={downPayment} 
            stroke="#9ca3af" 
            strokeDasharray="2 2"
            label={{ value: "Down Payment", position: "top" }}
          />
          
          {/* Bars showing liquidity penalty */}
          <Bar
            yAxisId="left"
            dataKey="liquidityPenalty"
            fill="#ef4444"
            fillOpacity={0.6}
            name="Liquidity Penalty"
          />
          
          {/* Lines showing key values */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="homeValue"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            name="Home Value"
          />
          
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="netProceedsIfSold"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="Net Proceeds if Sold"
          />
          
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="totalInvestment"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Total Investment"
          />
          
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="rentNetWorth"
            stroke="#06b6d4"
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={false}
            name="Rent + Invest Net Worth"
          />
          
          {/* Mobility score line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="mobilityScore"
            stroke="#dc2626"
            strokeWidth={2}
            dot={{ fill: '#dc2626', strokeWidth: 1, r: 2 }}
            name="Mobility Score (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Analysis Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">Early Years Risk</h4>
          <div className="text-sm text-red-600 space-y-1">
            <p>Years 1-3: High selling costs</p>
            <p>Break-even: ~{chartData.findIndex(d => d.breaksEven) + 1 || 'Never'} years</p>
            <p>Max penalty: {formatCurrency(Math.max(...chartData.map(d => d.liquidityPenalty)))}</p>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Mobility Timeline</h4>
          <div className="text-sm text-green-600 space-y-1">
            <p>Year 5: {formatCurrency(chartData[4]?.netProceedsIfSold || 0)} net proceeds</p>
            <p>Year 7: {formatCurrency(chartData[6]?.netProceedsIfSold || 0)} net proceeds</p>
            <p>Year 10: {formatCurrency(chartData[9]?.netProceedsIfSold || 0)} net proceeds</p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Opportunity Cost</h4>
          <div className="text-sm text-blue-600 space-y-1">
            {(() => {
              const finalYear = chartData[chartData.length - 1];
              const avgOpportunityCost = chartData.reduce((sum, d) => sum + Math.abs(d.opportunityCost), 0) / chartData.length;
              return (
                <>
                  <p>Final advantage: {finalYear?.opportunityCost > 0 ? 'Rent' : 'Buy'}</p>
                  <p>By: {formatCurrency(Math.abs(finalYear?.opportunityCost || 0))}</p>
                  <p>Avg yearly difference: {formatCurrency(avgOpportunityCost)}</p>
                </>
              );
            })()}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Red bars:</strong> Liquidity penalty (loss if selling) | <strong>Mobility Score:</strong> % of investment recoverable</p>
      </div>
    </div>
  );
}