
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AnnotationCanvas } from "../../AnnotationCanvas";
import * as canvasUtils from "../canvasUtils";
import * as useCanvasManagerModule from "../useCanvasManager";
import { Annotation } from "../types";
import { setupMockCanvasManager, getMockAnnotations, resetMocks } from "./testUtils";

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
  const mockAnnotations: Annotation[] = getMockAnnotations();
  const mockOnSave = jest.fn();
  const mockOnIssueSelect = jest.fn();
  
  beforeEach(() => {
    resetMocks();
    setupMockCanvasManager();
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
