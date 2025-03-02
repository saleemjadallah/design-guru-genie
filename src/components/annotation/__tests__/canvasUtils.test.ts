
import { drawCanvas, handleCanvasClick } from "../canvasUtils";
import { Annotation } from "../types";

describe("canvasUtils", () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let imageRef: HTMLImageElement;

  beforeEach(() => {
    // Set up canvas
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    // Mock the context methods
    ctx.clearRect = jest.fn();
    ctx.drawImage = jest.fn();
    ctx.beginPath = jest.fn();
    ctx.stroke = jest.fn();
    ctx.fill = jest.fn();
    ctx.arc = jest.fn();
    ctx.moveTo = jest.fn();
    ctx.lineTo = jest.fn();
    ctx.save = jest.fn();
    ctx.restore = jest.fn();
    ctx.fillText = jest.fn();
    
    // Create image reference
    imageRef = new Image();
  });

  describe("drawCanvas", () => {
    it("should not draw when context, canvas or image is missing", () => {
      const annotations: Annotation[] = [];
      
      // Test with null context
      drawCanvas(null as any, canvas, imageRef, annotations, null, 1);
      expect(ctx.clearRect).not.toHaveBeenCalled();
      
      // Test with null canvas
      drawCanvas(ctx, null as any, imageRef, annotations, null, 1);
      expect(ctx.clearRect).not.toHaveBeenCalled();
      
      // Test with null image
      drawCanvas(ctx, canvas, null as any, annotations, null, 1);
      expect(ctx.clearRect).not.toHaveBeenCalled();
    });

    it("should clear the canvas and draw the image", () => {
      const annotations: Annotation[] = [];
      
      drawCanvas(ctx, canvas, imageRef, annotations, null, 1);
      
      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
      expect(ctx.drawImage).toHaveBeenCalledWith(imageRef, 0, 0, canvas.width, canvas.height);
    });

    it("should draw annotations with correct styles based on priority", () => {
      const annotations: Annotation[] = [
        { id: 1, x: 100, y: 100, priority: "high" },
        { id: 2, x: 200, y: 200, priority: "medium" },
        { id: 3, x: 300, y: 300, priority: "low" }
      ];
      
      drawCanvas(ctx, canvas, imageRef, annotations, null, 1);
      
      // Should have called beginPath 2 times for each annotation (line + marker)
      expect(ctx.beginPath).toHaveBeenCalledTimes(6);
      
      // Should have called moveTo once for each annotation
      expect(ctx.moveTo).toHaveBeenCalledTimes(3);
      
      // Should have called lineTo once for each annotation
      expect(ctx.lineTo).toHaveBeenCalledTimes(3);
      
      // Should have drawn 3 arcs for the markers
      expect(ctx.arc).toHaveBeenCalledTimes(3);
      
      // Should have filled the text for each annotation
      expect(ctx.fillText).toHaveBeenCalledTimes(3);
    });

    it("should highlight the selected annotation", () => {
      const annotations: Annotation[] = [
        { id: 1, x: 100, y: 100, priority: "high" },
        { id: 2, x: 200, y: 200, priority: "medium" }
      ];
      
      // Set annotation 1 as selected
      drawCanvas(ctx, canvas, imageRef, annotations, 1, 1);
      
      // Should have styled the selected annotation differently
      expect(ctx.strokeStyle).toEqual("white");
      expect(ctx.lineWidth).toEqual(2);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it("should use displayNumberMap to show custom numbers", () => {
      const annotations: Annotation[] = [
        { id: 1, x: 100, y: 100 },
        { id: 2, x: 200, y: 200 }
      ];
      
      const displayNumberMap = new Map<number, number>();
      displayNumberMap.set(1, 5);
      displayNumberMap.set(2, 10);
      
      drawCanvas(ctx, canvas, imageRef, annotations, null, 1, displayNumberMap);
      
      // Should have called fillText with the mapped numbers
      expect(ctx.fillText).toHaveBeenCalledWith("5", expect.any(Number), expect.any(Number));
      expect(ctx.fillText).toHaveBeenCalledWith("10", expect.any(Number), expect.any(Number));
    });
  });

  describe("handleCanvasClick", () => {
    it("should do nothing if onIssueSelect or canvas is missing", () => {
      const annotations: Annotation[] = [
        { id: 1, x: 100, y: 100 }
      ];
      
      const mockEvent = {
        clientX: 100,
        clientY: 100
      } as React.MouseEvent<HTMLCanvasElement>;
      
      // Test with null onIssueSelect
      const onIssueSelectSpy = jest.fn();
      handleCanvasClick(mockEvent, canvas, annotations, 1, null);
      expect(onIssueSelectSpy).not.toHaveBeenCalled();
      
      // Test with null canvas
      handleCanvasClick(mockEvent, null, annotations, 1, onIssueSelectSpy);
      expect(onIssueSelectSpy).not.toHaveBeenCalled();
    });

    it("should call onIssueSelect with annotation id when clicking on a marker", () => {
      const annotations: Annotation[] = [
        { id: 1, x: 100, y: 100 }
      ];
      
      // Mock getBoundingClientRect to return a simple rect
      canvas.getBoundingClientRect = jest.fn().mockReturnValue({
        left: 0,
        top: 0
      });
      
      const onIssueSelectSpy = jest.fn();
      
      // Calculate where the marker should be based on the formula in canvasUtils
      const offset = 30;
      const angle = Math.PI / 4;
      const markerX = 100 + Math.cos(angle) * offset;
      const markerY = 100 - Math.sin(angle) * offset;
      
      const mockEvent = {
        clientX: markerX,
        clientY: markerY
      } as React.MouseEvent<HTMLCanvasElement>;
      
      handleCanvasClick(mockEvent, canvas, annotations, 1, onIssueSelectSpy);
      
      // Should call onIssueSelect with the annotation id
      expect(onIssueSelectSpy).toHaveBeenCalledWith(1);
    });

    it("should call onIssueSelect with null when clicking away from markers", () => {
      const annotations: Annotation[] = [
        { id: 1, x: 100, y: 100 }
      ];
      
      // Mock getBoundingClientRect to return a simple rect
      canvas.getBoundingClientRect = jest.fn().mockReturnValue({
        left: 0,
        top: 0
      });
      
      const onIssueSelectSpy = jest.fn();
      
      // Click far away from any annotation
      const mockEvent = {
        clientX: 500,
        clientY: 500
      } as React.MouseEvent<HTMLCanvasElement>;
      
      handleCanvasClick(mockEvent, canvas, annotations, 1, onIssueSelectSpy);
      
      // Should call onIssueSelect with null
      expect(onIssueSelectSpy).toHaveBeenCalledWith(null);
    });
  });
});
