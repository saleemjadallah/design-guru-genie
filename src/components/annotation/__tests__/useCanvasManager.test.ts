
import { renderHook, act } from "@testing-library/react";
import { useCanvasManager } from "../useCanvasManager";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

describe("useCanvasManager", () => {
  const mockImage = "test-image.jpg";
  const mockAnnotations = [{ id: 1, x: 100, y: 100 }];
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });
    
    // Mock createImageBitmap which is used by HTML Canvas
    global.createImageBitmap = jest.fn().mockResolvedValue({});
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useCanvasManager(mockImage, mockAnnotations));
    
    expect(result.current.scale).toBe(1);
    expect(result.current.imgLoaded).toBe(false);
    expect(result.current.imgError).toBe(false);
    expect(result.current.initialRender).toBe(true);
    expect(result.current.canvasWidth).toBe(0);
    expect(result.current.canvasHeight).toBe(0);
  });

  it("should set up refs correctly", () => {
    const { result } = renderHook(() => useCanvasManager(mockImage, mockAnnotations));
    
    expect(result.current.canvasRef.current).toBe(null);
    expect(result.current.containerRef.current).toBe(null);
    expect(result.current.imageRef.current).toBe(null);
  });

  it("should handle image loading success", () => {
    // Create a mock for Image
    const originalImage = global.Image;
    const mockImageInstance = {
      onload: null,
      onerror: null,
      src: "",
      width: 800,
      height: 600,
      complete: true,
      naturalWidth: 800
    };
    
    global.Image = jest.fn(() => mockImageInstance as any);
    
    const { result } = renderHook(() => useCanvasManager(mockImage, mockAnnotations));
    
    // Call loadImage
    act(() => {
      result.current.loadImage();
    });
    
    // Trigger onload
    act(() => {
      if (mockImageInstance.onload) {
        mockImageInstance.onload(new Event('load') as any);
      }
    });
    
    expect(result.current.imgLoaded).toBe(true);
    expect(result.current.imgError).toBe(false);
    
    // Restore original Image constructor
    global.Image = originalImage;
  });

  it("should handle image loading error", () => {
    // Create a mock for Image
    const originalImage = global.Image;
    const mockImageInstance = {
      onload: null,
      onerror: null,
      src: "",
      complete: true,
      naturalWidth: 0
    };
    
    global.Image = jest.fn(() => mockImageInstance as any);
    
    const { result } = renderHook(() => useCanvasManager(mockImage, mockAnnotations));
    
    // Call loadImage
    act(() => {
      result.current.loadImage();
    });
    
    // Trigger onerror
    act(() => {
      if (mockImageInstance.onerror) {
        mockImageInstance.onerror(new Event('error') as any);
      }
    });
    
    expect(result.current.imgLoaded).toBe(false);
    expect(result.current.imgError).toBe(true);
    
    // Restore original Image constructor
    global.Image = originalImage;
  });

  it("should update scale when container resizes", () => {
    // Mock the refs
    const mockCanvasRef = { current: document.createElement('canvas') };
    const mockContainerRef = { current: document.createElement('div') };
    const mockImageRef = { current: new Image() };
    mockImageRef.current.width = 800;
    
    // Mock clientWidth
    Object.defineProperty(mockContainerRef.current, 'clientWidth', {
      value: 400
    });
    
    const { result } = renderHook(() => useCanvasManager(mockImage, mockAnnotations));
    
    // Set the refs
    result.current.canvasRef = mockCanvasRef as any;
    result.current.containerRef = mockContainerRef as any;
    result.current.imageRef = mockImageRef as any;
    
    // Call updateScale
    act(() => {
      const newScale = result.current.updateScale();
      expect(newScale).toBe(0.5); // 400 / 800 = 0.5
    });
  });
});
