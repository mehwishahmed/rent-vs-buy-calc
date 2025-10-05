// src/types/calculator.ts

export interface FinancialInputs {
  // Property details
  homePrice: number;
  downPaymentPercent: number;
  currentRent: number;
  
  // Loan details
  interestRate: number;
  loanTermYears: number;
  pmiRate: number; // Annual PMI rate as percentage of loan amount
  
  // Ongoing costs
  propertyTaxRate: number;
  homeInsurance: number;
  maintenanceRate: number;
  hoaFees: number;
  
  // Rent assumptions
  rentGrowthRate: number;
  
  // Investment assumptions
  investmentReturn: number;
  inflationRate: number;
  homeAppreciationRate: number;
  
  // Personal details
  timeHorizonYears: number;
  marginalTaxRate: number;
  
  // Additional tax deductions
  otherDeductions: number; // Annual other itemized deductions (charitable, medical, etc.)
  
  // Transaction costs
  closingCostsPercent: number; // Percentage of home price for closing costs
  sellingCostsPercent: number; // Percentage of home price for selling costs
}

export interface MonteCarloInputs {
  // Volatility parameters
  homePriceVolatility: number;
  rentVolatility: number;
  stockMarketVolatility: number;
  simulations: number;
}

export interface YearlyProjection {
  year: number;
  
  // Rent scenario
  rentPayment: number;
  totalRentPaid: number;
  rentUpfrontCosts: number;
  
  // Buy scenario
  mortgagePayment: number;
  pmiPayment: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  hoa: number;
  totalOwnershipCost: number;
  cumulativeOwnershipCost: number;
  homeValue: number;
  mortgageBalance: number;
  homeEquity: number;
  buyUpfrontCosts: number;
  
  // Tax benefits
  mortgageInterestPaid: number;
  propertyTaxPaid: number;
  taxSavings: number;
  
  // Investment scenario (if renting)
  investmentValue: number;
  
  // Net worth comparison
  rentNetWorth: number;
  buyNetWorth: number;
  
  // Annual cash flow
  rentCashFlow: number;
  buyCashFlow: number;
  
  // Liquidity costs (if selling)
  sellingCosts: number;
  netProceedsIfSold: number;
}

export interface MonteCarloResult {
  year: number;
  rentNetWorth: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  buyNetWorth: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
}

export interface SensitivityAnalysis {
  parameter: string;
  values: number[];
  breakEvenYears: (number | null)[];
  finalNetWorthDifferences: number[];
}

export interface Scenario {
  id: string;
  name: string;
  inputs: FinancialInputs;
  results: CalculationResults;
  color: string;
}

export interface CalculationResults {
  yearlyProjections: YearlyProjection[];
  breakEvenYear: number | null;
  totalCostRent: number;
  totalCostBuy: number;
  netWorthDifference: number;
  totalTaxSavings: number;
  totalInterestPaid: number;
  monteCarloResults?: MonteCarloResult[];
}

export interface ChartDataPoint {
  year: number;
  rentCumulative: number;
  buyCumulative: number;
  rentNetWorth: number;
  buyNetWorth: number;
  rentCashFlow: number;
  buyCashFlow: number;
  taxSavings: number;
}