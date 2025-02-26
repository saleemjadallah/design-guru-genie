
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Analyzing design with Claude...')

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
              text: `You are DesignCritiqueAI, a professional UI/UX design consultant. Please analyze this design screenshot in detail and provide structured feedback. Focus on usability, accessibility, visual hierarchy, and conversion optimization.

Rules for your analysis:
1. Provide a concise overview of the design
2. Identify 2 key strengths
3. Identify 3-5 issues, each with:
   - Clear priority level (high/medium/low)
   - Specific location in pixels (x,y coordinates)
   - Design principle violated
   - Technical recommendation
4. Format response as JSON matching exactly this structure:
{
  "overview": "Brief overall impression",
  "strengths": [
    {
      "title": "Strength name",
      "description": "Detailed explanation"
    }
  ],
  "issues": [
    {
      "id": 1,
      "priority": "high|medium|low",
      "issue": "Problem description",
      "principle": "Design principle",
      "location": {"x": 250, "y": 100},
      "recommendation": "Solution",
      "technical_details": "Specific implementation details"
    }
  ]
}`
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageUrl.split(',')[1]
              }
            }
          ]
        }]
      })
    })

    const result = await response.json()
    console.log('Analysis complete:', result)

    return new Response(
      JSON.stringify({ result }),
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
