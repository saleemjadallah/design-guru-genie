
import React, { useEffect } from "react";
import { AnnotationCanvasProps, Annotation } from "./annotation/types";
import { useCanvasManager } from "./annotation/useCanvasManager";
import { drawCanvas, handleCanvasClick } from "./annotation/canvasUtils";
import { AnnotationFallback } from "./annotation/AnnotationFallback";

export const AnnotationCanvas = ({ 
  image, 
  annotations = [], 
  selectedIssue,
  onIssueSelect,
  displayNumberMap,
  onSave
}: AnnotationCanvasProps) => {
  const {
    canvasRef,
    containerRef,
    imageRef,
    scale,
    imgLoaded,
    imgError,
    initialRender,
    canvasWidth,
    canvasHeight,
    loadImage,
    updateScale,
    setInitialRender
  } = useCanvasManager(image, annotations);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current || !imgLoaded) return;
    
    drawCanvas(ctx, canvas, imageRef.current, annotations, selectedIssue, scale, displayNumberMap);
  };

  useEffect(() => {
    console.log("AnnotationCanvas initialized with", annotations.length, "annotations");
    loadImage();
    
    setInitialRender(true);
    
    return () => {
      if (imageRef.current) {
        imageRef.current.onload = null;
        imageRef.current.onerror = null;
      }
    };
  }, [image]);

  useEffect(() => {
    const handleResize = () => {
      if (!imageRef.current || !canvasRef.current || !containerRef.current) return;
      
      const container = containerRef.current;
      const img = imageRef.current;
      const containerWidth = container.clientWidth;
      const ratio = containerWidth / img.width;
      
      const newWidth = Math.max(containerWidth, 1);
      const newHeight = Math.max(Math.round(img.height * ratio), 1);
      
      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;
      
      updateScale();
      redrawCanvas();
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

  useEffect(() => {
    console.log("Annotations or selection changed, redrawing canvas");
    if (imgLoaded) {
      redrawCanvas();
    }
  }, [annotations, selectedIssue, imgLoaded]);

  useEffect(() => {
    if (initialRender && imgLoaded) {
      console.log("Initial render with loaded image, scheduling redraws");
      
      const animationIds: number[] = [];
      
      animationIds.push(window.requestAnimationFrame(() => {
        console.log("Redraw 1");
        redrawCanvas();
      }));
      
      const timer = setTimeout(() => {
        animationIds.push(window.requestAnimationFrame(() => {
          console.log("Redraw 2");
          redrawCanvas();
        }));
      }, 250);
      
      const timer2 = setTimeout(() => {
        animationIds.push(window.requestAnimationFrame(() => {
          console.log("Redraw 3");
          redrawCanvas();
        }));
      }, 500);
      
      setInitialRender(false);
      
      return () => {
        animationIds.forEach(id => window.cancelAnimationFrame(id));
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, [initialRender, imgLoaded]);

  useEffect(() => {
    if (scale > 0 && imgLoaded) {
      console.log("Scale changed to", scale, "- redrawing canvas");
      requestAnimationFrame(redrawCanvas);
    }
  }, [scale]);

  const onCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    handleCanvasClick(
      event,
      canvasRef.current,
      annotations,
      scale,
      onIssueSelect
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div ref={containerRef} className="relative w-full min-h-[300px]">
        {imgError ? (
          <AnnotationFallback
            image={image}
            annotations={annotations}
            scale={scale}
            selectedIssue={selectedIssue}
            onIssueSelect={onIssueSelect}
          />
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={canvasWidth || 300}
              height={canvasHeight || 200}
              className="w-full h-auto cursor-pointer rounded border border-transparent"
              onClick={onCanvasClick}
              style={{ display: imgLoaded ? 'block' : 'none' }}
            />
            
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
