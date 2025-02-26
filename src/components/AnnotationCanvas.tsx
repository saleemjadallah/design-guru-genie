
import { useState, useRef, useEffect } from "react";
import { Circle, Square, Type, Minus } from "lucide-react";

type Annotation = {
  type: "circle" | "rectangle" | "text" | "arrow";
  x: number;
  y: number;
  text?: string;
  width?: number;
  height?: number;
};

type Props = {
  image: string;
  onSave: (annotations: Annotation[]) => void;
};

export const AnnotationCanvas = ({ image, onSave }: Props) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTool, setActiveTool] = useState<Annotation["type"]>("circle");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [image]);

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
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;

      switch (annotation.type) {
        case "circle":
          ctx.beginPath();
          ctx.arc(annotation.x, annotation.y, 20, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "rectangle":
          ctx.strokeRect(annotation.x - 20, annotation.y - 20, 40, 40);
          break;
        case "text":
          ctx.font = "16px Inter";
          ctx.fillStyle = "#3b82f6";
          ctx.fillText(annotation.text || "Add text", annotation.x, annotation.y);
          break;
        case "arrow":
          ctx.beginPath();
          ctx.moveTo(annotation.x, annotation.y);
          ctx.lineTo(annotation.x + 50, annotation.y);
          ctx.stroke();
          
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(annotation.x + 50, annotation.y);
          ctx.lineTo(annotation.x + 45, annotation.y - 5);
          ctx.lineTo(annotation.x + 45, annotation.y + 5);
          ctx.closePath();
          ctx.fillStyle = "#3b82f6";
          ctx.fill();
          break;
      }
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [annotations]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newAnnotation: Annotation = {
      type: activeTool,
      x,
      y,
      text: activeTool === "text" ? "Double click to edit" : undefined,
    };

    setAnnotations([...annotations, newAnnotation]);
    onSave([...annotations, newAnnotation]);
  };

  return (
    <div className="relative border rounded-lg overflow-hidden bg-neutral-50">
      <div className="absolute top-4 left-4 flex gap-2 p-2 bg-white rounded-lg shadow-sm">
        <button
          className={`p-2 rounded-md transition-colors ${
            activeTool === "circle"
              ? "bg-accent text-white"
              : "hover:bg-neutral-100"
          }`}
          onClick={() => setActiveTool("circle")}
        >
          <Circle className="w-5 h-5" />
        </button>
        <button
          className={`p-2 rounded-md transition-colors ${
            activeTool === "rectangle"
              ? "bg-accent text-white"
              : "hover:bg-neutral-100"
          }`}
          onClick={() => setActiveTool("rectangle")}
        >
          <Square className="w-5 h-5" />
        </button>
        <button
          className={`p-2 rounded-md transition-colors ${
            activeTool === "text"
              ? "bg-accent text-white"
              : "hover:bg-neutral-100"
          }`}
          onClick={() => setActiveTool("text")}
        >
          <Type className="w-5 h-5" />
        </button>
        <button
          className={`p-2 rounded-md transition-colors ${
            activeTool === "arrow"
              ? "bg-accent text-white"
              : "hover:bg-neutral-100"
          }`}
          onClick={() => setActiveTool("arrow")}
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        className="max-w-full h-auto"
      />
    </div>
  );
};
