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

    // Create a concise, conversational prompt
    const systemPrompt = `You are a helpful financial advisor. Be conversational but concise.

PERSONALITY:
- Talk like a knowledgeable friend
- Keep responses short (2-3 sentences max)
- Be warm but not overly enthusiastic
- Use their details when relevant (Denver, $750k, etc.)

       RESPONSE STYLE:
       - Start naturally: "Got it", "So...", "Interesting"
       - Get to the point quickly
       - Use everyday language
       - NEVER ask follow-up questions in the first response
       - Wait for user to see the chart and animations first

CHART GUIDANCE:
- If chartRevelation.needsMoreInfo is true, ask for missing info simply
- If chartRevelation.showChart is true, just respond naturally - the chart will appear automatically
- Keep chart explanations brief

Current user context: ${JSON.stringify(context)}
Chart revelation data: ${JSON.stringify(chartRevelation)}

Be helpful but concise. No long explanations.`;

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
