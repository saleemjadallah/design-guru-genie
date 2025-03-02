
import React from "react";
import { render, waitFor } from "@testing-library/react";
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

describe("AnnotationCanvas Lifecycle", () => {
  const mockImage = "test-image.jpg";
  const mockAnnotations: Annotation[] = [
    { id: 1, x: 100, y: 100, priority: "high" },
    { id: 2, x: 200, y: 200, priority: "medium" }
  ];
  const mockOnSave = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls loadImage on mount", () => {
    const mockLoadImage = jest.fn();
    (useCanvasManagerModule.useCanvasManager as jest.Mock).mockReturnValue({
      canvasRef: { current: document.createElement("canvas") },
      containerRef: { current: document.createElement("div") },
      imageRef: { current: new Image() },
      scale: 1,
      imgLoaded: true,
      imgError: false,
      initialRender: false,
      canvasWidth: 800,
      canvasHeight: 600,
      loadImage: mockLoadImage,
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
    
    // Check if loadImage was called on mount
    expect(mockLoadImage).toHaveBeenCalled();
  });

  it("calls drawCanvas when annotations or selectedIssue changes", async () => {
    const mockRedrawCanvas = jest.fn();
    (useCanvasManagerModule.useCanvasManager as jest.Mock).mockReturnValue({
      canvasRef: { current: document.createElement("canvas") },
      containerRef: { current: document.createElement("div") },
      imageRef: { current: new Image() },
      scale: 1,
      imgLoaded: true,
      imgError: false,
      initialRender: false,
      canvasWidth: 800,
      canvasHeight: 600,
      loadImage: jest.fn(),
      updateScale: jest.fn(),
      redrawCanvas: mockRedrawCanvas,
      setInitialRender: jest.fn()
    });
    
    const { rerender } = render(
      <AnnotationCanvas
        image={mockImage}
        annotations={mockAnnotations}
        onSave={mockOnSave}
        selectedIssue={1}
      />
    );
    
    // Update props to trigger effect
    rerender(
      <AnnotationCanvas
        image={mockImage}
        annotations={mockAnnotations}
        onSave={mockOnSave}
        selectedIssue={2}
      />
    );
    
    // Check if redrawCanvas was called
    await waitFor(() => {
      expect(mockRedrawCanvas).toHaveBeenCalled();
    });
  });
});
