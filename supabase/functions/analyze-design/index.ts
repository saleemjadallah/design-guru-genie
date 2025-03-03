
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function is the main handler for the edge function
serve(async (req: Request) => {
  console.log("analyze-design function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request (CORS preflight)");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    let payload;
    try {
      payload = await req.json();
      console.log("Request body parsed successfully");
    } catch (jsonError) {
      console.error("Error parsing request body:", jsonError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate that imageUrl exists in the payload
    const { imageUrl, options = {} } = payload;
    if (!imageUrl) {
      console.error("Missing imageUrl in request payload");
      return new Response(
        JSON.stringify({ error: "Missing imageUrl in request" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract API key - first try environment variable, then fall back to hardcoded key
    let apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    
    // Fallback to hardcoded API key (last resort)
    if (!apiKey) {
      console.warn("ANTHROPIC_API_KEY not found in environment, using hardcoded fallback key");
      apiKey = "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";
    }
    
    if (!apiKey) {
      console.error("No API key available (neither from environment nor fallback)");
      return new Response(
        JSON.stringify({ error: "API key not configured. Please set ANTHROPIC_API_KEY in Supabase Edge Function secrets." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("API key available, initiating Claude API request");
    
    // Set up the Claude API request
    const claudeUrl = "https://api.anthropic.com/v1/messages";
    const { maxTokens = 2000, temperature = 0.1 } = options;
    
    // Prepare the claude prompt for design analysis
    const prompt = `You're a professional UI/UX design critic with expertise in visual design, usability, and accessibility.
    
    Analyze the provided design and provide structured feedback in valid JSON format.
    
    Please identify:
    1. Overall design strengths (visual appeal, consistency, branding)
    2. Areas for improvement (usability issues, visual hierarchy problems, inconsistencies)
    3. Specific actionable recommendations
    
    Rate each aspect (visual design, usability, accessibility, consistency) on a scale of 1-10.
    
    Format your response as a single valid JSON object with these fields:
    - strengths: array of objects with "title" and "description" fields
    - improvements: array of objects with "title", "description", and "priority" fields (priority can be "high", "medium", or "low")
    - ratings: object with numeric scores for different aspects
    - overallFeedback: general impression in 2-3 sentences
    
    DO NOT include any explanatory text or markdown before or after the JSON.
    Ensure your JSON is valid and properly escaped.`;
    
    // Log key details about the request (careful not to log full payload or API key)
    console.log(`Making Claude API request with maxTokens=${maxTokens}, temperature=${temperature}`);
    console.log(`Image URL length: ${imageUrl.length} characters`);
    
    // Make the request to Claude API
    const claudeResponse = await fetch(claudeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229", // Using more capable model for better image analysis
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              // Support both URL and base64 images
              imageUrl.startsWith('data:') 
                ? {
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: imageUrl.split(';')[0].replace('data:', ''),
                      data: imageUrl.split(',')[1]
                    }
                  }
                : { 
                    type: "image", 
                    source: { 
                      type: "url", 
                      url: imageUrl 
                    } 
                  }
            ]
          }
        ]
      })
    });
    
    // Check if Claude API returned a successful response
    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.text();
      console.error(`Claude API error (status ${claudeResponse.status}):`, errorData);
      
      // Handle specific error cases
      if (claudeResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: "Authentication failed with Claude API. Please check your API key." }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (claudeResponse.status === 400) {
        return new Response(
          JSON.stringify({ error: "Bad request to Claude API. The image may be too large or in an unsupported format." }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Claude API error: ${claudeResponse.status} - ${errorData.substring(0, 200)}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process the Claude API response
    const claudeData = await claudeResponse.json();
    console.log("Claude API response received successfully");
    
    // Extract the response content
    const responseContent = claudeData.content[0].text;
    
    // Try to parse the JSON from Claude's response
    let parsedFeedback;
    try {
      // Find the first { and last } to extract JSON if there's any text around it
      const jsonStart = responseContent.indexOf('{');
      const jsonEnd = responseContent.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("No JSON object found in Claude response");
      }
      
      const jsonStr = responseContent.substring(jsonStart, jsonEnd);
      parsedFeedback = JSON.parse(jsonStr);
      console.log("Successfully parsed JSON from Claude response");
    } catch (parseError) {
      console.error("Error parsing JSON from Claude response:", parseError);
      console.log("Raw response content:", responseContent.substring(0, 200) + "...");
      
      // Return the raw text since we couldn't parse it as JSON
      return new Response(
        JSON.stringify({ 
          error: "Could not parse Claude response as JSON",
          rawResponse: responseContent 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the successfully processed response
    console.log("Returning successful response to client");
    return new Response(
      JSON.stringify(parsedFeedback),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    // Handle any uncaught errors
    console.error("Uncaught error in analyze-design function:", error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message || "Unknown error"}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
