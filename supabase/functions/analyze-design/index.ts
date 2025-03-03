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
    const { imageUrl, options } = await req.json()
    console.log('Analyzing design with Claude...')
    
    // Check for multi-screenshot flag - this needs special handling
    const isMultiScreenshot = options?.isMultiScreenshot || false
    
    if (isMultiScreenshot) {
      console.log('Multi-screenshot upload detected - applying special handling')
    }
    
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
    
    // For multi-screenshots, we need to be extra careful about format
    if (isMultiScreenshot && typeof imageUrl === 'string' && !imageUrl.startsWith('data:image/jpeg')) {
      console.warn("Multi-screenshot upload is not in JPEG format - this may cause Claude issues")
    }
    
    // If the image is a Supabase URL or any URL, we need to fetch it first
    let imageBase64;
    let imageMediaType = 'image/jpeg'; // Default media type for Claude API
    
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
        
        let imageBlob = await imageResponse.blob()
        console.log('Original image format:', imageBlob.type, 'size:', Math.round(imageBlob.size/1024), 'KB')
        
        // Claude supports multiple image formats: JPEG, PNG, GIF, WebP
        // Only convert if it's not one of the supported types
        const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!supportedFormats.includes(imageMediaType)) {
          console.warn(`Unsupported format detected in data URL: ${imageMediaType}. Converting to PNG.`)
          
          try {
            // Extract base64 data
            imageBase64 = imageUrl.split(',')[1]
            
            // Create a buffer from the base64 data
            const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0))
            
            // Create an ArrayBuffer from the Uint8Array
            const arrayBuffer = imageBuffer.buffer
            
            // Create a Blob from the ArrayBuffer
            const originalBlob = new Blob([arrayBuffer], { type: imageMediaType })
            
            // Check if this is likely a multi-screenshot image (large dimensions)
            let quality = 0.85;
            let scaleDown = false;
            
            // Convert to JPEG using createImageBitmap and OffscreenCanvas
            // This should handle transparency in PNG images
            const imageBitmap = await createImageBitmap(originalBlob)
            
            // For multi-screenshots, check dimensions and scale if needed
            if (isMultiScreenshot || imageBitmap.width * imageBitmap.height > 3000 * 2000) {
              console.log(`Large image detected: ${imageBitmap.width}x${imageBitmap.height} - likely a multi-screenshot`);
              
              // For extremely large images, scale down
              if (imageBitmap.width * imageBitmap.height > 6000 * 4000) {
                scaleDown = true;
                console.log('Image is extremely large. Scaling down for Claude compatibility');
                // Use slightly lower quality for large images, but keep detail
                quality = 0.80; 
              } else {
                // For moderately large images, use high quality to preserve details
                quality = 0.90;
              }
            }
            
            // Create appropriate canvas size
            let canvasWidth = imageBitmap.width;
            let canvasHeight = imageBitmap.height;
            
            // Scale down extremely large images
            if (scaleDown) {
              const scaleFactor = Math.sqrt((4000 * 3000) / (imageBitmap.width * imageBitmap.height));
              canvasWidth = Math.floor(imageBitmap.width * scaleFactor);
              canvasHeight = Math.floor(imageBitmap.height * scaleFactor);
              console.log(`Scaling to: ${canvasWidth}x${canvasHeight} with quality ${quality}`);
            }
            
            const canvas = new OffscreenCanvas(canvasWidth, canvasHeight)
            const ctx = canvas.getContext('2d', { alpha: false })
            
            if (!ctx) {
              throw new Error('Failed to create canvas context for JPEG conversion')
            }
            
            // Draw the image (even with alpha: false, fill with white for safety)
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Draw the image with scaling if needed
            if (scaleDown) {
              ctx.drawImage(imageBitmap, 0, 0, canvasWidth, canvasHeight)
            } else {
              ctx.drawImage(imageBitmap, 0, 0)
            }
            
            // For very large images, use JPEG for better compression
            // For normal sizes, use PNG for better quality
            const outputFormat = scaleDown ? 'image/jpeg' : 'image/png';
            const outputQuality = outputFormat === 'image/jpeg' ? quality : undefined;
            
            const outputBlob = await canvas.convertToBlob({ 
              type: outputFormat, 
              quality: outputQuality 
            });
            
            // Convert blob to base64
            const outputArrayBuffer = await outputBlob.arrayBuffer()
            const outputBuffer = new Uint8Array(outputArrayBuffer)
            imageBase64 = btoa(String.fromCharCode(...outputBuffer))
            
            // Update the media type
            imageMediaType = outputFormat
            
            console.log(`Successfully converted to ${outputFormat} format: ${Math.round(outputBuffer.length/1024)}KB`)
          } catch (conversionError) {
            console.error('Error converting image format:', conversionError)
            console.warn('Proceeding with original format, but Claude analysis might fail')
          }
        } else {
          // Only extract base64 data if we didn't already do conversion
          imageBase64 = imageUrl.split(',')[1]
        }
        
        console.log('Using provided base64 image data, format:', imageMediaType)
      } else if (imageUrl.startsWith('data:image/')) {
        // If it's already a data URL, extract the base64 part and media type
        // Make sure it's not an SVG
        if (imageUrl.startsWith('data:image/svg')) {
          throw new Error("SVG images are not supported for analysis")
        }
        
        // Extract media type from data URL
        const mediaTypeMatch = imageUrl.match(/^data:(image\/[^;]+);base64,/)
        if (mediaTypeMatch && mediaTypeMatch[1]) {
          imageMediaType = mediaTypeMatch[1]
        }
        
        // Claude supports multiple image formats: JPEG, PNG, GIF, WebP
        // Only convert if it's not one of the supported types
        const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!supportedFormats.includes(imageMediaType)) {
          console.warn(`Unsupported format detected in data URL: ${imageMediaType}. Converting to PNG.`)
          
          try {
            // Extract base64 data
            imageBase64 = imageUrl.split(',')[1]
            
            // Create a buffer from the base64 data
            const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0))
            
            // Create an ArrayBuffer from the Uint8Array
            const arrayBuffer = imageBuffer.buffer
            
            // Create a Blob from the ArrayBuffer
            const originalBlob = new Blob([arrayBuffer], { type: imageMediaType })
            
            // Check if this is likely a multi-screenshot image (large dimensions)
            let quality = 0.85;
            let scaleDown = false;
            
            // Convert to JPEG using createImageBitmap and OffscreenCanvas
            // This should handle transparency in PNG images
            const imageBitmap = await createImageBitmap(originalBlob)
            
            // For multi-screenshots, check dimensions and scale if needed
            if (isMultiScreenshot || imageBitmap.width * imageBitmap.height > 3000 * 2000) {
              console.log(`Large image detected: ${imageBitmap.width}x${imageBitmap.height} - likely a multi-screenshot`);
              
              // For extremely large images, scale down
              if (imageBitmap.width * imageBitmap.height > 6000 * 4000) {
                scaleDown = true;
                console.log('Image is extremely large. Scaling down for Claude compatibility');
                // Use slightly lower quality for large images, but keep detail
                quality = 0.80; 
              } else {
                // For moderately large images, use high quality to preserve details
                quality = 0.90;
              }
            }
            
            // Create appropriate canvas size
            let canvasWidth = imageBitmap.width;
            let canvasHeight = imageBitmap.height;
            
            // Scale down extremely large images
            if (scaleDown) {
              const scaleFactor = Math.sqrt((4000 * 3000) / (imageBitmap.width * imageBitmap.height));
              canvasWidth = Math.floor(imageBitmap.width * scaleFactor);
              canvasHeight = Math.floor(imageBitmap.height * scaleFactor);
              console.log(`Scaling to: ${canvasWidth}x${canvasHeight} with quality ${quality}`);
            }
            
            const canvas = new OffscreenCanvas(canvasWidth, canvasHeight)
            const ctx = canvas.getContext('2d', { alpha: false })
            
            if (!ctx) {
              throw new Error('Failed to create canvas context for JPEG conversion')
            }
            
            // Draw the image (even with alpha: false, fill with white for safety)
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Draw the image with scaling if needed
            if (scaleDown) {
              ctx.drawImage(imageBitmap, 0, 0, canvasWidth, canvasHeight)
            } else {
              ctx.drawImage(imageBitmap, 0, 0)
            }
            
            // For very large images, use JPEG for better compression
            // For normal sizes, use PNG for better quality
            const outputFormat = scaleDown ? 'image/jpeg' : 'image/png';
            const outputQuality = outputFormat === 'image/jpeg' ? quality : undefined;
            
            const outputBlob = await canvas.convertToBlob({ 
              type: outputFormat, 
              quality: outputQuality 
            });
            
            // Convert blob to base64
            const outputArrayBuffer = await outputBlob.arrayBuffer()
            const outputBuffer = new Uint8Array(outputArrayBuffer)
            imageBase64 = btoa(String.fromCharCode(...outputBuffer))
            
            // Update the media type
            imageMediaType = outputFormat
            
            console.log(`Successfully converted to ${outputFormat} format: ${Math.round(outputBuffer.length/1024)}KB`)
          } catch (conversionError) {
            console.error('Error converting image format:', conversionError)
            console.warn('Proceeding with original format, but Claude analysis might fail')
          }
        } else {
          // Only extract base64 data if we didn't already do conversion
          imageBase64 = imageUrl.split(',')[1]
        }
        
        console.log('Using provided base64 image data, format:', imageMediaType)
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
                  media_type: imageMediaType,
                  data: imageBase64
                }
              }
            ]
          }]
        })
      });

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