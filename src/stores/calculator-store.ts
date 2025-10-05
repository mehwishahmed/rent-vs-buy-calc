// src/stores/calculator-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FinancialInputs, CalculationResults, Scenario, MonteCarloInputs } from '@/types/calculator';

interface CalculatorStore {
  inputs: FinancialInputs;
  results: CalculationResults | null;
  isCalculating: boolean;
  
  // Scenarios management
  scenarios: Scenario[];
  activeScenarioId: string | null;
  
  // Monte Carlo settings
  monteCarloInputs: MonteCarloInputs;
  showMonteCarlo: boolean;
  
  updateInput: <K extends keyof FinancialInputs>(key: K, value: FinancialInputs[K]) => void;
  setResults: (results: CalculationResults) => void;
  setCalculating: (calculating: boolean) => void;
  resetInputs: () => void;
  
  // Scenario methods
  saveScenario: (name: string) => void;
  loadScenario: (id: string) => void;
  deleteScenario: (id: string) => void;
  updateScenarioName: (id: string, name: string) => void;
  
  // Monte Carlo methods
  updateMonteCarloInput: <K extends keyof MonteCarloInputs>(key: K, value: MonteCarloInputs[K]) => void;
  toggleMonteCarlo: () => void;
}

const defaultInputs: FinancialInputs = {
  // Property details
  homePrice: 500000,
  downPaymentPercent: 20,
  currentRent: 2500,
  
  // Loan details
  interestRate: 7.0,
  loanTermYears: 30,
  pmiRate: 0.5, // 0.5% annual PMI rate
  
  // Ongoing costs
  propertyTaxRate: 1.2,
  homeInsurance: 1200,
  maintenanceRate: 1.0,
  hoaFees: 0,
  
  // Rent assumptions
  rentGrowthRate: 3.5,
  
  // Investment assumptions
  investmentReturn: 8.0,
  inflationRate: 2.5,
  homeAppreciationRate: 3.5,
  
  // Personal details
  timeHorizonYears: 10,
  marginalTaxRate: 24,
  
  // Additional tax deductions
  otherDeductions: 5000, // $5,000 annual other deductions
  
  // Transaction costs
  closingCostsPercent: 3.0, // 3% of home price for closing costs
  sellingCostsPercent: 6.0, // 6% of home price for selling costs
};

const defaultMonteCarloInputs: MonteCarloInputs = {
  homePriceVolatility: 15, // 15% standard deviation
  rentVolatility: 10, // 10% standard deviation
  stockMarketVolatility: 20, // 20% standard deviation
  simulations: 1000,
};

const scenarioColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set, get) => ({
      inputs: defaultInputs,
      results: null,
      isCalculating: false,
      scenarios: [],
      activeScenarioId: null,
      monteCarloInputs: defaultMonteCarloInputs,
      showMonteCarlo: false,
  
      updateInput: (key, value) => {
        set(state => {
          const newInputs = { ...state.inputs, [key]: value };
          return { inputs: newInputs };
        });
      },
  
      setResults: (results) => {
        set({ results, isCalculating: false });
      },
      
      setCalculating: (calculating) => {
        set({ isCalculating: calculating });
      },
      
      resetInputs: () => {
        set({ inputs: defaultInputs, results: null });
      },
      
      saveScenario: (name) => {
        const state = get();
        if (!state.results) return;
        
        const newScenario: Scenario = {
          id: Date.now().toString(),
          name,
          inputs: { ...state.inputs },
          results: state.results,
          color: scenarioColors[state.scenarios.length % scenarioColors.length],
        };
        
        set(state => ({
          scenarios: [...state.scenarios, newScenario],
          activeScenarioId: newScenario.id,
        }));
      },
      
      loadScenario: (id) => {
        const state = get();
        const scenario = state.scenarios.find(s => s.id === id);
        if (scenario) {
          set({
            inputs: { ...scenario.inputs },
            results: scenario.results,
            activeScenarioId: id,
          });
        }
      },
      
      deleteScenario: (id) => {
        set(state => ({
          scenarios: state.scenarios.filter(s => s.id !== id),
          activeScenarioId: state.activeScenarioId === id ? null : state.activeScenarioId,
        }));
      },
      
      updateScenarioName: (id, name) => {
        set(state => ({
          scenarios: state.scenarios.map(s => 
            s.id === id ? { ...s, name } : s
          ),
        }));
      },
      
      updateMonteCarloInput: (key, value) => {
        set(state => ({
          monteCarloInputs: { ...state.monteCarloInputs, [key]: value }
        }));
      },
      
      toggleMonteCarlo: () => {
        set(state => ({ showMonteCarlo: !state.showMonteCarlo }));
      },
    }),
    {
      name: 'calculator-store',
      // Don't persist inputs or isCalculating - start fresh each time
      partialize: (state) => ({
        scenarios: state.scenarios,
        activeScenarioId: state.activeScenarioId,
        monteCarloInputs: state.monteCarloInputs,
        showMonteCarlo: state.showMonteCarlo,
      }),
    }
  )
);