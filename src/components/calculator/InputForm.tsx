// src/components/calculator/InputForm.tsx

import React from 'react';
import { FinancialInputs } from '@/types/calculator';
import { useCalculatorStore } from '@/stores/calculator-store';

export function InputForm() {
  const { inputs, updateInput } = useCalculatorStore();
  
  const handleInputChange = (field: keyof FinancialInputs, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateInput(field, numValue);
    }
  };

  const sectionClass = "bg-white rounded-lg shadow-lg p-6 mb-6";
  const labelClass = "block text-sm font-medium text-black mb-1";
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium";
  const helperTextClass = "text-xs text-black mt-1";

  return (
    <div className="space-y-6">
      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-black mb-4">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Purchase Price</label>
            <input
              type="number"
              className={inputClass}
              value={inputs.homePrice}
              onChange={(e) => handleInputChange('homePrice', e.target.value)}
              placeholder="500000"
            />
          </div>
          <div>
            <label className={labelClass}>Down Payment (%)</label>
            <input
              type="number"
              className={inputClass}
              value={inputs.downPaymentPercent}
              onChange={(e) => handleInputChange('downPaymentPercent', e.target.value)}
              placeholder="20"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className={labelClass}>Current Monthly Rent</label>
            <input
              type="number"
              className={inputClass}
              value={inputs.currentRent}
              onChange={(e) => handleInputChange('currentRent', e.target.value)}
              placeholder="2500"
            />
          </div>
          <div>
            <label className={labelClass}>Time Horizon (Years)</label>
            <input
              type="number"
              className={inputClass}
              value={inputs.timeHorizonYears}
              onChange={(e) => handleInputChange('timeHorizonYears', e.target.value)}
              placeholder="10"
              min="1"
              max="30"
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-black mb-4">Loan Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.interestRate}
              onChange={(e) => handleInputChange('interestRate', e.target.value)}
              placeholder="7.0"
            />
          </div>
          <div>
            <label className={labelClass}>Loan Term (Years)</label>
            <input
              type="number"
              className={inputClass}
              value={inputs.loanTermYears}
              onChange={(e) => handleInputChange('loanTermYears', e.target.value)}
              placeholder="30"
            />
          </div>
          <div>
            <label className={labelClass}>PMI Rate (%)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.pmiRate}
              onChange={(e) => handleInputChange('pmiRate', e.target.value)}
              placeholder="0.5"
            />
            <p className={helperTextClass}>Only applies if down payment &lt; 20%</p>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-black mb-4">Ongoing Costs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Property Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.propertyTaxRate}
              onChange={(e) => handleInputChange('propertyTaxRate', e.target.value)}
              placeholder="1.2"
            />
          </div>
          <div>
            <label className={labelClass}>Annual Home Insurance</label>
            <input
              type="number"
              className={inputClass}
              value={inputs.homeInsurance}
              onChange={(e) => handleInputChange('homeInsurance', e.target.value)}
              placeholder="1200"
            />
          </div>
          <div>
            <label className={labelClass}>Maintenance Rate (% of home value)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.maintenanceRate}
              onChange={(e) => handleInputChange('maintenanceRate', e.target.value)}
              placeholder="1.0"
            />
          </div>
          <div>
            <label className={labelClass}>Monthly HOA Fees</label>
            <input
              type="number"
              className={inputClass}
              value={inputs.hoaFees}
              onChange={(e) => handleInputChange('hoaFees', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-black mb-4">Transaction Costs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Closing Costs (%)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.closingCostsPercent}
              onChange={(e) => handleInputChange('closingCostsPercent', e.target.value)}
              placeholder="3.0"
            />
            <p className={helperTextClass}>Percentage of home price</p>
          </div>
          <div>
            <label className={labelClass}>Selling Costs (%)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.sellingCostsPercent}
              onChange={(e) => handleInputChange('sellingCostsPercent', e.target.value)}
              placeholder="6.0"
            />
            <p className={helperTextClass}>Percentage of home price</p>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-black mb-4">Growth Assumptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Annual Rent Growth (%)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.rentGrowthRate}
              onChange={(e) => handleInputChange('rentGrowthRate', e.target.value)}
              placeholder="3.5"
            />
          </div>
          <div>
            <label className={labelClass}>Home Appreciation Rate (%)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.homeAppreciationRate}
              onChange={(e) => handleInputChange('homeAppreciationRate', e.target.value)}
              placeholder="3.5"
            />
            <p className={helperTextClass}>Historical average: 3-4% annually</p>
          </div>
          <div>
            <label className={labelClass}>Investment Return (%)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.investmentReturn}
              onChange={(e) => handleInputChange('investmentReturn', e.target.value)}
              placeholder="8.0"
            />
          </div>
          <div>
            <label className={labelClass}>Inflation Rate (%)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.inflationRate}
              onChange={(e) => handleInputChange('inflationRate', e.target.value)}
              placeholder="2.5"
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-black mb-4">Tax Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Marginal Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={inputs.marginalTaxRate}
              onChange={(e) => handleInputChange('marginalTaxRate', e.target.value)}
              placeholder="24"
            />
          </div>
          <div>
            <label className={labelClass}>Other Annual Deductions</label>
            <input
              type="number"
              className={inputClass}
              value={inputs.otherDeductions}
              onChange={(e) => handleInputChange('otherDeductions', e.target.value)}
              placeholder="5000"
            />
            <p className={helperTextClass}>Charitable, medical, etc.</p>
          </div>
        </div>
      </div>
    </div>
  );
}