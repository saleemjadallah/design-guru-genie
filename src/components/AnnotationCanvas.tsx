
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

    // Draw annotations with proper scaling
    annotations.forEach((annotation) => {
      const scaledX = annotation.x * scale;
      const scaledY = annotation.y * scale;

      // Draw marker with shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.beginPath();
      ctx.arc(scaledX, scaledY, 16, 0, Math.PI * 2);
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
      ctx.fillText(annotation.id.toString(), scaledX, scaledY);
    });
  };

  // Initialize image and canvas
  useEffect(() => {
    const img = new Image();
    img.src = image;
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

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Redraw when annotations or selection changes
  useEffect(() => {
    if (imgLoaded) {
      drawCanvas();
    }
  }, [annotations, selectedIssue, scale, imgLoaded]);

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
      const dx = x - scaledX;
      const dy = y - scaledY;
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
