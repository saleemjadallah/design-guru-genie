
export const validateUrl = (inputUrl: string): { isValid: boolean; error: string | null } => {
  if (!inputUrl) {
    return { isValid: false, error: "URL is required" };
  }
  
  // Add protocol if missing
  const normalizedUrl = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;
  
  try {
    const parsed = new URL(normalizedUrl);
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { isValid: false, error: "Please enter a valid website URL" };
    }
    return { isValid: true, error: null };
  } catch (e) {
    return { isValid: false, error: "Please enter a valid website URL" };
  }
};

export const normalizeUrl = (url: string): string => {
  return url.startsWith('http') ? url : `https://${url}`;
};

export const createPlaceholderSvg = (websiteUrl: string) => {
  const encodedUrl = encodeURIComponent(websiteUrl);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="white"/><text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="black">Website Analysis: ${encodedUrl}</text></svg>`;
};
