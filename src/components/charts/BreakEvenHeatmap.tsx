// src/components/charts/BreakEvenHeatmap.tsx

import React, { useState, useMemo } from 'react';
import { FinancialInputs } from '@/types/calculator';
import { calculateRentVsBuy } from '@/utils/calculations';

interface BreakEvenHeatmapProps {
  baseInputs: FinancialInputs;
}

interface HeatmapCell {
  x: number;
  y: number;
  xValue: number;
  yValue: number;
  breakEvenYear: number | null;
  netWorthDifference: number;
}

export function BreakEvenHeatmap({ baseInputs }: BreakEvenHeatmapProps) {
  const [xParameter, setXParameter] = useState<'homePrice' | 'interestRate' | 'rentGrowthRate'>('homePrice');
  const [yParameter, setYParameter] = useState<'interestRate' | 'homeAppreciationRate' | 'rentGrowthRate'>('interestRate');

  const parameterConfigs = {
    homePrice: {
      label: 'Home Price',
      format: (v: number) => `$${(v / 1000).toFixed(0)}k`,
      range: (base: number) => {
        const step = base * 0.1; // 10% steps
        return Array.from({ length: 11 }, (_, i) => base + (i - 5) * step);
      }
    },
    interestRate: {
      label: 'Interest Rate',
      format: (v: number) => `${v.toFixed(1)}%`,
      range: (base: number) => Array.from({ length: 11 }, (_, i) => base + (i - 5) * 0.5)
    },
    homeAppreciationRate: {
      label: 'Home Appreciation',
      format: (v: number) => `${v.toFixed(1)}%`,
      range: (base: number) => Array.from({ length: 11 }, (_, i) => base + (i - 5) * 0.5)
    },
    rentGrowthRate: {
      label: 'Rent Growth',
      format: (v: number) => `${v.toFixed(1)}%`,
      range: (base: number) => Array.from({ length: 11 }, (_, i) => base + (i - 5) * 0.5)
    }
  };

  const heatmapData = useMemo(() => {
    if (xParameter === yParameter) return [];

    const xConfig = parameterConfigs[xParameter];
    const yConfig = parameterConfigs[yParameter];
    const xValues = xConfig.range(baseInputs[xParameter] as number);
    const yValues = yConfig.range(baseInputs[yParameter] as number);

    const cells: HeatmapCell[] = [];

    xValues.forEach((xVal, xIndex) => {
      yValues.forEach((yVal, yIndex) => {
        const testInputs = { ...baseInputs };
        (testInputs as any)[xParameter] = xVal;
        (testInputs as any)[yParameter] = yVal;

        const result = calculateRentVsBuy(testInputs);
        
        cells.push({
          x: xIndex,
          y: yIndex,
          xValue: xVal,
          yValue: yVal,
          breakEvenYear: result.breakEvenYear,
          netWorthDifference: result.netWorthDifference
        });
      });
    });

    return cells;
  }, [baseInputs, xParameter, yParameter]);

  const getColorForBreakEven = (breakEvenYear: number | null, netWorthDiff: number) => {
    if (breakEvenYear === null) {
      return netWorthDiff > 0 ? '#10b981' : '#ef4444'; // Green if buying wins overall, red if renting wins
    }
    
    // Color gradient based on break-even year (earlier = better for buying)
    if (breakEvenYear <= 3) return '#059669'; // Dark green
    if (breakEvenYear <= 5) return '#10b981'; // Green
    if (breakEvenYear <= 7) return '#fbbf24'; // Yellow
    if (breakEvenYear <= 10) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (xParameter === yParameter) {
    return (
      <div className="w-full bg-gray-50 p-8 rounded-lg text-center">
        <p className="text-gray-600">Please select different parameters for X and Y axes</p>
      </div>
    );
  }

  const xConfig = parameterConfigs[xParameter];
  const yConfig = parameterConfigs[yParameter];
  const xValues = xConfig.range(baseInputs[xParameter] as number);
  const yValues = yConfig.range(baseInputs[yParameter] as number);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Break-even Strategy Heatmap
        </h3>
        <p className="text-sm text-gray-600">
          Strategic insight: How combinations of key variables affect when buying wins
        </p>
      </div>
      
      {/* Parameter Selection */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis Parameter</label>
          <select
            value={xParameter}
            onChange={(e) => setXParameter(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="homePrice">Home Price</option>
            <option value="interestRate">Interest Rate</option>
            <option value="rentGrowthRate">Rent Growth Rate</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis Parameter</label>
          <select
            value={yParameter}
            onChange={(e) => setYParameter(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="interestRate">Interest Rate</option>
            <option value="homeAppreciationRate">Home Appreciation Rate</option>
            <option value="rentGrowthRate">Rent Growth Rate</option>
          </select>
        </div>
      </div>

      {/* Heatmap */}
      <div className="relative">
        <svg width="100%" height="400" viewBox="0 0 600 400" className="border rounded">
          {/* Grid cells */}
          {heatmapData.map((cell, index) => (
            <g key={index}>
              <rect
                x={50 + cell.x * 50}
                y={350 - cell.y * 30}
                width={50}
                height={30}
                fill={getColorForBreakEven(cell.breakEvenYear, cell.netWorthDifference)}
                stroke="#fff"
                strokeWidth="1"
              />
              <text
                x={75 + cell.x * 50}
                y={365 - cell.y * 30}
                textAnchor="middle"
                fontSize="10"
                fill="#fff"
                fontWeight="bold"
              >
                {cell.breakEvenYear ? `${cell.breakEvenYear}y` : 'N/A'}
              </text>
            </g>
          ))}
          
          {/* X-axis labels */}
          {xValues.map((value, index) => (
            <text
              key={`x-${index}`}
              x={75 + index * 50}
              y={390}
              textAnchor="middle"
              fontSize="10"
              fill="#374151"
            >
              {xConfig.format(value)}
            </text>
          ))}
          
          {/* Y-axis labels */}
          {yValues.map((value, index) => (
            <text
              key={`y-${index}`}
              x={40}
              y={365 - index * 30}
              textAnchor="end"
              fontSize="10"
              fill="#374151"
            >
              {yConfig.format(value)}
            </text>
          ))}
          
          {/* Axis titles */}
          <text x={325} y={395} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#374151">
            {xConfig.label}
          </text>
          <text x={20} y={200} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#374151" transform="rotate(-90 20 200)">
            {yConfig.label}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Break-even Legend</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-700 rounded mr-2"></div>
              <span>≤ 3 years (Excellent for buying)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>4-5 years (Good for buying)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
              <span>6-7 years (Neutral)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              <span>8-10 years (Favor renting)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>&gt;10 years / Never (Rent preferred)</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Current Position</h4>
          <div className="text-sm text-gray-600">
            <p>{xConfig.label}: {xConfig.format(baseInputs[xParameter] as number)}</p>
            <p>{yConfig.label}: {yConfig.format(baseInputs[yParameter] as number)}</p>
            <p className="mt-2 text-blue-600 font-medium">
              Your scenario: {(() => {
                const result = calculateRentVsBuy(baseInputs);
                return result.breakEvenYear ? `${result.breakEvenYear} years` : 'Never breaks even';
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}