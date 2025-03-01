
import { ScreenshotFile, UploadStep } from "./types";

// Initial state values
export const initialState = {
  screenshots: [] as ScreenshotFile[],
  step: "upload" as UploadStep,
  combinedImage: null as string | null,
  processingStage: 0,
  activeScreenshot: null as string | null,
};

export type MultiUploadState = typeof initialState;
