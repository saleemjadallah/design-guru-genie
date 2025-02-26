
import { useState, useRef, useEffect } from "react";
import { Circle, Square, Type, Minus } from "lucide-react";

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
};

export const AnnotationCanvas = ({ image, onSave, annotations = [] }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Draw annotations
    annotations.forEach((annotation) => {
      // Draw marker
      ctx.beginPath();
      ctx.arc(annotation.x, annotation.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = annotation.priority === "high" 
        ? "rgba(239, 68, 68, 0.9)" 
        : annotation.priority === "medium"
        ? "rgba(245, 158, 11, 0.9)"
        : "rgba(59, 130, 246, 0.9)";
      ctx.fill();

      // Draw number
      ctx.font = "bold 16px Inter";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(annotation.id.toString(), annotation.x, annotation.y);
    });
  };

  // Initialize image and canvas
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      imageRef.current = img;

      if (canvasRef.current) {
        // Set canvas size based on image dimensions while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvasRef.current.width = img.width * ratio;
        canvasRef.current.height = img.height * ratio;
        
        drawCanvas();
      }
    };
  }, [image]);

  // Redraw when annotations change
  useEffect(() => {
    drawCanvas();
  }, [annotations]);

  return (
    <div className="relative border rounded-lg overflow-hidden bg-neutral-50">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="max-w-full h-auto"
      />
    </div>
  );
};
