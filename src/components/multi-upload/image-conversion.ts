
/**
 * Convert a data URL to a File object
 * @param dataUrl The data URL to convert
 * @param fileName The name to give the resulting file
 * @param fileType The MIME type for the file
 * @returns A File object created from the data URL
 */
export async function dataUrlToFile(
  dataUrl: string,
  fileName: string,
  fileType: string
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: fileType });
}

/**
 * Create a blob URL from a data URL
 * @param dataUrl The data URL to convert
 * @returns A blob URL
 */
export function dataUrlToBlobUrl(dataUrl: string): string {
  // Convert data URL to blob
  const byteString = atob(dataUrl.split(',')[1]);
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([ab], { type: mimeString });
  return URL.createObjectURL(blob);
}
