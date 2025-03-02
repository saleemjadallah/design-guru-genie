
import { useState, useRef, useEffect } from "react";
import { Annotation } from "./types";
import { drawCanvas } from "./canvasUtils";

export const useCanvasManager = (image: string, annotations: Annotation[]) => {
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
    setImgLoaded(false);
    
    const img = new Image();
    img.onload = () => {
      console.log("Image loaded successfully:", img.width, "x", img.height);
      imageRef.current = img;
      setImgLoaded(true);
      setImgError(false);

      requestAnimationFrame(() => {
        if (canvasRef.current && containerRef.current) {
          const container = containerRef.current;
          const containerWidth = container.clientWidth;
          const ratio = containerWidth / img.width;
          
          const newWidth = Math.max(containerWidth, 1);
          const newHeight = Math.max(Math.round(img.height * ratio), 1);
          
          setCanvasWidth(newWidth);
          setCanvasHeight(newHeight);
          
          canvasRef.current.width = newWidth;
          canvasRef.current.height = newHeight;
          
          const newScale = newWidth / img.width;
          console.log(`Setting scale: ${newWidth} / ${img.width} = ${newScale}`);
          setScale(newScale);
          
          requestAnimationFrame(redrawCanvas);
        }
      });
    };
    
    img.onerror = (e) => {
      console.error("Image loading error:", e);
      setImgError(true);
      setImgLoaded(false);
      
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadImage(), 500);
      }
    };

    img.src = image;
    
    if (img.complete) {
      if (img.naturalWidth) {
        img.onload?.(new Event('load') as any);
      } else {
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

  const redrawCanvas = () => {
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

    drawCanvas(ctx, canvas, imageRef.current, annotations, null, scale);
  };

  return {
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
    redrawCanvas,
    setInitialRender
  };
};
