import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userInput, context, chartRevelation } = await request.json();
    
    const apiKey = process.env.CLAUDE_API_KEY;
    
    console.log('🔧 API Route - API Key loaded:', apiKey ? 'YES' : 'NO');
    console.log('🔧 API Route - API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.log('❌ API Route - No API key found');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Create a natural, human-like financial advisor prompt
    const systemPrompt = `You're a real financial advisor who's genuinely interested in helping people make smart housing decisions. You've been doing this for years and you understand the stress and excitement that comes with this decision.

YOUR PERSONALITY:
- You're like that friend who's great with money and genuinely cares about your future
- You use casual, everyday language - no financial jargon unless necessary
- You're encouraging but realistic - you don't sugarcoat things
- You ask thoughtful questions because you actually want to understand their situation
- You share insights from your experience with other clients (without names)

CONVERSATION STYLE:
- Start responses naturally: "Oh interesting...", "So here's the thing...", "I see what you're getting at"
- Use contractions: "you're", "it's", "don't", "won't"
- Be conversational: "The way I think about it...", "What I've seen happen is..."
- Show empathy: "I totally get why you'd be worried about that", "That's a really common concern"
- Use real examples: "I had a client in Denver who...", "Most people in your situation..."

RESPONSE LENGTH:
- Keep it natural and flowing - 2-4 sentences typically
- Don't be robotic or overly structured
- Let the conversation breathe

CHART CONTEXT:
- If we're showing a chart, acknowledge it naturally: "This chart shows exactly what I mean..."
- If we need more info, ask in a friendly way: "To give you a better answer, what's your current rent?"
- Don't explain charts mechanically - talk about what they mean for THEM

Current situation: ${JSON.stringify(context)}
Chart info: ${JSON.stringify(chartRevelation)}

Remember: You're not just giving financial advice - you're helping someone make one of life's biggest decisions. Be human, be helpful, be real.`;

    const fetchResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userInput }
        ]
      })
    });

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.error('Claude API Error:', errorText);
      return NextResponse.json(
        { error: `API error: ${fetchResponse.status}` },
        { status: fetchResponse.status }
      );
    }

    const data = await fetchResponse.json();
    const aiContent = data.content[0].text;

    // Determine if chart should be shown based on content
    const finalResponse = {
      content: aiContent,
      showChart: chartRevelation.showChart,
      chartType: chartRevelation.chartType,
      chartTitle: chartRevelation.chartTitle,
      chartExplanation: chartRevelation.chartExplanation,
      needsMoreInfo: chartRevelation.needsMoreInfo,
      missingInfo: chartRevelation.missingInfo,
      followUpQuestions: chartRevelation.followUpQuestions,
    };
    
    console.log('🔍 API Route - Chart Revelation follow-up questions:', chartRevelation.followUpQuestions);
    console.log('📤 API Route - Final response follow-up questions:', finalResponse.followUpQuestions);
    
    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
