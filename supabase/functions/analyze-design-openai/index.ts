
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const { imageUrl, options } = await req.json()
    
    if (!imageUrl) {
      throw new Error('No image URL provided')
    }

    // Set defaults or use provided options
    const model = options?.model || 'gpt-4o'
    const temperature = options?.temperature || 0.1
    const maxTokens = options?.maxTokens || 2000
    const timeout = options?.timeout || 90000 // 90 seconds default
    
    console.log(`Starting OpenAI analysis using ${model} with timeout ${timeout}ms`)
    
    // Initialize Supabase client to access Storage
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Create the new prompt for OpenAI
    const prompt = `
Analyze this design screenshot and provide feedback on its UI/UX quality.

Focus on these key areas:
- Visual hierarchy and layout
- Color and contrast
- Typography and readability
- Consistency and usability

Please structure your response as JSON with:
1. "overview": Brief impression of the design
2. "strengths": [{"title": "Strength name", "description": "Details"}]
3. "issues": [{"id": 1, "priority": "high/medium/low", "issue": "Problem description", "recommendation": "How to fix it"}]

Include 2-3 design strengths and 4-6 specific issues with clear recommendations.

For each issue, include specific measurements, colors, or techniques that would improve the design.
`

    // Set up OpenAI API call with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      // Call OpenAI API
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { 
              role: 'system', 
              content: 'You are a professional UI/UX design expert providing actionable feedback on designs.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { 
                  type: 'image_url', 
                  image_url: { url: imageUrl }
                }
              ]
            }
          ],
          temperature: temperature,
          max_tokens: maxTokens
        }),
        signal: controller.signal
      })
      
      // Clear timeout since request completed
      clearTimeout(timeoutId)
      
      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.json()
        throw new Error(`OpenAI API error: ${openAIResponse.status} - ${JSON.stringify(errorData)}`)
      }
      
      const data = await openAIResponse.json()
      
      // Extract the content from OpenAI's response
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No content in response from OpenAI')
      }
      
      console.log('Analysis completed successfully')
      
      // Return the response with CORS headers
      return new Response(
        JSON.stringify(data),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    } catch (error) {
      // Clear timeout to prevent memory leaks
      clearTimeout(timeoutId)
      
      // Handle timeout
      if (error.name === 'AbortError') {
        throw new Error(`OpenAI request timed out after ${timeout}ms`)
      }
      
      throw error
    }
  } catch (error) {
    console.error('Error in analyze-design-openai function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error in analyze-design-openai function'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
