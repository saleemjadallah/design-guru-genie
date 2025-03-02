
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AnnotationCanvas } from "../../AnnotationCanvas";
import * as useCanvasManagerModule from "../useCanvasManager";
import { Annotation } from "../types";
import { setupMockCanvasManager, getMockAnnotations, resetMocks } from "./testUtils";

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
  const mockAnnotations: Annotation[] = getMockAnnotations();
  const mockOnSave = jest.fn();
  
  beforeEach(() => {
    resetMocks();
  });

  it("renders the canvas when image is loaded", () => {
    // Mock useCanvasManager implementation with image loaded
    setupMockCanvasManager({ imgLoaded: true });
    
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
    setupMockCanvasManager({ imgLoaded: false });
    
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
    setupMockCanvasManager({ imgLoaded: false, imgError: true });
    
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
