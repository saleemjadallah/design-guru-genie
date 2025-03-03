
// Import required Deno modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers to enable cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main serve function
serve(async (req) => {
  console.log("analyze-design function invoked");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request with CORS headers");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log environment variables (without revealing full key)
    const envVars = Object.keys(Deno.env.toObject());
    console.log("Available environment variables:", envVars);
    
    // Get the Anthropic API key - checking multiple possible formats
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    // Validate API key existence
    if (!anthropicApiKey) {
      console.error("ERROR: ANTHROPIC_API_KEY not found in environment variables");
      throw new Error("ANTHROPIC_API_KEY not found. Please set it in your Edge Function secrets with the EXACT name 'ANTHROPIC_API_KEY'");
    }
    
    console.log("API key successfully retrieved (first 4 chars):", anthropicApiKey.substring(0, 4) + "...");

    // Parse the request body
    const { imageUrl, options } = await req.json();
    
    if (!imageUrl) {
      throw new Error("Missing imageUrl in request body");
    }
    
    console.log("Received request with imageUrl:", imageUrl.substring(0, 30) + "...");
    console.log("Calling Claude AI with the following options:", options);

    // Prepare the message for Claude
    const message = {
      model: "claude-3-haiku-20240307",
      max_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature || 0.1,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this UI/UX design screenshot and provide a detailed analysis as a UX expert. Focus on:

1. Visual design elements (color, typography, layout, etc.)
2. Information architecture
3. Navigation and user flow
4. Accessibility concerns
5. Mobile responsiveness concerns
6. Usability issues
7. Strengths of the design
8. Specific recommendations for improvement

For each issue or strength you identify:
- Provide a category (e.g., "Contrast", "Typography", "Layout", etc.)
- Rate the priority (High, Medium, Low) for issues
- Give specific, actionable recommendations

Format the response as a JSON array of objects with these properties:
- type: "positive" for strengths or "issue" for problems
- category: The specific design category
- priority: "high", "medium", or "low" (only for issues)
- description: Detailed explanation of the issue/strength
- recommendation: Specific action item to improve (only for issues)

Example:
[
  {
    "type": "issue",
    "category": "Contrast",
    "priority": "high",
    "description": "Low contrast between text and background makes content difficult to read",
    "recommendation": "Increase contrast ratio to at least 4.5:1 for all text"
  },
  {
    "type": "positive",
    "category": "Layout",
    "description": "Consistent grid system provides visual order and balance"
  }
]

Only return the JSON array, with no additional explanation.`
            },
            {
              type: "image",
              source: {
                type: "url",
                url: imageUrl
              }
            }
          ]
        }
      ],
    };

    // Make the API request to Anthropic
    console.log("Sending request to Claude API");
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Claude API error:", response.status, errorBody);
      
      // Provide more specific error messages
      if (response.status === 401) {
        throw new Error("Unauthorized: The Claude API key appears to be invalid or expired");
      } else if (response.status === 400) {
        throw new Error(`Bad request to Claude API: ${errorBody}`);
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded with Claude API. Please try again later");
      } else {
        throw new Error(`Claude API error (${response.status}): ${errorBody}`);
      }
    }

    // Parse and process the response
    const responseData = await response.json();
    console.log("Received response from Claude AI");
    
    // Extract and parse the JSON from Claude's response
    let analysisResult;
    try {
      const responseContent = responseData.content[0].text;
      analysisResult = JSON.parse(responseContent);
      console.log("Successfully parsed response data");
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", parseError);
      throw new Error("Failed to parse Claude response as JSON. Try again or check Claude service.");
    }

    // Return the analysis results
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error("Error in analyze-design function:", error.message);
    
    // Prepare a more descriptive error message
    let errorMessage = error.message || "Unknown error analyzing design";
    
    if (errorMessage.includes("ANTHROPIC_API_KEY not found")) {
      errorMessage = "ANTHROPIC_API_KEY not found in Edge Function environment. Please verify it's set with the EXACT name in Edge Function secrets.";
    } else if (errorMessage.includes("invalid") && errorMessage.includes("API key")) {
      errorMessage = "Invalid API key. Please check that your ANTHROPIC_API_KEY is correct in Edge Function secrets.";
    }
    
    // Return error response
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.stack || "No stack trace available"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
