import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageCircle, BarChart3, ArrowRight, Zap } from 'lucide-react';
import { useCalculatorStore } from '@/stores/calculator-store';
import { calculateRentVsBuy } from '@/utils/calculations';
import { TypingAnimation } from './TypingAnimation';
import { GuidedChart } from './GuidedChart';
import { aiService } from '@/services/aiService';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  showChart?: boolean;
  chartType?: string;
  isTyping?: boolean;
  typingComplete?: boolean;
  chartData?: any[];
  chartInputs?: any;
  chartTitle?: string;
  chartExplanation?: string;
  chartInsights?: string[];
  chartKeyPoints?: string[];
  followUpQuestions?: string[];
}

interface ChatInterfaceProps {
  onSwitchToDashboard: () => void;
}

interface UserContext {
  homePrice?: number;
  currentRent?: number;
  downPayment?: number;
  interestRate?: number;
  timeHorizon?: number;
  location?: string;
  previousMessages: string[];
}

export function ChatInterface({ onSwitchToDashboard }: ChatInterfaceProps) {
  const { inputs, updateInput, setResults, resetInputs } = useCalculatorStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProvidedContext, setUserProvidedContext] = useState<Partial<UserContext>>({
    previousMessages: []
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clear calculator inputs when chat starts
  useEffect(() => {
    resetInputs();
  }, [resetInputs]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractContextFromMessage = (message: string): Partial<UserContext> => {
    const context: Partial<UserContext> = {};
    
    // Extract home price
    const homePriceMatch = message.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|thousand|k home|home)/i);
    if (homePriceMatch) {
      context.homePrice = parseFloat(homePriceMatch[1].replace(/,/g, '')) * 1000;
    }

    // Extract rent
    const rentPatterns = [
      /\$(\d{1,4})\s*(?:rent|month|per month)/i,
      /paying\s*\$(\d{1,4})/i,
      /rent.*\$(\d{1,4})/i
    ];
    
    for (const pattern of rentPatterns) {
      const match = message.match(pattern);
      if (match) {
        context.currentRent = parseFloat(match[1]);
        break;
      }
    }

    // Extract location
    const cities = ['denver', 'austin', 'seattle', 'portland', 'san francisco', 'los angeles', 'chicago', 'new york', 'miami', 'atlanta'];
    const lowerMessage = message.toLowerCase();
    for (const city of cities) {
      if (lowerMessage.includes(city)) {
        context.location = city;
        break;
      }
    }

    // Extract time horizon
    const timeMatch = message.match(/(\d+)\s*(?:years?|yrs?)/i);
    if (timeMatch) {
      context.timeHorizon = parseInt(timeMatch[1]);
    }

    return context;
  };

  const handleSendMessage = async () => {
    const messageToSend = inputValue.trim();
    if (!messageToSend) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Extract context from this message and add to accumulated context
    const extractedContext = extractContextFromMessage(messageToSend);
    const newContext = { ...userProvidedContext, ...extractedContext };
    setUserProvidedContext(newContext);

    // Wait for user message to finish typing before AI responds
    setTimeout(async () => {
      // Mark user message as complete
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, isTyping: false, typingComplete: true } : msg
      ));

      // Add AI typing indicator
      const typingMessage: ChatMessage = {
        id: `typing-${Date.now()}`,
        type: 'ai',
        content: '',
        timestamp: new Date(),
        isTyping: true
      };
      setMessages(prev => [...prev, typingMessage]);

      // AI responds after user message is fully visible
      setTimeout(async () => {
        try {
          // Only pass context that the user has actually provided
          const contextToSend = {
            homePrice: newContext.homePrice || inputs.homePrice,
            currentRent: newContext.currentRent || inputs.currentRent,
            downPayment: newContext.downPayment || (inputs.homePrice * inputs.downPaymentPercent / 100),
            interestRate: newContext.interestRate || inputs.interestRate,
            timeHorizon: newContext.timeHorizon || inputs.timeHorizonYears,
            location: newContext.location || 'your area',
            previousMessages: [...(newContext.previousMessages || []), messageToSend]
          };

          const ai = await aiService.generateResponse(messageToSend, contextToSend);

          // Generate chart data if needed
          let chartData: any[] = [];
          let chartInputs: any = null;

          if (ai.showChart) {
            const updatedInputs = {
              ...inputs,
              homePrice: newContext.homePrice || inputs.homePrice,
              currentRent: newContext.currentRent || inputs.currentRent,
              timeHorizonYears: newContext.timeHorizon || inputs.timeHorizonYears,
            };

            const results = calculateRentVsBuy(updatedInputs);
            const yearlyProjections = results.yearlyProjections;

            switch (ai.chartType) {
              case 'networth':
                chartData = yearlyProjections.map((projection, index) => ({
                  year: index + 1,
                  netWorthRent: projection.rentNetWorth,
                  netWorthBuy: projection.buyNetWorth,
                  breakEven: projection.buyNetWorth >= projection.rentNetWorth
                }));
                break;
              case 'cumulative':
                chartData = yearlyProjections.map((projection, index) => ({
                  year: index + 1,
                  rentCost: projection.totalRentPaid,
                  ownershipCost: projection.cumulativeOwnershipCost
                }));
                break;
              default:
                chartData = [];
            }

            chartInputs = updatedInputs;
          }

          const aiResponse: ChatMessage = {
            id: Date.now().toString(),
            type: 'ai',
            content: ai.content,
            timestamp: new Date(),
            showChart: ai.showChart,
            chartType: ai.chartType,
            chartData,
            chartInputs,
            chartTitle: ai.chartTitle,
            chartExplanation: ai.chartExplanation,
            chartInsights: ai.showChart ? [
              `This analysis is based on your ${contextToSend.homePrice ? `$${contextToSend.homePrice.toLocaleString()} home` : 'home price'}`,
              `Comparing against ${contextToSend.currentRent ? `$${contextToSend.currentRent}/month rent` : 'your current rent'}`,
              `Over a ${contextToSend.timeHorizon || '10'}-year timeline`
            ] : undefined,
            chartKeyPoints: ai.showChart ? [
              'Hover over data points for detailed breakdowns',
              'Red indicators highlight key financial milestones',
              'Consider both short-term costs and long-term wealth building'
            ] : undefined,
            followUpQuestions: ai.followUpQuestions,
            typingComplete: false
          };
          
          // Remove typing indicator and add real response
          setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));
          setMessages(prev => [...prev, aiResponse]);
          setIsTyping(false);

        } catch (error) {
          console.error("Error generating AI response:", error);
          // Fallback to a generic error message if API fails
          setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              type: 'ai',
              content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
              timestamp: new Date(),
              typingComplete: false
          }]);
          setIsTyping(false);
        }
      }, 800);
    }, 1200);
  };

  const exampleMessages = [
    "I'm looking at a $750k house in Denver",
    "Should I buy or keep renting?",
    "I might move in 5 years",
    "What's the break-even point?"
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Advisor
            </h1>
            <p className="text-sm text-gray-300">Your personal financial advisor</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSwitchToDashboard}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center gap-2 text-sm"
        >
          <BarChart3 className="w-4 h-4" />
          Full Analysis
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Ready to help with your financial decisions</h2>
                <p className="text-gray-300 max-w-md mx-auto">
                  Ask me anything about buying vs renting, and I'll provide personalized analysis with interactive charts.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {exampleMessages.map((message, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setInputValue(message)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors duration-200 border border-white/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    "{message}"
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.type === 'ai' && (
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                )}
                
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-white/10 backdrop-blur-sm border border-white/20'
                }`}>
                  {message.isTyping && message.type === 'ai' ? (
                    <div className="flex space-x-2">
                      <motion.div 
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  ) : message.isTyping && message.type === 'user' ? (
                    <TypingAnimation 
                      text={message.content} 
                      speed={25}
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      onComplete={() => {
                        setMessages(prev => prev.map(msg => 
                          msg.id === message.id ? { ...msg, isTyping: false, typingComplete: true } : msg
                        ));
                      }}
                    />
                  ) : (
                    <TypingAnimation 
                      text={message.content} 
                      speed={35}
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      onComplete={() => {
                        setMessages(prev => prev.map(msg => 
                          msg.id === message.id ? { ...msg, typingComplete: true } : msg
                        ));
                      }}
                    />
                  )}
                </div>

                {message.type === 'user' && (
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>

              {/* Chart */}
              {message.showChart && message.chartData && message.typingComplete && (
                <div className="w-full mt-2">
                  <GuidedChart
                    chartType={message.chartType || 'networth'}
                    data={message.chartData}
                    inputs={message.chartInputs}
                    title={message.chartTitle || 'Chart Analysis'}
                    explanation={message.chartExplanation || 'Financial comparison chart'}
                    insights={message.chartInsights}
                    keyPoints={message.chartKeyPoints}
                    aiResponse={message.content}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask me about your financial situation..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm text-sm"
            rows={2}
            disabled={isTyping}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}