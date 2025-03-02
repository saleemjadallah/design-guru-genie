
import { Annotation } from "./types";

export const drawCanvas = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  imageRef: HTMLImageElement,
  annotations: Annotation[],
  selectedIssue: number | null | undefined,
  scale: number,
  displayNumberMap?: Map<number, number>
) => {
  if (!ctx || !canvas || !imageRef) {
    console.error("Cannot draw canvas: Missing canvas, context, or image");
    return;
  }

  console.log(`Drawing canvas with ${annotations.length} annotations, scale: ${scale}`);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  try {
    ctx.drawImage(imageRef, 0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.error("Error drawing image on canvas:", error);
    return;
  }

  annotations.forEach((annotation, index) => {
    const scaledX = Math.round(annotation.x * scale);
    const scaledY = Math.round(annotation.y * scale);

    ctx.beginPath();
    ctx.strokeStyle = annotation.priority === "high" 
      ? "rgba(239, 68, 68, 0.6)" 
      : annotation.priority === "medium"
      ? "rgba(245, 158, 11, 0.6)"
      : "rgba(59, 130, 246, 0.6)";
    ctx.lineWidth = 2;
    
    const markerRadius = 16;
    const offset = 30;
    const angle = Math.PI / 4;
    const markerX = scaledX + Math.cos(angle) * offset;
    const markerY = scaledY - Math.sin(angle) * offset;
    
    ctx.moveTo(scaledX, scaledY);
    ctx.lineTo(markerX, markerY);
    ctx.stroke();

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

    const displayNumber = displayNumberMap && annotation.id ? 
      displayNumberMap.get(annotation.id) || index + 1 : 
      index + 1;
      
    ctx.font = "bold 14px Inter";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayNumber.toString(), markerX, markerY);
  });
};

export const handleCanvasClick = (
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement | null,
  annotations: Annotation[],
  scale: number,
  onIssueSelect?: (id: number | null) => void
) => {
  if (!onIssueSelect || !canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const clickedAnnotation = annotations.find(annotation => {
    const scaledX = annotation.x * scale;
    const scaledY = annotation.y * scale;
    
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
