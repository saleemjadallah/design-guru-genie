
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

  const loadImage = () => {
    console.log("Loading image:", image);
    
    // Create a new image instance
    const img = new Image();
    
    // Set up onload handler before setting the src
    img.onload = () => {
      console.log("Image loaded successfully:", img.width, "x", img.height);
      imageRef.current = img;
      setImgLoaded(true);
      setImgError(false);

      if (canvasRef.current && containerRef.current) {
        // Set canvas size based on container width while maintaining aspect ratio
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const ratio = containerWidth / img.width;
        
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = img.height * ratio;
        
        updateScale();
        
        // Force immediate draw
        setTimeout(() => {
          drawCanvas();
        }, 0);
      }
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
    if (img.complete && !img.naturalWidth) {
      img.onerror?.(new Event('error') as any);
    } else if (img.complete) {
      img.onload?.(new Event('load') as any);
    }
  };

  const updateScale = () => {
    if (!containerRef.current || !imageRef.current) return;
    
    const container = containerRef.current;
    const img = imageRef.current;
    const displayWidth = container.clientWidth;
    const originalWidth = img.naturalWidth;
    setScale(displayWidth / originalWidth);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current || !imgLoaded) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

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
    loadImage();
    
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
      
      canvasRef.current.width = containerWidth;
      canvasRef.current.height = img.height * ratio;
      
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
    if (imgLoaded) {
      drawCanvas();
    }
  }, [annotations, selectedIssue, scale, imgLoaded]);

  // Ensure canvas is initialized properly on component mount
  useEffect(() => {
    // Force a redraw at the next animation frame to ensure canvas is painted
    if (imgLoaded) {
      requestAnimationFrame(() => {
        drawCanvas();
      });
    }
  }, [imgLoaded]);

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

  // Add a fallback image display
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
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm -ml-4 -mt-4 ${
                annotation.priority === "high" ? "bg-red-500" : 
                annotation.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
              } ${selectedIssue === annotation.id ? 'ring-2 ring-white' : ''}`}
              style={{
                left: `${annotation.x}px`,
                top: `${annotation.y}px`,
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
      <div ref={containerRef} className="relative w-full">
        {imgError ? (
          renderFallback()
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-auto cursor-pointer"
            onClick={handleCanvasClick}
          />
        )}
        
        {!imgLoaded && !imgError && (
          <div className="w-full py-16 flex items-center justify-center bg-neutral-50 rounded-lg">
            <div className="animate-pulse text-neutral-500">
              Loading image...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
