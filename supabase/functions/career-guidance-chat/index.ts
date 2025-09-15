import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Received career guidance request:', message);

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are an AI Career Guidance Counselor specializing in educational and professional development. You help students and professionals make informed decisions about their career paths.

Your expertise includes:
- Career exploration and assessment
- Skills development recommendations
- Educational pathway guidance
- Industry trends and job market insights
- Resume and interview preparation
- Professional networking advice
- Work-life balance and career satisfaction
- Skill gap analysis and learning recommendations
- Career transition planning
- Internship and job search strategies

Guidelines:
- Provide personalized, actionable advice
- Ask clarifying questions when needed
- Be encouraging and supportive
- Consider current market trends
- Suggest concrete next steps
- Include relevant resources when helpful
- Keep responses concise but comprehensive
- Focus on practical, achievable goals

Always maintain a professional, empathetic, and encouraging tone.`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 800,
        temperature: 0.7,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log('Generated career guidance response');

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        conversationId: Date.now().toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in career guidance chat:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate career guidance response' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});