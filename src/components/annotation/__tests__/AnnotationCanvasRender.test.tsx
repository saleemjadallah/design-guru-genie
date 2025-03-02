
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AnnotationCanvas } from "../../AnnotationCanvas";
import * as useCanvasManagerModule from "../useCanvasManager";
import { Annotation } from "../types";

// Mock the useCanvasManager hook
jest.mock("../useCanvasManager", () => {
  const originalModule = jest.requireActual("../useCanvasManager");
  return {
    ...originalModule,
    useCanvasManager: jest.fn()
  };
});

describe("AnnotationCanvas Rendering States", () => {
  const mockImage = "test-image.jpg";
  const mockAnnotations: Annotation[] = [
    { id: 1, x: 100, y: 100, priority: "high" },
    { id: 2, x: 200, y: 200, priority: "medium" }
  ];
  const mockOnSave = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the canvas when image is loaded", () => {
    // Mock useCanvasManager implementation with image loaded
    const mockCanvasRef = { current: document.createElement("canvas") };
    const mockContainerRef = { current: document.createElement("div") };
    const mockImageRef = { current: new Image() };
    
    (useCanvasManagerModule.useCanvasManager as jest.Mock).mockReturnValue({
      canvasRef: mockCanvasRef,
      containerRef: mockContainerRef,
      imageRef: mockImageRef,
      scale: 1,
      imgLoaded: true,
      imgError: false,
      initialRender: false,
      canvasWidth: 800,
      canvasHeight: 600,
      loadImage: jest.fn(),
      updateScale: jest.fn().mockReturnValue(1),
      redrawCanvas: jest.fn(),
      setInitialRender: jest.fn()
    });
    
    render(
      <AnnotationCanvas
        image={mockImage}
        annotations={mockAnnotations}
        onSave={mockOnSave}
      />
    );
    
    // Canvas should be visible
    const canvas = screen.getByRole("img");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveStyle({ display: "block" });
  });

  it("shows loading state when image is not loaded", () => {
    // Update the mock to return imgLoaded as false
    (useCanvasManagerModule.useCanvasManager as jest.Mock).mockReturnValue({
      canvasRef: { current: document.createElement("canvas") },
      containerRef: { current: document.createElement("div") },
      imageRef: { current: new Image() },
      scale: 1,
      imgLoaded: false,
      imgError: false,
      initialRender: false,
      canvasWidth: 800,
      canvasHeight: 600,
      loadImage: jest.fn(),
      updateScale: jest.fn(),
      redrawCanvas: jest.fn(),
      setInitialRender: jest.fn()
    });
    
    render(
      <AnnotationCanvas
        image={mockImage}
        annotations={mockAnnotations}
        onSave={mockOnSave}
      />
    );
    
    // Loading message should be visible
    expect(screen.getByText("Loading image...")).toBeInTheDocument();
    
    // Canvas should be hidden
    const canvas = screen.getByRole("img");
    expect(canvas).toHaveStyle({ display: "none" });
  });

  it("shows fallback component when there's an image error", () => {
    // Update the mock to return imgError as true
    (useCanvasManagerModule.useCanvasManager as jest.Mock).mockReturnValue({
      canvasRef: { current: document.createElement("canvas") },
      containerRef: { current: document.createElement("div") },
      imageRef: { current: new Image() },
      scale: 1,
      imgLoaded: false,
      imgError: true,
      initialRender: false,
      canvasWidth: 800,
      canvasHeight: 600,
      loadImage: jest.fn(),
      updateScale: jest.fn(),
      redrawCanvas: jest.fn(),
      setInitialRender: jest.fn()
    });
    
    render(
      <AnnotationCanvas
        image={mockImage}
        annotations={mockAnnotations}
        onSave={mockOnSave}
      />
    );
    
    // Should render the AnnotationFallback component
    // The image from AnnotationFallback should be rendered
    const fallbackImage = screen.getByAltText("Original uploaded design");
    expect(fallbackImage).toBeInTheDocument();
  });
});
