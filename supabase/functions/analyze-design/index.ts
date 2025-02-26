
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()
    console.log('Analyzing design:', imageUrl)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are DesignCritiqueAI, a professional design consultant. Please analyze this design screenshot:'
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageUrl.split(',')[1]
              }
            },
            {
              type: 'text',
              text: `Identify 3-5 key design issues ordered by priority (high/medium/low). For each issue:
              - Precisely describe the problem
              - Explain why it matters from a design principles perspective
              - Provide a specific, actionable recommendation
              - Indicate the location in the image (x,y coordinates)
              
              Also note 1-2 positive aspects of the design.
              
              Format your response as JSON with this schema:
              {
                "overview": "Brief impression",
                "strengths": [{"title": "strength", "description": "details"}],
                "issues": [{
                  "id": 1,
                  "priority": "high|medium|low",
                  "issue": "problem",
                  "principle": "design principle",
                  "location": {"x": 250, "y": 100},
                  "recommendation": "solution"
                }]
              }`
            }
          ]
        }]
      })
    })

    const analysisResult = await response.json()
    console.log('Analysis complete:', analysisResult)

    return new Response(
      JSON.stringify({ result: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
