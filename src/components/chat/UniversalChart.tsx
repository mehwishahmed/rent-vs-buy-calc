// src/components/chat/UniversalChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area, AreaChart, ReferenceLine
} from 'recharts';
import { BreakEvenHeatmap } from '@/components/charts/BreakEvenHeatmap';
import { LiquidityTimeline } from '@/components/charts/LiquidityTimeline';
import { ScenarioOverlayChart } from '@/components/charts/ScenarioOverlayChart';
import { MonteCarloChart } from '@/components/charts/MonteCarloChart';
import { TaxSavingsChart } from '@/components/charts/TaxSavingsChart';
import { CumulativeCostChart } from '@/components/charts/CumulativeCostChart';
import { NetWorthChart } from '@/components/charts/NetWorthChart';
import { CashFlowChart } from '@/components/charts/CashFlowChart';
import { SensitivityChart } from '@/components/charts/SensitivityChart';
import { TotalCostChart } from '@/components/charts/TotalCostChart';
import { FinancialInputs } from '@/types/calculator';

interface UniversalChartProps {
  chartType: string;
  data: any[];
  title: string;
  explanation: string;
  inputs?: Partial<FinancialInputs>;
  onAnimationComplete?: () => void;
}

export function UniversalChart({ 
  chartType, 
  data, 
  title, 
  explanation, 
  inputs,
  onAnimationComplete 
}: UniversalChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const explanationTimer = setTimeout(() => {
      setShowExplanation(true);
      onAnimationComplete?.();
    }, 2000);

    return () => {
      clearTimeout(explanationTimer);
    };
  }, [onAnimationComplete]);

  // Prepare base inputs for charts that need them
  const baseInputs = {
    homePrice: 750000,
    downPaymentPercent: 20,
    currentRent: 3000,
    interestRate: 7,
    loanTermYears: 30,
    pmiRate: 0.5,
    propertyTaxRate: 1.2,
    homeInsurance: 1500,
    maintenanceRate: 1.5,
    hoaFees: 0,
    rentGrowthRate: 3,
    investmentReturn: 7,
    inflationRate: 2.5,
    homeAppreciationRate: 3,
    timeHorizonYears: 10,
    marginalTaxRate: 24,
    otherDeductions: 0,
    closingCostsPercent: 3,
    sellingCostsPercent: 6,
    ...inputs // Override with any provided inputs
  } as FinancialInputs;

  const downPayment = baseInputs.homePrice * (baseInputs.downPaymentPercent / 100);

  const renderChart = () => {
    switch (chartType) {
      case 'heatmap':
        return <BreakEvenHeatmap baseInputs={baseInputs} />;
      
      case 'liquidity':
        return <LiquidityTimeline data={data} downPayment={downPayment} />;
      
      case 'scenario':
        return (
          <ScenarioOverlayChart 
            scenarios={[]}
            currentScenario={{
              name: 'Current',
              data: data,
              color: '#1f2937'
            }}
          />
        );
      
      case 'montecarlo':
        return <MonteCarloChart data={data} />;
      
      case 'tax':
        return <TaxSavingsChart data={data} />;
      
      case 'cumulative':
        return <CumulativeCostChart data={data} breakEvenYear={null} />;
      
      case 'networth':
        return <NetWorthChart data={data} />;
      
      case 'cashflow':
        return <CashFlowChart data={data} />;
      
      case 'sensitivity':
        return <SensitivityChart data={data} />;
      
      case 'totalcost':
        return (
          <TotalCostChart 
            data={data} 
            totalCostRent={data[data.length - 1]?.totalRent || 0}
            totalCostBuy={data[data.length - 1]?.totalOwnership || 0}
          />
        );
      
      default:
        // Fallback to simple line chart
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="year" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                  color: '#ffffff'
                }}
              />
              {/* Dynamic lines based on data keys */}
              {data.length > 0 && Object.keys(data[0]).map((key, index) => {
                if (key === 'year') return null;
                
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
                const names = {
                  rentNetWorth: 'Renting',
                  buyNetWorth: 'Buying',
                  cumulativeRent: 'Cumulative Rent',
                  cumulativeOwnership: 'Cumulative Ownership',
                  taxSavings: 'Tax Savings',
                  monthlyRent: 'Monthly Rent',
                  monthlyOwnership: 'Monthly Ownership',
                  totalRent: 'Total Rent',
                  totalOwnership: 'Total Ownership'
                };
                
                return (
                  <Line 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={3}
                    dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                    name={names[key as keyof typeof names] || key} 
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className={`${isVisible ? 'animate-swipeIn' : 'opacity-0 transform translate-x-full'}`}>
        {renderChart()}
      </div>

      {showExplanation && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-400/30 animate-slideUp">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">💡</span>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">What this chart shows:</h4>
              <p className="text-sm text-gray-300 leading-relaxed">{explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

