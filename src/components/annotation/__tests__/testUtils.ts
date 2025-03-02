
import React from "react";
import * as useCanvasManagerModule from "../useCanvasManager";
import { Annotation } from "../types";

export type MockCanvasManagerOptions = {
  imgLoaded?: boolean;
  imgError?: boolean;
  initialRender?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  scale?: number;
};

export const setupMockCanvasManager = (options: MockCanvasManagerOptions = {}) => {
  const {
    imgLoaded = true,
    imgError = false,
    initialRender = false,
    canvasWidth = 800,
    canvasHeight = 600,
    scale = 1
  } = options;

  const mockCanvasRef = { current: document.createElement("canvas") };
  const mockContainerRef = { current: document.createElement("div") };
  const mockImageRef = { current: new Image() };
  const mockLoadImage = jest.fn();
  const mockUpdateScale = jest.fn().mockReturnValue(scale);
  const mockRedrawCanvas = jest.fn();
  const mockSetInitialRender = jest.fn();
  
  jest.spyOn(useCanvasManagerModule, "useCanvasManager").mockReturnValue({
    canvasRef: mockCanvasRef,
    containerRef: mockContainerRef,
    imageRef: mockImageRef,
    scale,
    imgLoaded,
    imgError,
    initialRender,
    canvasWidth,
    canvasHeight,
    loadImage: mockLoadImage,
    updateScale: mockUpdateScale,
    redrawCanvas: mockRedrawCanvas,
    setInitialRender: mockSetInitialRender
  });

  return {
    mockCanvasRef,
    mockContainerRef,
    mockImageRef,
    mockLoadImage,
    mockUpdateScale,
    mockRedrawCanvas,
    mockSetInitialRender
  };
};

export const getMockAnnotations = (): Annotation[] => [
  { id: 1, x: 100, y: 100, priority: "high" },
  { id: 2, x: 200, y: 200, priority: "medium" }
];

export const resetMocks = () => {
  jest.clearAllMocks();
};
