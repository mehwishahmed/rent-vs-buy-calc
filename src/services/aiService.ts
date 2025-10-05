// src/services/aiService.ts
'use client';

interface AIResponse {
  content: string;
  showChart: boolean;
  chartType?: string;
  chartData?: any[];
  chartTitle?: string;
  chartExplanation?: string;
  needsMoreInfo?: boolean;
  missingInfo?: string[];
  followUpQuestions?: string[];
  userType?: 'anxious' | 'data-driven' | 'relationship' | 'optimizer' | 'first-time';
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

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Using Anthropic Claude - better for conversational financial advice
    this.apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '';
    this.baseUrl = 'https://api.anthropic.com/v1';
    
    console.log('🔧 AIService initialized with Claude:');
    console.log('🔑 API Key loaded:', this.apiKey ? 'YES' : 'NO');
    console.log('🔑 API Key length:', this.apiKey.length);
    console.log('🌐 Base URL:', this.baseUrl);
    console.log('🔍 All env vars with CLAUDE:', Object.keys(process.env).filter(key => key.includes('CLAUDE')));
    console.log('🔍 All env vars with NEXT_PUBLIC:', Object.keys(process.env).filter(key => key.includes('NEXT_PUBLIC')));
  }

  // Comprehensive chart revelation system
  private determineChartRevelation(userInput: string, context: UserContext): {
    showChart: boolean;
    chartType?: string;
    chartTitle?: string;
    chartExplanation?: string;
    needsMoreInfo?: boolean;
    missingInfo?: string[];
    followUpQuestions?: string[];
  } {
    const input = userInput.toLowerCase();
    const hasHomePrice = context.homePrice && context.homePrice > 0;
    const hasRent = context.currentRent && context.currentRent > 0;
    const hasTimeHorizon = context.timeHorizon && context.timeHorizon > 0;
    const hasLocation = context.location && context.location.length > 0;

    // Timeline concerns → NetWorthChart
    if (input.includes('move') || input.includes('years') || input.includes('timeline') || 
        input.includes('stay') || input.includes('relocate') || input.includes('job')) {
      return {
        showChart: Boolean(hasHomePrice && hasRent && hasTimeHorizon),
        chartType: 'networth',
        chartTitle: 'Decision Timeline Analysis',
        chartExplanation: 'Shows when buying becomes financially better than renting',
               needsMoreInfo: Boolean(!hasHomePrice || !hasRent || !hasTimeHorizon),
        missingInfo: [
          !hasHomePrice ? 'home price' : null,
          !hasRent ? 'current rent' : null,
          !hasTimeHorizon ? 'time horizon' : null
        ].filter((item): item is string => item !== null),
        followUpQuestions: [
          !hasHomePrice ? 'What\'s the price of the home you\'re considering?' : null,
          !hasRent ? 'What\'s your current monthly rent?' : null,
          !hasTimeHorizon ? 'How long do you plan to stay in your next home?' : null,
          // Always ask a follow-up question to keep conversation flowing
          (hasHomePrice && hasRent && hasTimeHorizon) ? 'Are you feeling pressure to buy for other reasons, or is this purely a financial decision for you?' : null
        ].filter((item): item is string => item !== null)
      };
    }

    // Cost sensitivity → CumulativeCostChart
    if (input.includes('expensive') || input.includes('cost') || input.includes('afford') || 
        input.includes('budget') || input.includes('payment') || input.includes('monthly')) {
      return {
        showChart: Boolean(hasHomePrice && hasRent),
        chartType: 'cumulative',
        chartTitle: 'Cost Breakdown Analysis',
        chartExplanation: 'Shows how costs accumulate over time for both renting and buying',
        needsMoreInfo: !hasHomePrice || !hasRent,
        missingInfo: [
          !hasHomePrice ? 'home price' : null,
          !hasRent ? 'current rent' : null
        ].filter((item): item is string => item !== null),
        followUpQuestions: [
          !hasHomePrice ? 'What\'s the price of the home you\'re considering?' : null,
          !hasRent ? 'What\'s your current monthly rent?' : null,
          // Always ask a follow-up question to keep conversation flowing
          (hasHomePrice && hasRent) ? 'What\'s your biggest concern about the monthly payment - the upfront costs or long-term affordability?' : null
        ].filter((item): item is string => item !== null)
      };
    }

    // Default: Show basic analysis if we have enough info
    if (hasHomePrice && hasRent) {
      return {
        showChart: Boolean(true),
        chartType: 'totalcost',
        chartTitle: 'Rent vs Buy Analysis',
        chartExplanation: 'Shows total cost comparison over time',
             needsMoreInfo: Boolean(false)
      };
    }

    // Not enough info for any chart
    return {
      showChart: Boolean(false),
      needsMoreInfo: Boolean(true),
      missingInfo: [
        !hasHomePrice && 'home price',
        !hasRent && 'current rent',
          !hasTimeHorizon ? 'time horizon' : null
      ].filter(Boolean) as string[],
      followUpQuestions: [
        !hasHomePrice && 'What\'s the price of the home you\'re considering?',
        !hasRent && 'What\'s your current monthly rent?',
        !hasTimeHorizon && 'How long do you plan to stay in your next home?'
      ].filter(Boolean) as string[]
    };
  }

  async generateResponse(userInput: string, context: UserContext): Promise<AIResponse> {
    try {
      console.log('🤖 Calling our API route with input:', userInput);
      console.log('📊 Context:', context);
      
      // Determine chart revelation based on user input and context
      const chartRevelation = this.determineChartRevelation(userInput, context);
      console.log('📈 Chart Revelation:', chartRevelation);
      console.log('📋 Follow-up questions in chart revelation:', chartRevelation.followUpQuestions);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          context,
          chartRevelation // Pass chart revelation info to API
        })
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Response received:', data);
      
      // Merge AI response with chart revelation data
      return {
        ...data,
        ...chartRevelation
      };

    } catch (error) {
      console.error('❌ AI Service Error:', error);
      
      // Fallback to enhanced local responses with chart revelation
      const chartRevelation = this.determineChartRevelation(userInput, context);
      return {
        ...this.generateFallbackResponse(userInput, context),
        ...chartRevelation
      };
    }
  }

  private generateFallbackResponse(userInput: string, context: UserContext): AIResponse {
    // Truly intelligent AI that acts like a real financial advisor
    const lowerInput = userInput.toLowerCase();

    // Extract key information from user input
    const homePrice = this.extractNumber(userInput, ['750k', '750', 'house', 'home']);
    const rent = this.extractNumber(userInput, ['rent', 'paying', 'monthly']);
    const location = this.extractLocation(userInput);
    const timeline = this.extractTimeline(userInput);

    // Generate intelligent, contextual responses
    if (lowerInput.includes('denver') || lowerInput.includes('colorado')) {
      return {
        content: `You know, Denver's market is absolutely fascinating right now. I've been tracking it closely for my clients - the median home price is around $745k, but here's what's really caught my attention: the rent growth rate has been outpacing the national average at about 7% annually. That's significant.\n\nWhat's your current situation? Are you renting now, and if so, what's your monthly rent? This will help me give you a much more targeted analysis that actually makes sense for your specific circumstances.`,
        showChart: false
      };
    }

    if (homePrice && location) {
      const marketInsight = this.getMarketInsight(location, homePrice);
      return {
        content: `A $${homePrice.toLocaleString()} home in ${location} - wow, that's a significant decision, and I can tell you've put some thought into this. ${marketInsight}\n\nHere's what I'm thinking: The key question isn't just about the numbers, it's about your timeline and lifestyle. Are you planning to stay put for a while, or might you need flexibility?\n\nWhat's your current living situation? Are you renting, and if so, what's your monthly rent? I want to make sure I'm giving you advice that actually fits your reality.`,
        showChart: false
      };
    }

    if (rent && homePrice) {
      const analysis = this.performQuickAnalysis(homePrice, rent);
      return {
        content: `Interesting combination - $${rent.toLocaleString()} rent vs a $${homePrice.toLocaleString()} home. ${analysis}\n\nBut here's what most people miss: it's not just about the monthly payment. There are hidden costs on both sides - maintenance, property taxes, HOA fees on the buying side, and rent increases on the renting side.\n\nWhat's your timeline? Are you thinking short-term (2-3 years) or long-term (5+ years)? This changes everything.`,
        showChart: false
      };
    }

    if (lowerInput.includes('5 years') || lowerInput.includes('might move')) {
      return {
        content: `5 years is actually a really interesting timeline. Most people think it's too short for buying, but that's not always true. The key factors are:\n\n1. Transaction costs (typically 6-8% of home value)\n2. Market appreciation in your area\n3. Rent growth vs mortgage stability\n\nWhat's making you think you might move? Job changes, family plans, or just keeping options open?`,
        showChart: false
      };
    }

    if (lowerInput.includes('expensive') || lowerInput.includes('cost') || lowerInput.includes('afford')) {
      return {
        content: `I totally get the sticker shock. A $750k home feels massive, but let's break it down realistically:\n\n- Down payment: $150k (20%) or $75k (10% with PMI)\n- Monthly payment: ~$4,200 (including taxes, insurance)\n- Maintenance: ~$500/month average\n\nBut here's the thing - your rent isn't staying the same. In Denver, rents have been growing 7% annually. So that $2,900 rent becomes $3,100 next year, $3,300 the year after.\n\nWhat's your biggest concern - the upfront costs or the monthly payment?`,
        showChart: false
      };
    }

    if (lowerInput.includes('worried') || lowerInput.includes('anxious') || lowerInput.includes('stress')) {
      return {
        content: `I hear you - this is one of life's biggest decisions and it's totally normal to feel overwhelmed. But here's what I tell all my clients: you're already thinking about it intelligently, which puts you ahead of most people.\n\nLet's simplify this. What's your biggest fear? Is it:\n- Making the wrong choice financially?\n- Getting stuck in a place you don't want?\n- The responsibility of homeownership?\n\nOnce I know what's keeping you up at night, I can give you a much clearer path forward.`,
        showChart: false
      };
    }

    if (lowerInput.includes('help') || lowerInput.includes('confused') || lowerInput.includes('no idea')) {
      return {
        content: `Perfect - that's exactly why I'm here. Most people feel lost with this decision, but it's actually more straightforward than you think.\n\nLet me ask you a few key questions to get us started:\n\n1. What's your current monthly rent?\n2. How long do you see yourself staying in your next home?\n3. What's your biggest priority - building wealth, flexibility, or stability?\n\nDon't worry about getting the "right" answers - just tell me what's on your mind. I'll help you think through this step by step.`,
        showChart: false
      };
    }

    if (lowerInput.includes('yes') || lowerInput.includes('yeah') || lowerInput.includes('sure')) {
      return {
        content: `Great! I love that energy. Now let's dig into your specific situation.\n\nWhat's your current living situation? Are you renting now, and if so, what's your monthly rent? This will help me give you a much more targeted analysis than generic advice.`,
        showChart: false
      };
    }

    if (lowerInput.includes('no') || lowerInput.includes('not sure') || lowerInput.includes('maybe')) {
      return {
        content: `That's totally fine - this is a big decision and it's smart to think it through carefully.\n\nWhat's holding you back from being more certain? Is it:\n- Financial uncertainty?\n- Market timing concerns?\n- Lifestyle flexibility?\n- Something else?\n\nOnce I understand what's making you hesitate, I can help you work through it.`,
        showChart: false
      };
    }

    // Default intelligent response
    return {
      content: `I'm getting a sense of your situation, but I need a bit more context to give you truly valuable advice.\n\nCan you tell me:\n- What's your current living situation (renting/owning)?\n- What's your monthly housing cost?\n- How long do you plan to stay in your next home?\n\nDon't worry about having all the answers - just share what you know, and I'll help you think through the rest.`,
      showChart: false
    };
  }

  private extractNumber(input: string, keywords: string[]): number | null {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\$?([0-9,]+(?:\\.[0-9]+)?)[kK]?`, 'i');
      const match = input.match(regex);
      if (match) {
        let num = parseFloat(match[1].replace(/,/g, ''));
        if (input.toLowerCase().includes('k')) num *= 1000;
        return num;
      }
    }
    return null;
  }

  private extractLocation(input: string): string | null {
    const locationMatch = input.match(/(?:in|at|near)\s+([A-Za-z\s,]+)/i);
    return locationMatch ? locationMatch[1].trim() : null;
  }

  private extractTimeline(input: string): string | null {
    if (input.includes('5 years') || input.includes('5 year')) return '5 years';
    if (input.includes('3 years') || input.includes('3 year')) return '3 years';
    if (input.includes('10 years') || input.includes('10 year')) return '10 years';
    return null;
  }

  private getMarketInsight(location: string, price: number): string {
    if (location.toLowerCase().includes('denver')) {
      return `Denver's market has been hot, with median prices around $745k. Your price point puts you right in the competitive range.`;
    }
    if (location.toLowerCase().includes('austin')) {
      return `Austin's market has cooled slightly but still strong. Your price point is above median, so you're looking at premium properties.`;
    }
    if (location.toLowerCase().includes('seattle')) {
      return `Seattle's market is expensive but stable. Your price point is actually below median, which could be a good opportunity.`;
    }
    return `That's a significant investment. The key question is whether this market aligns with your timeline and goals.`;
  }

  private performQuickAnalysis(homePrice: number, rent: number): string {
    const ratio = homePrice / (rent * 12);
    if (ratio < 150) {
      return `This is actually a strong buy signal - the price-to-rent ratio suggests buying could be advantageous.`;
    } else if (ratio < 200) {
      return `This is in the decision zone - your timeline and market assumptions will be crucial.`;
    } else {
      return `This suggests renting might be more financially optimal, but your timeline matters more than the ratio.`;
    }
  }
}

export const aiService = new AIService();
