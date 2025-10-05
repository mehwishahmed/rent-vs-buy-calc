// src/utils/calculations.ts

import { FinancialInputs, CalculationResults, YearlyProjection, MonteCarloInputs, MonteCarloResult, SensitivityAnalysis } from '@/types/calculator';

export function calculateMortgagePayment(
  principal: number, 
  annualRate: number, 
  termYears: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) return principal / numPayments;
  
  // Use higher precision calculation to reduce rounding errors
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  // Round to 2 decimal places for consistency
  return Math.round(payment * 100) / 100;
}

// Generate random number with normal distribution
function randomNormal(mean: number = 0, stdDev: number = 1): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

export function runMonteCarloSimulation(
  inputs: FinancialInputs, 
  monteCarloInputs: MonteCarloInputs
): MonteCarloResult[] {
  const results: MonteCarloResult[] = [];
  const simulations: CalculationResults[] = [];
  
  // Run simulations
  for (let i = 0; i < monteCarloInputs.simulations; i++) {
    const randomInputs = { ...inputs };
    
    // Add volatility to key parameters
    const homeVolatility = monteCarloInputs.homePriceVolatility / 100;
    const rentVolatility = monteCarloInputs.rentVolatility / 100;
    const stockVolatility = monteCarloInputs.stockMarketVolatility / 100;
    
    randomInputs.homeAppreciationRate += randomNormal(0, homeVolatility * 100);
    randomInputs.rentGrowthRate += randomNormal(0, rentVolatility * 100);
    randomInputs.investmentReturn += randomNormal(0, stockVolatility * 100);
    
    const simulation = calculateRentVsBuy(randomInputs);
    simulations.push(simulation);
  }
  
  // Calculate percentiles for each year
  for (let year = 1; year <= inputs.timeHorizonYears; year++) {
    const rentNetWorths = simulations.map(s => s.yearlyProjections[year - 1]?.rentNetWorth || 0);
    const buyNetWorths = simulations.map(s => s.yearlyProjections[year - 1]?.buyNetWorth || 0);
    
    rentNetWorths.sort((a, b) => a - b);
    buyNetWorths.sort((a, b) => a - b);
    
    const getPercentile = (arr: number[], p: number) => {
      const index = Math.floor(arr.length * p / 100);
      return arr[Math.min(index, arr.length - 1)];
    };
    
    results.push({
      year,
      rentNetWorth: {
        p10: getPercentile(rentNetWorths, 10),
        p25: getPercentile(rentNetWorths, 25),
        p50: getPercentile(rentNetWorths, 50),
        p75: getPercentile(rentNetWorths, 75),
        p90: getPercentile(rentNetWorths, 90),
      },
      buyNetWorth: {
        p10: getPercentile(buyNetWorths, 10),
        p25: getPercentile(buyNetWorths, 25),
        p50: getPercentile(buyNetWorths, 50),
        p75: getPercentile(buyNetWorths, 75),
        p90: getPercentile(buyNetWorths, 90),
      },
    });
  }
  
  return results;
}

export function runSensitivityAnalysis(baseInputs: FinancialInputs): SensitivityAnalysis[] {
  const analyses: SensitivityAnalysis[] = [];
  
  // Analyze sensitivity to key parameters
  const parameters = [
    { key: 'homePrice', name: 'Home Price', baseValue: baseInputs.homePrice, range: [-20, -10, 0, 10, 20] },
    { key: 'interestRate', name: 'Interest Rate', baseValue: baseInputs.interestRate, range: [-2, -1, 0, 1, 2] },
    { key: 'homeAppreciationRate', name: 'Home Appreciation', baseValue: baseInputs.homeAppreciationRate, range: [-2, -1, 0, 1, 2] },
    { key: 'rentGrowthRate', name: 'Rent Growth', baseValue: baseInputs.rentGrowthRate, range: [-2, -1, 0, 1, 2] },
  ];
  
  parameters.forEach(param => {
    const values: number[] = [];
    const breakEvenYears: (number | null)[] = [];
    const finalNetWorthDifferences: number[] = [];
    
    param.range.forEach(delta => {
      const testInputs = { ...baseInputs };
      let testValue;
      
      if (param.key === 'homePrice') {
        testValue = param.baseValue * (1 + delta / 100);
      } else {
        testValue = param.baseValue + delta;
      }
      
      (testInputs as any)[param.key] = testValue;
      values.push(testValue);
      
      const result = calculateRentVsBuy(testInputs);
      breakEvenYears.push(result.breakEvenYear);
      finalNetWorthDifferences.push(result.netWorthDifference);
    });
    
    analyses.push({
      parameter: param.name,
      values,
      breakEvenYears,
      finalNetWorthDifferences,
    });
  });
  
  return analyses;
}

export function calculateRentVsBuy(inputs: FinancialInputs): CalculationResults {
  const {
    homePrice,
    downPaymentPercent,
    currentRent,
    interestRate,
    loanTermYears,
    pmiRate,
    propertyTaxRate,
    homeInsurance,
    maintenanceRate,
    hoaFees,
    rentGrowthRate,
    investmentReturn,
    inflationRate,
    homeAppreciationRate,
    timeHorizonYears,
    marginalTaxRate,
    otherDeductions,
    closingCostsPercent,
    sellingCostsPercent
  } = inputs;


  const downPayment = homePrice * (downPaymentPercent / 100);
  const loanAmount = homePrice - downPayment;
  const monthlyMortgage = calculateMortgagePayment(loanAmount, interestRate, loanTermYears);
  const annualMortgage = monthlyMortgage * 12;

  // Calculate PMI if down payment is less than 20%
  const hasPMI = downPaymentPercent < 20;
  const annualPMI = hasPMI ? loanAmount * (pmiRate / 100) : 0;

  // Calculate closing costs
  const closingCosts = homePrice * (closingCostsPercent / 100);
  
  // Calculate upfront costs
  const buyUpfrontCosts = downPayment + closingCosts + (homePrice * 0.01); // Adding 1% for moving costs, immediate repairs, etc.
  const rentUpfrontCosts = currentRent * 2; // 2 months rent for security deposit and first month

  const yearlyProjections: YearlyProjection[] = [];
  let cumulativeRentCost = 0;
  let cumulativeOwnershipCost = 0;
  let cumulativeTaxSavings = 0;
  let currentRentPayment = currentRent * 12;
  let mortgageBalance = loanAmount;
  let currentHomeValue = homePrice;
  let investmentValue = downPayment; // When renting, you invest the down payment amount
  
  let breakEvenYear: number | null = null;



  for (let year = 1; year <= timeHorizonYears; year++) {
    // Rent scenario calculations
    cumulativeRentCost += currentRentPayment;
    
    // Calculate what mortgage payment would be for comparison
    const monthlyMortgageForComparison = calculateMortgagePayment(loanAmount, interestRate, loanTermYears);
    const annualMortgageForComparison = monthlyMortgageForComparison * 12;
    const annualPropertyTaxForComparison = currentHomeValue * (propertyTaxRate / 100);
    const annualMaintenanceForComparison = currentHomeValue * (maintenanceRate / 100);
    const annualPMIForComparison = hasPMI ? loanAmount * (pmiRate / 100) : 0;
    const totalAnnualOwnershipCostForComparison = annualMortgageForComparison + annualPMIForComparison + annualPropertyTaxForComparison + homeInsurance + annualMaintenanceForComparison + hoaFees;
    
    // Monthly savings from renting vs buying (negative if rent is higher)
    const monthlySavings = (totalAnnualOwnershipCostForComparison / 12) - (currentRentPayment / 12);
    const annualSavings = monthlySavings * 12;
    
    // Investment growth (if renting and investing down payment + monthly savings)
    investmentValue *= (1 + investmentReturn / 100);
    investmentValue += annualSavings; // Add monthly savings to investment

    // Buy scenario calculations
    const annualPropertyTax = currentHomeValue * (propertyTaxRate / 100);
    const annualMaintenance = currentHomeValue * (maintenanceRate / 100);
    
    // Calculate PMI dynamically based on current loan-to-value ratio
    const currentLTV = mortgageBalance / currentHomeValue;
    const annualPMI = currentLTV > 0.8 ? mortgageBalance * (pmiRate / 100) : 0;
    
    const totalAnnualOwnershipCost = annualMortgage + annualPMI + annualPropertyTax + homeInsurance + annualMaintenance + hoaFees;
    
    cumulativeOwnershipCost += totalAnnualOwnershipCost;

    // Calculate mortgage balance and interest with improved precision
    const interestPayment = mortgageBalance * (interestRate / 100);
    const principalPayment = Math.min(annualMortgage - interestPayment, mortgageBalance);
    mortgageBalance = Math.max(0, mortgageBalance - principalPayment);
    
    // Round mortgage balance to 2 decimal places for consistency
    mortgageBalance = Math.round(mortgageBalance * 100) / 100;

    // Home value appreciation
    currentHomeValue *= (1 + homeAppreciationRate / 100);
    const homeEquity = Math.round((currentHomeValue - mortgageBalance) * 100) / 100;

    // Tax benefits calculation
    const deductibleInterest = interestPayment;
    const deductiblePropertyTax = Math.min(annualPropertyTax, 10000); // SALT cap
    const totalDeductions = deductibleInterest + deductiblePropertyTax + otherDeductions;
    const standardDeduction = 29200; // 2024 married filing jointly
    
    // Only get tax benefit if itemizing beats standard deduction
    const taxSavings = Math.max(0, (totalDeductions - standardDeduction) * (marginalTaxRate / 100));
    cumulativeTaxSavings += taxSavings;

    // Selling costs
    const sellingCosts = currentHomeValue * (sellingCostsPercent / 100);
    const netProceedsIfSold = currentHomeValue - mortgageBalance - sellingCosts;

    // Net worth calculations
    const rentNetWorth = investmentValue - cumulativeRentCost;
    const buyNetWorth = year === timeHorizonYears ? netProceedsIfSold : homeEquity;

    // Annual cash flow (negative = outflow)
    const rentCashFlow = -currentRentPayment;
    const buyCashFlow = -(totalAnnualOwnershipCost - taxSavings);

    // Check for break-even point - find the FIRST year where the advantage switches
    // This represents when one option "breaks even" with the other and then takes the lead
    if (breakEvenYear === null) {
      const currentAdvantage = rentNetWorth > buyNetWorth ? 'rent' : 'buy';
      
      if (year === 1) {
        // Store the initial advantage
        const initialAdvantage = currentAdvantage;
      } else {
        // Check if advantage switched from previous year
        const previousProjection = yearlyProjections[year - 2];
        const previousAdvantage = previousProjection.rentNetWorth > previousProjection.buyNetWorth ? 'rent' : 'buy';
        const currentAdvantage = rentNetWorth > buyNetWorth ? 'rent' : 'buy';
        
        if (previousAdvantage !== currentAdvantage) {
          // Advantage switched, this is the break-even year
          breakEvenYear = year;
        }
      }
    }
    


    yearlyProjections.push({
      year,
      rentPayment: currentRentPayment,
      totalRentPaid: cumulativeRentCost,
      rentUpfrontCosts: year === 1 ? rentUpfrontCosts : 0, // Only include in first year
      mortgagePayment: annualMortgage,
      pmiPayment: annualPMI,
      propertyTax: annualPropertyTax,
      insurance: homeInsurance,
      maintenance: annualMaintenance,
      hoa: hoaFees,
      totalOwnershipCost: totalAnnualOwnershipCost,
      cumulativeOwnershipCost,
      homeValue: currentHomeValue,
      mortgageBalance,
      homeEquity,
      buyUpfrontCosts: year === 1 ? buyUpfrontCosts : 0, // Only include in first year
      mortgageInterestPaid: interestPayment,
      propertyTaxPaid: annualPropertyTax,
      taxSavings,
      investmentValue,
      rentNetWorth,
      buyNetWorth,
      rentCashFlow,
      buyCashFlow,
      sellingCosts,
      netProceedsIfSold,
    });

    // Update for next year
    currentRentPayment *= (1 + rentGrowthRate / 100);
  }

  const finalProjection = yearlyProjections[yearlyProjections.length - 1];
  
  // Calculate total interest paid over the time horizon
  const totalInterestPaid = yearlyProjections.reduce((sum, projection) => sum + projection.mortgageInterestPaid, 0);
  
  return {
    yearlyProjections,
    breakEvenYear,
    totalCostRent: finalProjection.totalRentPaid + rentUpfrontCosts,
    totalCostBuy: finalProjection.cumulativeOwnershipCost + buyUpfrontCosts,
    netWorthDifference: finalProjection.buyNetWorth - finalProjection.rentNetWorth,
    totalTaxSavings: cumulativeTaxSavings,
    totalInterestPaid,
  };
}