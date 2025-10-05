// src/components/chat/AnimatedChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnimatedChartProps {
  data: any[];
  title: string;
  explanation: string;
  onAnimationComplete?: () => void;
}

export function AnimatedChart({ data, title, explanation, onAnimationComplete }: AnimatedChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    // Start chart swipe-in animation immediately when component mounts
    // This will be triggered by the parent when typing is complete
    setIsVisible(true);

    // Show explanation after chart is fully visible
    const explanationTimer = setTimeout(() => {
      setShowExplanation(true);
      onAnimationComplete?.();
    }, 2000);

    return () => {
      clearTimeout(explanationTimer);
    };
  }, [onAnimationComplete]);

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className={`${isVisible ? 'animate-swipeIn' : 'opacity-0 transform translate-x-full'}`}>
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
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
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
                breakeven: 'Breakeven Point',
                rentCost: 'Rent Cost',
                mortgageCost: 'Mortgage Cost',
                rentGrowth: 'Rent Growth',
                mortgageFixed: 'Fixed Mortgage',
                conservative: 'Conservative',
                moderate: 'Moderate',
                aggressive: 'Aggressive',
                rentStable: 'Rent Stable',
                rentAndInvest: 'Rent + Invest',
                buyProperty: 'Buy Property',
                stockMarket: 'Stock Market',
                denver: 'Denver',
                austin: 'Austin',
                seattle: 'Seattle',
                national: 'National Average'
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
