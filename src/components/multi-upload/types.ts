
export interface ScreenshotFile {
  id: string;
  file: File;
  preview: string;
  order: number;
  overlap: number; // Percentage of overlap with the next image (0-100)
}

export type UploadStep = "upload" | "arrange" | "preview" | "processing";
