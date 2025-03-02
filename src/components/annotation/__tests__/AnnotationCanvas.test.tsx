
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

describe("AnnotationCanvas", () => {
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

  it("renders the canvas when image is loaded", () => {
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
    // We can't directly test for the component, but we can check that the canvas isn't rendered
    const canvas = screen.queryByRole("img");
    expect(canvas).not.toBeInTheDocument();
    
    // The image from AnnotationFallback should be rendered
    const fallbackImage = screen.getByAltText("Original uploaded design");
    expect(fallbackImage).toBeInTheDocument();
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
