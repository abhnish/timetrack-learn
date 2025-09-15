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

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Received career guidance request:', message);

    // Build conversation context for Gemini
    let conversationText = `You are an AI Career Guidance Counselor specializing in educational and professional development. You help students and professionals make informed decisions about their career paths.

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

Always maintain a professional, empathetic, and encouraging tone.

`;

    // Add conversation history
    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        conversationText += `\nUser: ${msg.content}`;
      } else if (msg.role === 'assistant') {
        conversationText += `\nAssistant: ${msg.content}`;
      }
    }

    // Add current message
    conversationText += `\nUser: ${message}\nAssistant: `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: conversationText
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('No response generated from Gemini');
    }

    const assistantMessage = data.candidates[0].content.parts[0].text;

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