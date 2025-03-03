
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Helper function to detect and fix transparency in images
 * @param imageUrl URL of the image to check for transparency
 * @returns Potentially fixed image URL
 */
async function ensureCompatibleImage(imageUrl: string): Promise<string> {
  console.log("Checking image compatibility for OpenAI...");
  
  // If it's already a JPEG, it's likely fine
  if (imageUrl.startsWith('data:image/jpeg')) {
    return imageUrl;
  }
  
  // If it's a PNG, WebP, or other format that might have transparency,
  // we should check and potentially convert
  try {
    if (imageUrl.startsWith('data:image/png') || 
        imageUrl.startsWith('data:image/webp') ||
        imageUrl.startsWith('data:image/gif')) {
      
      console.log("Potentially problematic image format detected, checking for transparency...");
      
      // Extract the base64 data
      const base64Data = imageUrl.split(',')[1];
      
      // Convert to a Uint8Array
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Create a blob with the right MIME type
      const mimeType = imageUrl.split(';')[0].split(':')[1];
      const blob = new Blob([binaryData], { type: mimeType });
      
      // Create an image bitmap to work with the image
      const imageBitmap = await createImageBitmap(blob);
      console.log(`Image dimensions: ${imageBitmap.width}x${imageBitmap.height}`);
      
      // Create a canvas to draw the image
      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha channel
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Fill with white background to replace any transparency
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image on top of the white background
      ctx.drawImage(imageBitmap, 0, 0);
      
      // Convert to JPEG format with high quality
      const processedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
      
      // Convert the blob to a base64 data URL
      const arrayBuffer = await processedBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
      const base64 = btoa(binary);
      
      const newDataUrl = `data:image/jpeg;base64,${base64}`;
      console.log("Image converted to JPEG with white background");
      
      return newDataUrl;
    }
  } catch (error) {
    console.error("Error processing image:", error);
    console.log("Falling back to original image URL");
  }
  
  // If all else fails or for other formats, return the original URL
  return imageUrl;
}

// Enhanced server function with improved timeout and error handling
serve(async (req) => {
  // Track request processing time
  const startTime = Date.now();
  
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

    // Configure OpenAI API request with improved parameters
    const model = options.model || "gpt-4o";
    const temperature = options.temperature || 0.1;
    const maxTokens = options.maxTokens || 2000; // Increased from 1500
    const timeout = options.timeout || 60000; // Default 60s timeout
    
    // Log options for debugging
    console.log(`Using options: model=${model}, maxTokens=${maxTokens}, timeout=${timeout}ms`);

    // Process image for transparency if needed
    const processedImageUrl = await ensureCompatibleImage(imageUrl);
    const imageChanged = processedImageUrl !== imageUrl;
    
    if (imageChanged) {
      console.log("Image was processed to ensure compatibility with OpenAI");
    }

    // Create the prompt for design analysis with expanded instructions
    const systemPrompt = `You are a professional UI/UX design analyzer. Analyze the provided design image and provide detailed, constructive feedback.
    Focus on:
    1. Visual hierarchy
    2. Color scheme and contrast
    3. Typography and readability
    4. Layout and spacing
    5. Consistency
    6. Usability and user experience
    
    Format your response as JSON with these sections:
    1. overview: Brief summary of the design
    2. strengths: Array of { title, description, location (optional) }
    3. issues: Array of { id: number, issue, priority (high/medium/low), recommendation, principle, technical_details, location (optional) }
    
    IMPORTANT REQUIREMENTS:
    - Provide 2-4 strengths highlighting what works well
    - Provide AT LEAST 6 issues (2 high, 2 medium, 2 low priority) with specific recommendations
    - For each issue, include actionable technical details for implementation
    - Each issue must have a unique ID starting from 1
    - BE SPECIFIC and DETAILED in your recommendations
    - Include x,y coordinate locations when possible
    
    Remember this is a UI/UX design, so focus on design principles, not marketing content.`;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Call OpenAI API with the image and improved parameters
      const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        signal: controller.signal, // Enable timeout
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
                  text: "Analyze this UI/UX design and provide detailed, actionable feedback on both its strengths and areas for improvement. Be specific about design principles and implementation details."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: processedImageUrl
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

      // Clear timeout since request completed
      clearTimeout(timeoutId);

      // Process the response
      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
      }

      const responseData = await openAIResponse.json();
      const processingTime = Date.now() - startTime;
      console.log(`OpenAI response received in ${processingTime}ms`);

      // Extract and parse the JSON content from the response
      try {
        const content = responseData.choices[0].message.content;
        const parsedContent = JSON.parse(content);
        
        // Enhance the response with processing metadata
        const enhancedResponse = {
          ...parsedContent,
          _meta: {
            processingTimeMs: processingTime,
            imageWasProcessed: imageChanged,
            model: model,
            timestamp: new Date().toISOString()
          }
        };
        
        return new Response(JSON.stringify(enhancedResponse), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        console.log("Raw response:", responseData.choices[0].message.content);
        throw new Error("Failed to parse OpenAI response");
      }
    } catch (fetchError) {
      // Always clear timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Check if this was an abort error
      if (fetchError.name === 'AbortError') {
        console.error(`Request aborted due to timeout after ${timeout}ms`);
        throw new Error(`OpenAI API request timed out after ${timeout}ms. The design may be too complex or the service is experiencing high load.`);
      }
      
      // Re-throw the original error
      throw fetchError;
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`Error in analyze-design-openai function after ${processingTime}ms:`, error);
    
    // Determine appropriate error message and status code
    let statusCode = 500;
    let errorMessage = error.message || "An error occurred during image analysis";
    
    if (errorMessage.includes("timeout") || errorMessage.includes("aborted")) {
      statusCode = 408; // Request Timeout
      errorMessage = "Analysis timed out. Your design may be too complex or the AI service is busy. Try a simpler image or try again later.";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      statusCode = 429; // Too Many Requests
    } else if (errorMessage.includes("Missing OpenAI API key") || errorMessage.includes("invalid_api_key")) {
      statusCode = 401; // Unauthorized
    } else if (errorMessage.includes("No image URL provided")) {
      statusCode = 400; // Bad Request
    }
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        processingTimeMs: processingTime
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
