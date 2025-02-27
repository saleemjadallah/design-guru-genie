
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
    // Create a new image instance
    const img = new Image();
    
    // Set up onload handler before setting the src
    img.onload = () => {
      imageRef.current = img;
      setImgLoaded(true);

      if (canvasRef.current && containerRef.current) {
        // Set canvas size based on container width while maintaining aspect ratio
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const ratio = containerWidth / img.width;
        
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = img.height * ratio;
        
        updateScale();
        drawCanvas();
      }
    };

    // Set src after defining onload handler
    img.src = image;
    
    // Force the img element to be immediately cached and processed
    if (img.complete) {
      img.onload?.(new Event('load') as any);
    }
    
    // Cleanup function
    return () => {
      img.onload = null;
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div ref={containerRef} className="relative w-full">
        <canvas
          ref={canvasRef}
          className="w-full h-auto cursor-pointer"
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  );
};
