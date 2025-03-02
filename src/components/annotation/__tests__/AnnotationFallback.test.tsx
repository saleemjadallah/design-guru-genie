
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnnotationFallback } from "../AnnotationFallback";
import { Annotation } from "../types";

describe("AnnotationFallback", () => {
  const mockImage = "test-image.jpg";
  const mockScale = 1;
  const mockAnnotations: Annotation[] = [
    { id: 1, x: 100, y: 100, priority: "high" },
    { id: 2, x: 200, y: 200, priority: "medium" },
    { id: 3, x: 300, y: 300, priority: "low" }
  ];
  
  it("renders the image correctly", () => {
    render(
      <AnnotationFallback
        image={mockImage}
        annotations={mockAnnotations}
        scale={mockScale}
      />
    );
    
    const img = screen.getByAltText("Original uploaded design");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", mockImage);
  });

  it("renders annotation markers with correct priorities", () => {
    render(
      <AnnotationFallback
        image={mockImage}
        annotations={mockAnnotations}
        scale={mockScale}
      />
    );
    
    // Check if all annotation markers are present
    const markers = screen.getAllByText(/[1-3]/);
    expect(markers).toHaveLength(3);
    
    // Check if annotations have correct styles based on priority
    const highPriorityMarker = screen.getByText("1").parentElement;
    const mediumPriorityMarker = screen.getByText("2").parentElement;
    const lowPriorityMarker = screen.getByText("3").parentElement;
    
    expect(highPriorityMarker).toHaveClass("bg-red-500");
    expect(mediumPriorityMarker).toHaveClass("bg-amber-500");
    expect(lowPriorityMarker).toHaveClass("bg-blue-500");
  });

  it("positions annotations correctly based on coordinates and scale", () => {
    const testScale = 0.5;
    
    render(
      <AnnotationFallback
        image={mockImage}
        annotations={mockAnnotations}
        scale={testScale}
      />
    );
    
    // Check if annotations are positioned correctly
    const highPriorityMarker = screen.getByText("1").parentElement;
    const mediumPriorityMarker = screen.getByText("2").parentElement;
    const lowPriorityMarker = screen.getByText("3").parentElement;
    
    expect(highPriorityMarker).toHaveStyle({ left: "50px", top: "50px" }); // 100 * 0.5
    expect(mediumPriorityMarker).toHaveStyle({ left: "100px", top: "100px" }); // 200 * 0.5
    expect(lowPriorityMarker).toHaveStyle({ left: "150px", top: "150px" }); // 300 * 0.5
  });

  it("highlights the selected annotation", () => {
    render(
      <AnnotationFallback
        image={mockImage}
        annotations={mockAnnotations}
        scale={mockScale}
        selectedIssue={2}
      />
    );
    
    // Check if selected annotation has highlight styles
    const selectedMarker = screen.getByText("2").parentElement;
    expect(selectedMarker).toHaveClass("ring-2");
    expect(selectedMarker).toHaveClass("ring-white");
    
    // Check if other annotations don't have highlight styles
    const nonSelectedMarker1 = screen.getByText("1").parentElement;
    const nonSelectedMarker3 = screen.getByText("3").parentElement;
    expect(nonSelectedMarker1).not.toHaveClass("ring-2");
    expect(nonSelectedMarker3).not.toHaveClass("ring-2");
  });

  it("calls onIssueSelect when clicking an annotation", () => {
    const onIssueSelectMock = jest.fn();
    
    render(
      <AnnotationFallback
        image={mockImage}
        annotations={mockAnnotations}
        scale={mockScale}
        onIssueSelect={onIssueSelectMock}
      />
    );
    
    // Click on an annotation
    fireEvent.click(screen.getByText("2").parentElement!);
    
    // Check if onIssueSelect was called with the correct ID
    expect(onIssueSelectMock).toHaveBeenCalledWith(2);
  });
});
