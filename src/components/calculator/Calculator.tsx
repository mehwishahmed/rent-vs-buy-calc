// src/components/calculator/Calculator.tsx

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useCalculatorStore } from '@/stores/calculator-store';
import { calculateRentVsBuy, runMonteCarloSimulation, runSensitivityAnalysis, calculateMortgagePayment } from '@/utils/calculations';
import { InputForm } from './InputForm';
import { CumulativeCostChart } from '@/components/charts/CumulativeCostChart';
import { CashFlowChart } from '@/components/charts/CashFlowChart';
import { NetWorthChart } from '@/components/charts/NetWorthChart';
import { MonteCarloChart } from '@/components/charts/MonteCarloChart';
import { TaxSavingsChart } from '@/components/charts/TaxSavingsChart';
import { SensitivityChart } from '@/components/charts/SensitivityChart';
import { ScenarioOverlayChart } from '@/components/charts/ScenarioOverlayChart';
import { BreakEvenHeatmap } from '@/components/charts/BreakEvenHeatmap';
import { LiquidityTimeline } from '@/components/charts/LiquidityTimeline';
import { TotalCostChart } from '@/components/charts/TotalCostChart';
import { AIAssistant } from '@/components/ai/AIAssistant';

export function Calculator() {
  const { 
    inputs, 
    results, 
    setResults, 
    setCalculating,
    scenarios,
    saveScenario,
    loadScenario,
    deleteScenario,
    monteCarloInputs,
    showMonteCarlo,
    toggleMonteCarlo,
    updateMonteCarloInput,
    updateInput
  } = useCalculatorStore();
  
  const [activeTab, setActiveTab] = useState<'basic' | 'amortization' | 'advanced' | 'scenarios'>('basic');
  const [scenarioName, setScenarioName] = useState('');
  const [isRunningMonteCarlo, setIsRunningMonteCarlo] = useState(false);
  const [showDebugConsole, setShowDebugConsole] = useState(false);

  // Recalculate whenever inputs change
  const calculationResults = useMemo(() => {
    try {
      const results = calculateRentVsBuy(inputs);
      return results;
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }, [inputs]);

  // Run Monte Carlo simulation
  const monteCarloResults = useMemo(() => {
    if (!showMonteCarlo || !calculationResults) return null;
    
    setIsRunningMonteCarlo(true);
    try {
      const results = runMonteCarloSimulation(inputs, monteCarloInputs);
      setIsRunningMonteCarlo(false);
      return results;
    } catch (error) {
      console.error('Monte Carlo error:', error);
      setIsRunningMonteCarlo(false);
      return null;
    }
  }, [inputs, monteCarloInputs, showMonteCarlo, calculationResults]);

  // Run sensitivity analysis
  const sensitivityResults = useMemo(() => {
    if (activeTab !== 'advanced') return null;
    
    try {
      return runSensitivityAnalysis(inputs);
    } catch (error) {
      console.error('Sensitivity analysis error:', error);
      return null;
    }
  }, [inputs, activeTab]);

  useEffect(() => {
    if (calculationResults) {
      const enhancedResults = {
        ...calculationResults,
        monteCarloResults: monteCarloResults || undefined
      };
      setResults(enhancedResults);
    }
  }, [calculationResults, monteCarloResults, setResults]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleSaveScenario = () => {
    if (scenarioName.trim() && results) {
      saveScenario(scenarioName.trim());
      setScenarioName('');
    }
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Rent vs Buy Calculator</h1>
            <InputForm />
            <div className="mt-8 text-center">
              <p className="text-gray-500">Calculating...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const finalProjection = results.yearlyProjections[results.yearlyProjections.length - 1];
  const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Rent vs Buy Calculator
          </h1>
          <p className="text-lg text-gray-600 font-medium">Advanced Financial Analysis & AI Insights</p>
        </div>

        {/* Debug Console Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowDebugConsole(!showDebugConsole)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
          >
            {showDebugConsole ? '🔽' : '🔼'} Debug Console
          </button>
        </div>

        {/* Debug Console */}
        {showDebugConsole && (
          <div className="bg-black text-green-400 p-4 rounded-lg mb-6 font-mono text-sm overflow-auto max-h-96">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-bold">🔧 DEBUG CONSOLE</h3>
              <button 
                onClick={() => {
                  updateInput('currentRent', 9999);
                  updateInput('investmentReturn', 15);
                  updateInput('homeAppreciationRate', 5);
                }}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                TEST UPDATE
              </button>
            </div>
          <div className="space-y-2">
            <div>
              <span className="text-yellow-400">📊 INPUT VALUES:</span>
              <pre className="ml-2">
{JSON.stringify({
  currentRent: inputs.currentRent,
  investmentReturn: inputs.investmentReturn,
  homeAppreciationRate: inputs.homeAppreciationRate,
  homePrice: inputs.homePrice,
  downPaymentPercent: inputs.downPaymentPercent,
  interestRate: inputs.interestRate,
  timeHorizonYears: inputs.timeHorizonYears,
  rentGrowthRate: inputs.rentGrowthRate,
  propertyTaxRate: inputs.propertyTaxRate,
  maintenanceRate: inputs.maintenanceRate,
  pmiRate: inputs.pmiRate,
  homeInsurance: inputs.homeInsurance,
  hoaFees: inputs.hoaFees,
  marginalTaxRate: inputs.marginalTaxRate,
  otherDeductions: inputs.otherDeductions,
  closingCostsPercent: inputs.closingCostsPercent,
  sellingCostsPercent: inputs.sellingCostsPercent,
  inflationRate: inputs.inflationRate,
  loanTermYears: inputs.loanTermYears
}, null, 2)}
              </pre>
            </div>
            <div>
              <span className="text-yellow-400">🎯 BREAK-EVEN RESULT:</span>
              <pre className="ml-2">
{JSON.stringify({
  breakEvenYear: results.breakEvenYear,
  netWorthDifference: results.netWorthDifference,
  totalCostRent: results.totalCostRent,
  totalCostBuy: results.totalCostBuy,
  totalTaxSavings: results.totalTaxSavings
}, null, 2)}
              </pre>
            </div>
            <div>
              <span className="text-yellow-400">💰 FINAL PROJECTION (Year {results.yearlyProjections.length}):</span>
              <pre className="ml-2">
{JSON.stringify({
  rentNetWorth: finalProjection.rentNetWorth,
  buyNetWorth: finalProjection.buyNetWorth,
  investmentValue: finalProjection.investmentValue,
  homeEquity: finalProjection.homeEquity,
  totalRentPaid: finalProjection.totalRentPaid,
  cumulativeOwnershipCost: finalProjection.cumulativeOwnershipCost
}, null, 2)}
              </pre>
            </div>
            <div>
              <span className="text-yellow-400">📈 YEAR 1 COMPARISON:</span>
              <pre className="ml-2">
{JSON.stringify({
  year1: {
    rentNetWorth: results.yearlyProjections[0].rentNetWorth,
    buyNetWorth: results.yearlyProjections[0].buyNetWorth,
    difference: results.yearlyProjections[0].buyNetWorth - results.yearlyProjections[0].rentNetWorth
  }
}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sticky top-4">
              <AIAssistant />
              <InputForm />
              
              {/* Monte Carlo Controls */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-700">Monte Carlo Analysis</h4>
                  <button
                    onClick={toggleMonteCarlo}
                    className={`px-3 py-1 rounded text-sm ${
                      showMonteCarlo ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {showMonteCarlo ? 'On' : 'Off'}
                  </button>
                </div>
                
                {showMonteCarlo && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600">Home Price Volatility (%)</label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 border rounded text-sm"
                        value={monteCarloInputs.homePriceVolatility}
                        onChange={(e) => updateMonteCarloInput('homePriceVolatility', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Rent Volatility (%)</label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 border rounded text-sm"
                        value={monteCarloInputs.rentVolatility}
                        onChange={(e) => updateMonteCarloInput('rentVolatility', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Stock Volatility (%)</label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 border rounded text-sm"
                        value={monteCarloInputs.stockMarketVolatility}
                        onChange={(e) => updateMonteCarloInput('stockMarketVolatility', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Scenario Management */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-700 mb-3">Save Scenario</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Scenario name"
                    className="flex-1 px-2 py-1 border rounded text-sm"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                  />
                  <button
                    onClick={handleSaveScenario}
                    disabled={!scenarioName.trim()}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300"
                  >
                    Save
                  </button>
                </div>
                
                {scenarios.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-600">Saved scenarios:</p>
                    {scenarios.slice(-3).map(scenario => (
                      <div key={scenario.id} className="flex items-center justify-between text-xs">
                        <button
                          onClick={() => loadScenario(scenario.id)}
                          className="text-blue-600 hover:underline"
                        >
                          {scenario.name}
                        </button>
                        <button
                          onClick={() => deleteScenario(scenario.id)}
                          className="text-red-600 hover:underline"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Break-even Point
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {results.breakEvenYear ? `Year ${results.breakEvenYear}` : 'Never'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {results.breakEvenYear 
                    ? `When renting becomes better than buying`
                    : results.netWorthDifference > 0 
                      ? 'Buying always better than renting'
                      : 'Renting always better than buying'
                  }
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Net Worth Advantage
                </h3>
                <p className={`text-2xl font-bold mt-2 ${results.netWorthDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(results.netWorthDifference))}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {results.netWorthDifference > 0 ? 'Buying wins' : 'Renting wins'}
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Investment Value
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(finalProjection.investmentValue)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  If renting and investing
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Rent Paid
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(finalProjection.totalRentPaid)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Over {inputs.timeHorizonYears} years
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Time Horizon
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {inputs.timeHorizonYears} years
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Analysis period
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Tax Savings
                </h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(results.totalTaxSavings)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {inputs.timeHorizonYears}-year total
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Home Equity
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(finalProjection.homeEquity)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  If buying
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Interest Paid
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(results.totalInterestPaid)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Over {inputs.timeHorizonYears} years
                </p>
              </div>
            </div>

            {/* Chart Tabs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'basic', label: 'Basic Analysis' },
                    { id: 'amortization', label: 'Amortization Table' },
                    { id: 'advanced', label: 'Advanced Analysis' },
                    { id: 'scenarios', label: 'Scenario Planning' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'basic' && (
                  <div className="space-y-8">
                    <TotalCostChart 
                      data={results.yearlyProjections} 
                      totalCostRent={results.totalCostRent}
                      totalCostBuy={results.totalCostBuy}
                    />
                    <CumulativeCostChart 
                      data={results.yearlyProjections} 
                      breakEvenYear={results.breakEvenYear}
                    />
                    <NetWorthChart data={results.yearlyProjections} />
                    <CashFlowChart data={results.yearlyProjections} />
                    <TaxSavingsChart data={results.yearlyProjections} />
                  </div>
                )}

                {activeTab === 'amortization' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Mortgage Amortization Schedule</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Home Value</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equity</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {results.yearlyProjections.map((projection, index) => {
                              const year = index + 1;
                              const loanAmount = inputs.homePrice * (1 - inputs.downPaymentPercent / 100);
                              const monthlyPayment = calculateMortgagePayment(
                                loanAmount,
                                inputs.interestRate,
                                inputs.loanTermYears
                              );
                              const annualPayment = monthlyPayment * 12;
                              
                              // Calculate annual interest based on remaining balance
                              let remainingBalance = loanAmount;
                              for (let i = 0; i < year - 1; i++) {
                                const yearlyInterest = remainingBalance * (inputs.interestRate / 100);
                                const yearlyPrincipal = annualPayment - yearlyInterest;
                                remainingBalance -= yearlyPrincipal;
                              }
                              const annualInterest = remainingBalance * (inputs.interestRate / 100);
                              const annualPrincipal = annualPayment - annualInterest;
                              
                              return (
                                <tr key={year} className={year % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{year}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(annualPayment)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(annualPrincipal)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(annualInterest)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(remainingBalance - annualPrincipal)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(projection.homeValue || 0)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(projection.homeEquity || 0)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-2">Loan Summary</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Original Loan: {formatCurrency(inputs.homePrice * (1 - inputs.downPaymentPercent / 100))}</div>
                          <div>Down Payment: {formatCurrency(inputs.homePrice * (inputs.downPaymentPercent / 100))}</div>
                          <div>Interest Rate: {inputs.interestRate}%</div>
                          <div>Loan Term: {inputs.loanTermYears} years</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-2">Payment Details</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Monthly Payment: {formatCurrency(calculateMortgagePayment(
                            inputs.homePrice * (1 - inputs.downPaymentPercent / 100),
                            inputs.interestRate,
                            inputs.loanTermYears
                          ))}</div>
                          <div>Annual Payment: {formatCurrency(calculateMortgagePayment(
                            inputs.homePrice * (1 - inputs.downPaymentPercent / 100),
                            inputs.interestRate,
                            inputs.loanTermYears
                          ) * 12)}</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-2">Total Costs</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Total Interest: {formatCurrency(results.totalInterestPaid)}</div>
                          <div>Total Principal: {formatCurrency(inputs.homePrice * (1 - inputs.downPaymentPercent / 100))}</div>
                          <div>Total Payments: {formatCurrency(results.totalInterestPaid + inputs.homePrice * (1 - inputs.downPaymentPercent / 100))}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'advanced' && (
                  <div className="space-y-8">
                    {showMonteCarlo && monteCarloResults && (
                      <MonteCarloChart data={monteCarloResults} />
                    )}
                    
                    {sensitivityResults && (
                      <SensitivityChart data={sensitivityResults} />
                    )}
                    
                    <BreakEvenHeatmap baseInputs={inputs} />
                    
                    <LiquidityTimeline 
                      data={results.yearlyProjections} 
                      downPayment={downPayment}
                    />
                  </div>
                )}

                {activeTab === 'scenarios' && (
                  <div className="space-y-8">
                    <ScenarioOverlayChart 
                      scenarios={scenarios}
                      currentScenario={{
                        name: 'Current',
                        data: results.yearlyProjections,
                        color: '#1f2937'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Summary */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {inputs.timeHorizonYears}-Year Financial Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Renting Scenario</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>Total rent paid: {formatCurrency(finalProjection.totalRentPaid)}</li>
                    <li>Investment value: {formatCurrency(finalProjection.investmentValue)}</li>
                    <li>Net worth: {formatCurrency(finalProjection.rentNetWorth)}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Buying Scenario</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>Total ownership costs: {formatCurrency(finalProjection.cumulativeOwnershipCost)}</li>
                    <li>Home value: {formatCurrency(finalProjection.homeValue)}</li>
                    <li>Home equity: {formatCurrency(finalProjection.homeEquity)}</li>
                    <li>Tax savings: {formatCurrency(results.totalTaxSavings)}</li>
                    <li>Net worth: {formatCurrency(finalProjection.buyNetWorth)}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}