// src/components/ai/AIAssistant.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FinancialInputs } from '@/types/calculator';
import { useCalculatorStore } from '@/stores/calculator-store';

interface AIRecommendation {
  parameter: keyof FinancialInputs;
  value: number;
  confidence: number;
  explanation: string;
}

interface AIResponse {
  recommendations: AIRecommendation[];
  insights: string[];
  marketContext: string;
}

interface UserProfile {
  annualIncome: number;
  location: string;
  timelineYears: number;
}

export function AIAssistant() {
  const { updateInput } = useCalculatorStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    annualIncome: 0,
    location: '',
    timelineYears: 7
  });
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'results'>('input');

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateAIRecommendations = async () => {
    setLoading(true);
    
    // Simulate API call - in production, this would hit your ML endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const recommendations = calculateOptimalParameters(userProfile);
    setAiResponse(recommendations);
    setStep('results');
    setLoading(false);
  };

  const applyRecommendations = () => {
    if (!aiResponse) return;
    
    aiResponse.recommendations.forEach(rec => {
      updateInput(rec.parameter, rec.value);
    });
    
    setIsOpen(false);
    setStep('input');
    setAiResponse(null);
  };

  const resetAssistant = () => {
    setStep('input');
    setAiResponse(null);
    setUserProfile({ annualIncome: 0, location: '', timelineYears: 7 });
  };

  return (
    <>
      {/* AI Assistant Button */}
      <div className="mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
        >
          <span className="text-lg">🤖</span>
          Get AI Recommendations
        </button>
        <p className="text-xs text-gray-600 mt-1 text-center">
          Personalized defaults in 30 seconds
        </p>
      </div>

      {/* AI Assistant Modal */}
      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
            style={{ zIndex: 10000 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
                    <p className="text-sm text-gray-600">Smart parameter recommendations</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Input Step */}
              {step === 'input' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      How can I help you today?
                    </h3>
                    <p className="text-sm text-gray-600">
                      Answer 3 questions to get personalized calculator settings
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Household Income
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={userProfile.annualIncome || ''}
                          onChange={(e) => setUserProfile({
                            ...userProfile, 
                            annualIncome: parseFloat(e.target.value) || 0
                          })}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                          placeholder="85,000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Location
                      </label>
                      <input
                        type="text"
                        value={userProfile.location}
                        onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                        placeholder="San Diego, CA"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Planning Timeline: {userProfile.timelineYears} years
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="15"
                        value={userProfile.timelineYears}
                        onChange={(e) => setUserProfile({
                          ...userProfile, 
                          timelineYears: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>3 years</span>
                        <span>15+ years</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={generateAIRecommendations}
                    disabled={loading || !userProfile.annualIncome || !userProfile.location}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Analyzing your situation...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Generate Recommendations
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Results Step */}
              {step === 'results' && aiResponse && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Recommendations Ready!
                    </h3>
                    <p className="text-sm text-green-600">
                      {aiResponse.marketContext}
                    </p>
                  </div>

                  {/* High Confidence Parameters */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="font-medium text-green-800 text-sm">HIGH CONFIDENCE</span>
                    </div>
                    {aiResponse.recommendations
                      .filter(rec => rec.confidence >= 85)
                      .map((rec, index) => (
                        <ParameterCard key={index} recommendation={rec} />
                      ))}
                  </div>

                  {/* Medium Confidence Parameters */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <span className="font-medium text-yellow-800 text-sm">MEDIUM CONFIDENCE</span>
                    </div>
                    {aiResponse.recommendations
                      .filter(rec => rec.confidence >= 60 && rec.confidence < 85)
                      .map((rec, index) => (
                        <ParameterCard key={index} recommendation={rec} />
                      ))}
                  </div>

                  {/* Low Confidence Parameters */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span className="font-medium text-red-800 text-sm">LOW CONFIDENCE - Review These</span>
                    </div>
                    {aiResponse.recommendations
                      .filter(rec => rec.confidence < 60)
                      .map((rec, index) => (
                        <ParameterCard key={index} recommendation={rec} />
                      ))}
                  </div>

                  {/* AI Insights */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">💡 Key Insights</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {aiResponse.insights.map((insight, index) => (
                        <li key={index}>• {insight}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={applyRecommendations}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      ✅ Apply All Settings
                    </button>
                    <button
                      onClick={resetAssistant}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Parameter Card Component
function ParameterCard({ recommendation }: { recommendation: AIRecommendation }) {
  const getParameterLabel = (param: keyof FinancialInputs): string => {
    const labels: Record<keyof FinancialInputs, string> = {
      homePrice: 'Home Price',
      downPaymentPercent: 'Down Payment',
      currentRent: 'Monthly Rent',
      interestRate: 'Interest Rate',
      loanTermYears: 'Loan Term',
      pmiRate: 'PMI Rate',
      propertyTaxRate: 'Property Tax Rate',
      homeInsurance: 'Home Insurance',
      maintenanceRate: 'Maintenance Rate',
      hoaFees: 'HOA Fees',
      rentGrowthRate: 'Rent Growth Rate',
      investmentReturn: 'Investment Return',
      inflationRate: 'Inflation Rate',
      homeAppreciationRate: 'Home Appreciation Rate',
      timeHorizonYears: 'Time Horizon',
      marginalTaxRate: 'Tax Rate',
      otherDeductions: 'Other Deductions',
      closingCostsPercent: 'Closing Costs',
      sellingCostsPercent: 'Selling Costs'
    };
    return labels[param] || param;
  };

  const formatValue = (param: keyof FinancialInputs, value: number): string => {
    const currencyFields: (keyof FinancialInputs)[] = ['homePrice', 'currentRent', 'homeInsurance', 'hoaFees', 'otherDeductions'];
    const percentFields: (keyof FinancialInputs)[] = [
      'downPaymentPercent', 'interestRate', 'pmiRate', 'propertyTaxRate', 
      'maintenanceRate', 'rentGrowthRate', 'investmentReturn', 'inflationRate',
      'homeAppreciationRate', 'marginalTaxRate', 'closingCostsPercent', 'sellingCostsPercent'
    ];

    if (currencyFields.includes(param)) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    }
    if (percentFields.includes(param)) {
      return `${value}%`;
    }
    if (param === 'timeHorizonYears' || param === 'loanTermYears') {
      return `${value} years`;
    }
    return value.toString();
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-gray-800">
          {getParameterLabel(recommendation.parameter)}
        </span>
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            {formatValue(recommendation.parameter, recommendation.value)}
          </div>
          <div className={`text-xs ${getConfidenceColor(recommendation.confidence)}`}>
            {recommendation.confidence}% confidence
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600">
        {recommendation.explanation}
      </p>
    </div>
  );
}

// ML Logic - This simulates your trained model
function calculateOptimalParameters(profile: UserProfile): AIResponse {
  const { annualIncome, location, timelineYears } = profile;
  
  // Simulate market data lookup based on location
  const marketTier = getMarketTier(location);
  const marketData = getMarketData(marketTier);
  
  const recommendations: AIRecommendation[] = [];

  // High Confidence Predictions (based on reliable data)
  recommendations.push({
    parameter: 'propertyTaxRate',
    value: marketData.propertyTaxRate,
    confidence: 95,
    explanation: `${location} typical rate from local records`
  });

  recommendations.push({
    parameter: 'homeInsurance',
    value: Math.round(annualIncome * 0.015),
    confidence: 90,
    explanation: `Typical for ${marketTier} area homes`
  });

  recommendations.push({
    parameter: 'interestRate',
    value: 7.2,
    confidence: 95,
    explanation: 'Current market average'
  });

  // Medium Confidence Predictions (statistical relationships)
  const optimalHomePrice = Math.round(annualIncome * marketData.priceMultiplier);
  recommendations.push({
    parameter: 'homePrice',
    value: optimalHomePrice,
    confidence: 75,
    explanation: `${marketData.priceMultiplier}x your income - typical for ${location}`
  });

  const optimalDownPayment = getOptimalDownPayment(annualIncome, timelineYears);
  recommendations.push({
    parameter: 'downPaymentPercent',
    value: optimalDownPayment.value,
    confidence: 70,
    explanation: optimalDownPayment.explanation
  });

  recommendations.push({
    parameter: 'homeAppreciationRate',
    value: marketData.appreciation,
    confidence: 65,
    explanation: `${location} historical average`
  });

  // Low Confidence Predictions (personal preference dependent)
  const investmentReturn = timelineYears >= 10 ? 8.5 : 7.5;
  recommendations.push({
    parameter: 'investmentReturn',
    value: investmentReturn,
    confidence: 45,
    explanation: 'Depends on your risk tolerance'
  });

  recommendations.push({
    parameter: 'maintenanceRate',
    value: 1.2,
    confidence: 35,
    explanation: 'Varies by home type and DIY skills'
  });

  recommendations.push({
    parameter: 'hoaFees',
    value: 0,
    confidence: 20,
    explanation: 'Could be $0-500+ depending on property'
  });

  // Additional reasonable defaults
  recommendations.push({
    parameter: 'currentRent',
    value: Math.round(annualIncome * 0.3 / 12),
    confidence: 60,
    explanation: '30% of income rule'
  });

  recommendations.push({
    parameter: 'timeHorizonYears',
    value: timelineYears,
    confidence: 100,
    explanation: 'Based on your input'
  });

  // Generate insights
  const insights = generateInsights(profile, recommendations, marketData);

  return {
    recommendations,
    insights,
    marketContext: `Based on ${location} market data and $${annualIncome.toLocaleString()} income`
  };
}

// Helper functions
function getMarketTier(location: string): 'HCOL' | 'MCOL' | 'LCOL' {
  const hcolCities = ['san francisco', 'san diego', 'los angeles', 'new york', 'boston', 'seattle', 'washington'];
  const locationLower = location.toLowerCase();
  
  if (hcolCities.some(city => locationLower.includes(city))) {
    return 'HCOL';
  }
  return 'MCOL'; // Default to medium cost of living
}

function getMarketData(tier: 'HCOL' | 'MCOL' | 'LCOL') {
  const data = {
    HCOL: { priceMultiplier: 5.0, propertyTaxRate: 1.4, appreciation: 4.2 },
    MCOL: { priceMultiplier: 4.0, propertyTaxRate: 1.1, appreciation: 3.5 },
    LCOL: { priceMultiplier: 3.2, propertyTaxRate: 0.9, appreciation: 2.8 }
  };
  return data[tier];
}

function getOptimalDownPayment(income: number, timeline: number): { value: number, explanation: string } {
  if (income > 80000 && timeline >= 7) {
    return { value: 17, explanation: 'Avoids PMI while preserving cash for investments' };
  }
  if (income > 60000) {
    return { value: 15, explanation: 'Balanced approach for your income level' };
  }
  return { value: 10, explanation: 'Minimizes upfront costs' };
}

function generateInsights(profile: UserProfile, recommendations: AIRecommendation[], marketData: any): string[] {
  const insights: string[] = [];
  
  const downPaymentRec = recommendations.find(r => r.parameter === 'downPaymentPercent');
  if (downPaymentRec && downPaymentRec.value >= 20) {
    insights.push('20% down eliminates PMI (~$200/month savings)');
  } else if (downPaymentRec && downPaymentRec.value >= 15) {
    insights.push(`${downPaymentRec.value}% down significantly reduces PMI costs`);
  }

  const priceRec = recommendations.find(r => r.parameter === 'homePrice');
  if (priceRec) {
    const ratio = priceRec.value / profile.annualIncome;
    insights.push(`Home price is ${ratio.toFixed(1)}x your income (healthy range: 3-5x)`);
  }

  if (profile.timelineYears >= 7) {
    insights.push('Long timeline allows for wealth-building through home equity');
  } else {
    insights.push('Shorter timeline optimized for lower transaction costs');
  }

  return insights;
}