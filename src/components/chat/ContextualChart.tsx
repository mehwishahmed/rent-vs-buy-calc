// src/components/chat/ContextualChart.tsx

import React from 'react';
import { useCalculatorStore } from '@/stores/calculator-store';
import { calculateRentVsBuy } from '@/utils/calculations';
import { NetWorthChart } from '../charts/NetWorthChart';
import { TotalCostChart } from '../charts/TotalCostChart';
import { CumulativeCostChart } from '../charts/CumulativeCostChart';
import { MonteCarloChart } from '../charts/MonteCarloChart';

interface ContextualChartProps {
  chartType: string;
  onClose: () => void;
}

export function ContextualChart({ chartType, onClose }: ContextualChartProps) {
  const { inputs, results } = useCalculatorStore();

  // Calculate results if not already available
  const calculationResults = results || calculateRentVsBuy(inputs);

  const renderChart = () => {
    switch (chartType) {
      case 'timeline':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Timeline Analysis</h3>
            <CumulativeCostChart 
              data={calculationResults.yearlyProjections} 
              breakEvenYear={calculationResults.breakEvenYear}
            />
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Key Insight:</strong> Your break-even point is at year {calculationResults.breakEvenYear || 'Never'}. 
                This means you'd need to stay in the home for at least that long to make buying worthwhile.
              </p>
            </div>
          </div>
        );

      case 'cost':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Cost Breakdown</h3>
            <TotalCostChart 
              data={calculationResults.yearlyProjections}
              totalCostRent={calculationResults.totalCostRent}
              totalCostBuy={calculationResults.totalCostBuy}
            />
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Cost Analysis:</strong> Here's how your monthly costs compare over time. 
                The crossover point shows when buying becomes more cost-effective than renting.
              </p>
            </div>
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Risk Assessment</h3>
            <NetWorthChart data={calculationResults.yearlyProjections} />
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Risk Perspective:</strong> This shows your net worth under both scenarios. 
                The wider the gap, the more certain the better choice becomes.
              </p>
            </div>
          </div>
        );

      case 'basic':
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Analysis</h3>
            <NetWorthChart data={calculationResults.yearlyProjections} />
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-800">
                <strong>Bottom Line:</strong> Based on your inputs, here's how renting vs buying compares over time.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4 animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">📊 Analysis</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {renderChart()}
    </div>
  );
}

