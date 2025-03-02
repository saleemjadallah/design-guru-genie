
import React from "react";
import { render, waitFor } from "@testing-library/react";
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

describe("AnnotationCanvas Lifecycle", () => {
  const mockImage = "test-image.jpg";
  const mockAnnotations: Annotation[] = getMockAnnotations();
  const mockOnSave = jest.fn();
  
  beforeEach(() => {
    resetMocks();
  });

  it("calls loadImage on mount", () => {
    const { mockLoadImage } = setupMockCanvasManager();
    
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
    const { mockRedrawCanvas } = setupMockCanvasManager({ imgLoaded: true });
    
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
