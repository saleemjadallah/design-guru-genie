
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AnnotationCanvas } from "../../AnnotationCanvas";
import * as canvasUtils from "../canvasUtils";
import * as useCanvasManagerModule from "../useCanvasManager";
import { Annotation } from "../types";

// Mock the canvasUtils
jest.mock("../canvasUtils", () => ({
  drawCanvas: jest.fn(),
  handleCanvasClick: jest.fn()
}));

// Mock the useCanvasManager hook
jest.mock("../useCanvasManager", () => {
  const originalModule = jest.requireActual("../useCanvasManager");
  return {
    ...originalModule,
    useCanvasManager: jest.fn()
  };
});

describe("AnnotationCanvas Interactions", () => {
  const mockImage = "test-image.jpg";
  const mockAnnotations: Annotation[] = [
    { id: 1, x: 100, y: 100, priority: "high" },
    { id: 2, x: 200, y: 200, priority: "medium" }
  ];
  const mockOnSave = jest.fn();
  const mockOnIssueSelect = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useCanvasManager implementation
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
  });

  it("calls handleCanvasClick when clicking on canvas", () => {
    render(
      <AnnotationCanvas
        image={mockImage}
        annotations={mockAnnotations}
        onSave={mockOnSave}
        selectedIssue={1}
        onIssueSelect={mockOnIssueSelect}
      />
    );
    
    // Click on canvas
    const canvas = screen.getByRole("img");
    fireEvent.click(canvas);
    
    // Check if handleCanvasClick was called
    expect(canvasUtils.handleCanvasClick).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(HTMLCanvasElement),
      mockAnnotations,
      1,
      mockOnIssueSelect
    );
  });
});
