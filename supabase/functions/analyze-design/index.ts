
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Use the updated API key provided by the user
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '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'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()
    console.log('Analyzing design with Claude...')
    
    // Check if we have a valid image URL
    if (!imageUrl) {
      throw new Error("No image URL provided")
    }
    
    // Check if the image is an SVG or other non-processable format
    if (typeof imageUrl === 'string' && 
        (imageUrl.startsWith('data:image/svg') || 
         imageUrl.includes('<svg'))) {
      throw new Error("Cannot analyze SVG placeholder. Please provide a proper screenshot.")
    }
    
    // If the image is a Supabase URL, we need to fetch it first
    let imageBase64;
    try {
      if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) {
        console.log('Fetching image from URL:', imageUrl)
        
        // Add timeout to fetch operation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
        
        const imageResponse = await fetch(imageUrl, { 
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`)
        }
        
        const imageBlob = await imageResponse.blob()
        
        // Check image size and potentially reject very large images
        if (imageBlob.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error("Image is too large (>10MB). Please provide a smaller image or reduce the image quality.")
        }
        
        const arrayBuffer = await imageBlob.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)
        imageBase64 = btoa(String.fromCharCode(...buffer))
        console.log('Image fetched and converted to base64, size:', Math.round(imageBase64.length / 1024), 'KB')
      } else if (imageUrl.startsWith('data:image/')) {
        // If it's already a data URL, extract the base64 part
        // Make sure it's not an SVG
        if (imageUrl.startsWith('data:image/svg')) {
          throw new Error("SVG images are not supported for analysis")
        }
        
        imageBase64 = imageUrl.split(',')[1]
        console.log('Using provided base64 image data')
      } else {
        throw new Error("Invalid image URL format")
      }
    } catch (fetchError) {
      console.error('Error processing image:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: `Failed to process image: ${fetchError.message}. Please provide a JPEG or PNG image.` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Validate the base64 data
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      console.error('Invalid base64 data')
      return new Response(
        JSON.stringify({ error: "Invalid image data" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Check the size of the base64 data
    if (imageBase64.length > 10 * 1024 * 1024) { // 10MB limit for base64
      console.error('Base64 data too large:', Math.round(imageBase64.length / 1024), 'KB')
      return new Response(
        JSON.stringify({ 
          error: "Image data is too large. Please provide a smaller or more compressed image." 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Add timeout for Claude API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout
    
    // Call Claude API
    console.log('Sending request to Claude API')
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
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

CRITICAL REQUIREMENTS:
1. MUST include AT LEAST 2 high priority, 2 medium priority, and 2 low priority issues (you can include more if relevant)
2. Your response must be VALID JSON and nothing else. No explanatory text outside the JSON object.
3. For each issue, provide specific x,y coordinates to indicate the location of the issue in the image.

Return a JSON object with this structure:
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
                  media_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }]
        }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      const result = await response.json()
      console.log('Analysis complete')

      return new Response(
        JSON.stringify({ result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (apiError) {
      console.error('Claude API error:', apiError)
      return new Response(
        JSON.stringify({ 
          error: `Claude API error: ${apiError.message}. This may be due to image size or format issues.` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in analyze-design function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
