
import { useRef, useEffect, useState } from "react";

type Annotation = {
  id: number;
  x: number;
  y: number;
  priority?: "low" | "medium" | "high";
};

type Props = {
  image: string;
  onSave: (annotations: Annotation[]) => void;
  annotations?: Annotation[];
  selectedIssue?: number | null;
  onIssueSelect?: (id: number | null) => void;
};

export const AnnotationCanvas = ({ 
  image, 
  annotations = [], 
  selectedIssue,
  onIssueSelect 
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [initialRender, setInitialRender] = useState(true);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const loadImage = () => {
    console.log("Loading image:", image);
    setImgLoaded(false); // Reset loading state first
    
    // Create a new image instance
    const img = new Image();
    
    // Set up onload handler before setting the src
    img.onload = () => {
      console.log("Image loaded successfully:", img.width, "x", img.height);
      imageRef.current = img;
      setImgLoaded(true);
      setImgError(false);

      // Delay setting dimensions to ensure DOM has updated
      requestAnimationFrame(() => {
        if (canvasRef.current && containerRef.current) {
          // Set canvas size based on container width while maintaining aspect ratio
          const container = containerRef.current;
          const containerWidth = container.clientWidth;
          const ratio = containerWidth / img.width;
          
          // Update canvas dimensions - ensure non-zero values
          const newWidth = Math.max(containerWidth, 1);
          const newHeight = Math.max(Math.round(img.height * ratio), 1);
          
          setCanvasWidth(newWidth);
          setCanvasHeight(newHeight);
          
          canvasRef.current.width = newWidth;
          canvasRef.current.height = newHeight;
          
          // Calculate scale after dimensions are set
          const newScale = newWidth / img.width;
          console.log(`Setting scale: ${newWidth} / ${img.width} = ${newScale}`);
          setScale(newScale);
          
          // Force draw after dimensions and scale are updated
          requestAnimationFrame(drawCanvas);
        }
      });
    };
    
    img.onerror = (e) => {
      console.error("Image loading error:", e);
      setImgError(true);
      setImgLoaded(false);
      
      // If we haven't retried too many times, try again
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadImage(), 500);
      }
    };

    // Set src after defining onload handler
    img.src = image;
    
    // Force the img element to be immediately cached and processed
    if (img.complete) {
      if (img.naturalWidth) {
        // Image is already cached
        img.onload?.(new Event('load') as any);
      } else {
        // Image failed to load
        img.onerror?.(new Event('error') as any);
      }
    }
  };

  const updateScale = () => {
    if (!containerRef.current || !imageRef.current) return;
    
    const container = containerRef.current;
    const img = imageRef.current;
    const displayWidth = container.clientWidth;
    const originalWidth = img.naturalWidth;
    const newScale = displayWidth / originalWidth;
    
    console.log(`Updating scale: ${displayWidth} / ${originalWidth} = ${newScale}`);
    setScale(newScale);
    
    return newScale;
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current) {
      console.error("Cannot draw canvas: Missing canvas, context, or image");
      return;
    }
    
    if (!imgLoaded) {
      console.warn("Cannot draw canvas: Image not loaded");
      return;
    }

    console.log(`Drawing canvas with ${annotations.length} annotations, scale: ${scale}`);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    try {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error("Error drawing image on canvas:", error);
      return;
    }

    // Draw annotations with proper scaling and positioning
    annotations.forEach((annotation) => {
      // Scale coordinates to match current canvas size
      const scaledX = Math.round(annotation.x * scale);
      const scaledY = Math.round(annotation.y * scale);

      // Draw connector line
      ctx.beginPath();
      ctx.strokeStyle = annotation.priority === "high" 
        ? "rgba(239, 68, 68, 0.6)" 
        : annotation.priority === "medium"
        ? "rgba(245, 158, 11, 0.6)"
        : "rgba(59, 130, 246, 0.6)";
      ctx.lineWidth = 2;
      
      // Calculate marker offset to prevent overlap
      const markerRadius = 16;
      const offset = 30; // Distance from the point to the marker
      const angle = Math.PI / 4; // 45 degrees angle for the line
      const markerX = scaledX + Math.cos(angle) * offset;
      const markerY = scaledY - Math.sin(angle) * offset;
      
      // Draw connecting line
      ctx.moveTo(scaledX, scaledY);
      ctx.lineTo(markerX, markerY);
      ctx.stroke();

      // Draw marker with shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.beginPath();
      ctx.arc(markerX, markerY, markerRadius, 0, Math.PI * 2);
      ctx.fillStyle = annotation.priority === "high" 
        ? "rgba(239, 68, 68, 0.9)" 
        : annotation.priority === "medium"
        ? "rgba(245, 158, 11, 0.9)"
        : "rgba(59, 130, 246, 0.9)";
      
      if (selectedIssue === annotation.id) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      ctx.fill();
      ctx.restore();

      // Draw number with better typography
      ctx.font = "bold 14px Inter";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(annotation.id.toString(), markerX, markerY);
    });
  };

  // Initialize image and canvas
  useEffect(() => {
    console.log("AnnotationCanvas initialized with", annotations.length, "annotations");
    loadImage();
    
    // Flag to force an initial render
    setInitialRender(true);
    
    // Cleanup function
    return () => {
      if (imageRef.current) {
        imageRef.current.onload = null;
        imageRef.current.onerror = null;
      }
    };
  }, [image]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (!imageRef.current || !canvasRef.current || !containerRef.current) return;
      
      const container = containerRef.current;
      const img = imageRef.current;
      const containerWidth = container.clientWidth;
      const ratio = containerWidth / img.width;
      
      // Update canvas dimensions state - ensure non-zero values
      const newWidth = Math.max(containerWidth, 1);
      const newHeight = Math.max(Math.round(img.height * ratio), 1);
      
      setCanvasWidth(newWidth);
      setCanvasHeight(newHeight);
      
      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;
      
      updateScale();
      drawCanvas();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Redraw when annotations or selection changes
  useEffect(() => {
    console.log("Annotations or selection changed, redrawing canvas");
    if (imgLoaded) {
      drawCanvas();
    }
  }, [annotations, selectedIssue, imgLoaded]);

  // Force redraw after a short delay to ensure rendering happens properly
  useEffect(() => {
    if (initialRender && imgLoaded) {
      console.log("Initial render with loaded image, scheduling redraws");
      
      // Using requestAnimationFrame for smoother rendering
      const animationIds: number[] = [];
      
      // Force multiple redraws at different times to catch any timing issues
      animationIds.push(window.requestAnimationFrame(() => {
        console.log("Redraw 1");
        drawCanvas();
      }));
      
      // Second redraw with delay
      const timer = setTimeout(() => {
        animationIds.push(window.requestAnimationFrame(() => {
          console.log("Redraw 2");
          drawCanvas();
        }));
      }, 250);
      
      // Third redraw with longer delay
      const timer2 = setTimeout(() => {
        animationIds.push(window.requestAnimationFrame(() => {
          console.log("Redraw 3");
          drawCanvas();
        }));
      }, 500);
      
      // Set flag to prevent repeated initial renders
      setInitialRender(false);
      
      return () => {
        // Clean up all animation frames and timers
        animationIds.forEach(id => window.cancelAnimationFrame(id));
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, [initialRender, imgLoaded]);

  // Additional effect to react to scale changes
  useEffect(() => {
    if (scale > 0 && imgLoaded) {
      console.log("Scale changed to", scale, "- redrawing canvas");
      requestAnimationFrame(drawCanvas);
    }
  }, [scale]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onIssueSelect) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is within any annotation
    const clickedAnnotation = annotations.find(annotation => {
      const scaledX = annotation.x * scale;
      const scaledY = annotation.y * scale;
      
      // Calculate marker position with offset
      const offset = 30;
      const angle = Math.PI / 4;
      const markerX = scaledX + Math.cos(angle) * offset;
      const markerY = scaledY - Math.sin(angle) * offset;
      
      const dx = x - markerX;
      const dy = y - markerY;
      return Math.sqrt(dx * dx + dy * dy) <= 16;
    });

    onIssueSelect(clickedAnnotation?.id || null);
  };

  // Add a fallback display for when canvas errors out
  const renderFallback = () => {
    if (imgError) {
      return (
        <div className="relative">
          <img 
            src={image} 
            alt="Original uploaded design" 
            className="w-full h-auto rounded"
            style={{ maxHeight: "600px", objectFit: "contain" }}
          />
          {annotations.map((annotation) => (
            <div 
              key={annotation.id}
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                annotation.priority === "high" ? "bg-red-500" : 
                annotation.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
              } ${selectedIssue === annotation.id ? 'ring-2 ring-white' : ''}`}
              style={{
                left: `${annotation.x * scale}px`,
                top: `${annotation.y * scale}px`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer'
              }}
              onClick={() => onIssueSelect?.(annotation.id)}
            >
              {annotation.id}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div ref={containerRef} className="relative w-full min-h-[300px]">
        {imgError ? (
          renderFallback()
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={canvasWidth || 300}
              height={canvasHeight || 200}
              className="w-full h-auto cursor-pointer rounded border border-transparent"
              onClick={handleCanvasClick}
              style={{ display: imgLoaded ? 'block' : 'none' }}
            />
            
            {/* Fallback when image isn't loaded yet */}
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 rounded-lg min-h-[300px]">
                <div className="animate-pulse text-neutral-500">
                  Loading image...
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
