// src/components/chat/GuidedChart.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Target, Lightbulb, TrendingUp, DollarSign, Download, Printer } from 'lucide-react';
import { exportChartToPDF, printChart } from '@/utils/pdfExport';
import { UniversalChart } from './UniversalChart';

interface GuidedChartProps {
  chartType: string;
  data: any[];
  title: string;
  explanation: string;
  inputs?: any;
  onAnimationComplete?: () => void;
  insights?: string[];
  keyPoints?: string[];
  aiResponse?: string;
}

export function GuidedChart({ 
  chartType, 
  data, 
  title, 
  explanation, 
  inputs,
  onAnimationComplete,
  insights = [],
  keyPoints = [],
  aiResponse = ''
}: GuidedChartProps) {
  const [showHighlights, setShowHighlights] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [currentStage, setCurrentStage] = useState(0); // 0: chart, 1: highlights, 2: instructions, 3: insights
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stage 1: Show highlights after chart loads (2 seconds)
    const highlightTimer = setTimeout(() => {
      setShowHighlights(true);
      setCurrentStage(1);
    }, 2000);

    // Stage 2: Show instructions after highlights (1 second later)
    const instructionsTimer = setTimeout(() => {
      setShowInstructions(true);
      setCurrentStage(2);
    }, 3500);

    // Stage 3: Show insights after instructions (1 second later)
    const insightsTimer = setTimeout(() => {
      setShowInsights(true);
      setCurrentStage(3);
      onAnimationComplete?.();
    }, 4500);

    return () => {
      clearTimeout(highlightTimer);
      clearTimeout(instructionsTimer);
      clearTimeout(insightsTimer);
    };
  }, [onAnimationComplete]);

  useEffect(() => {
    // Add a subtle flash when chart is ready to draw attention
    const flashTimer = setTimeout(() => {
      const chartContainer = document.querySelector('.bg-white\\/10');
      if (chartContainer) {
        chartContainer.classList.add('animate-pulse');
        setTimeout(() => {
          chartContainer.classList.remove('animate-pulse');
        }, 500);
      }
    }, 800); // Flash after chart renders

    return () => clearTimeout(flashTimer);
  }, []);

  const handlePDFExport = async () => {
    if (!chartRef.current) return;
    
    setIsExporting(true);
    try {
      const result = await exportChartToPDF({
        chartTitle: title,
        chartExplanation: explanation,
        userInputs: inputs,
        aiResponse: aiResponse,
        chartElement: chartRef.current,
        insights: insights,
        keyPoints: keyPoints
      });
      
      if (result.success) {
        console.log('PDF exported successfully:', result.fileName);
      } else {
        console.error('PDF export failed:', result.error);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    if (!chartRef.current) return;
    
    setIsExporting(true);
    try {
      const result = await printChart({
        chartTitle: title,
        chartExplanation: explanation,
        userInputs: inputs,
        aiResponse: aiResponse,
        chartElement: chartRef.current,
        insights: insights,
        keyPoints: keyPoints
      });
      
      if (!result.success) {
        console.error('Print failed:', result.error);
      }
    } catch (error) {
      console.error('Error printing:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getChartHighlights = () => {
    switch (chartType) {
      case 'networth':
        return [
          { id: 'break-even', label: 'Break-even point', position: 'top-1/2 left-1/2' },
          { id: 'crossing', label: 'Where buying wins', position: 'top-1/3 right-1/3' }
        ];
      case 'cumulative':
        return [
          { id: 'gap', label: 'Cost difference', position: 'top-1/3 left-1/3' }
        ];
      case 'tax':
        return [
          { id: 'savings', label: 'Tax savings', position: 'top-1/4 left-1/4' }
        ];
      default:
        return [];
    }
  };

      return (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 mb-4">
      {/* Export buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          disabled={isExporting}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4" />
          <span className="text-sm">Print</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePDFExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">{isExporting ? 'Exporting...' : 'PDF'}</span>
        </motion.button>
      </div>

      {/* Simple chart with highlights */}
      <div className="relative" ref={chartRef}>
        <UniversalChart
          chartType={chartType}
          data={data}
          inputs={inputs}
          title={title}
          explanation={explanation}
        />
        
        {/* Simple highlights overlay */}
        {showHighlights && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {getChartHighlights().map((highlight, index) => (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.8 }}
                className={`absolute ${highlight.position}`}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                  className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-2xl border-2 border-white"
                >
                  <Target className="w-4 h-4 text-white" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + index * 0.8 }}
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap font-medium shadow-lg"
                >
                  {highlight.label}
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>


      {/* Progress indicator */}
      <div className="flex justify-center mt-3 space-x-2">
        {[0, 1, 2, 3].map((stage) => (
          <motion.div
            key={stage}
            className={`w-2 h-2 rounded-full ${
              stage <= currentStage ? 'bg-blue-400' : 'bg-gray-600'
            }`}
            initial={{ scale: 0 }}
            animate={{ 
              scale: stage <= currentStage ? 1 : 0.7,
              opacity: stage <= currentStage ? 1 : 0.4
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Instructions - appears after highlights */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-4"
          >
            <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
              <div className="flex items-start gap-2">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Target className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                </motion.div>
                <div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm font-medium text-yellow-200 mb-1"
                  >
                    How to read this chart:
                  </motion.p>
                         <motion.div
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ delay: 0.4 }}
                           className="space-y-1"
                         >
                           <p className="text-xs text-yellow-100">• Hover over the chart to see exact values for each year</p>
                           <p className="text-xs text-yellow-100">• Red indicators highlight the most important areas to focus on</p>
                           <p className="text-xs text-yellow-100">• Watch how the lines separate over time - that's your potential savings</p>
                           <p className="text-xs text-yellow-100">• The point where lines cross is your break-even timeline</p>
                         </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Insights - appears after instructions */}
      <AnimatePresence>
        {showInsights && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-3"
          >
            <div className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-400/30">
              <div className="flex items-start gap-2">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <DollarSign className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                </motion.div>
                <div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm font-medium text-white mb-1"
                  >
                    Key insight:
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs text-gray-300"
                  >
                    {insights[0]}
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
