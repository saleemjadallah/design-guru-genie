
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key. Please set the OPENAI_API_KEY in the Edge Function secrets.");
    }

    // Parse the request body
    const { imageUrl, options = {} } = await req.json();
    
    if (!imageUrl) {
      throw new Error("No image URL provided");
    }

    console.log("Analyzing design with OpenAI, URL type:", 
      imageUrl.startsWith('data:') ? 'data URL' : 
      imageUrl.startsWith('http') ? 'HTTP URL' : 'other URL format');

    // Configure OpenAI API request
    const model = options.model || "gpt-4o";
    const temperature = options.temperature || 0.1;
    const maxTokens = options.maxTokens || 1500;

    // Create the prompt for design analysis
    const systemPrompt = `You are a professional UI/UX design analyzer. Analyze the provided design image and provide detailed, constructive feedback.
    Focus on:
    1. Visual hierarchy
    2. Color scheme and contrast
    3. Typography and readability
    4. Layout and spacing
    5. Consistency
    6. Usability and user experience
    
    Format your response as JSON with two main sections:
    1. strengths: Array of { title, description, location (optional) }
    2. issues: Array of { issue, priority (high/medium/low), recommendation, principle, technical_details, location (optional) }
    
    Provide 2-4 strengths and 3-6 issues. Be specific and actionable in your recommendations.`;

    // Call OpenAI API with the image
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this UI design and provide detailed feedback on its strengths and areas for improvement."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" }
      })
    });

    // Process the response
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const responseData = await openAIResponse.json();
    console.log("OpenAI response received");

    // Extract and parse the JSON content from the response
    try {
      const content = responseData.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      
      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", responseData.choices[0].message.content);
      throw new Error("Failed to parse OpenAI response");
    }
  } catch (error) {
    console.error("Error in analyze-design-openai function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred during image analysis"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
