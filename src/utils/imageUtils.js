/**
 * Centralized Server Image URL Resolver for Roti Wala Frontend.
 *
 * Automatically resolves image paths based on current environment:
 * - When running locally (127.0.0.1:8000 or localhost), points to local backend.
 * - When running in production, points to production backend (backend.alidarbar.in).
 */

export const getBackendOrigin = () => {
  const apiUrl = import.meta.env?.VITE_API_URL || "";
  if (apiUrl) {
    try {
      if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
        const parsed = new URL(apiUrl);
        return parsed.origin;
      }
    } catch {
      // ignore
    }
  }

  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://127.0.0.1:8000";
  }

  return "https://backend.alidarbar.in";
};

export const BACKEND_SERVER_ORIGIN = getBackendOrigin();

/**
 * Returns a fully qualified server-side image URL.
 *
 * @param {string} rawUrl - Raw image path or URL from backend API
 * @returns {string} Fully qualified image URL
 */
export const getServerImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  let url = rawUrl.trim();

  // If Markdown link format [url](url)
  const mdMatch = url.match(/\]\((https?:\/\/[^)]+)\)/);
  if (mdMatch) {
    url = mdMatch[1];
  }

  const backendOrigin = getBackendOrigin();

  // If already absolute URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Handle relative paths (e.g. /media/menu_items/... or media/menu_items/...)
  if (url.startsWith("/")) {
    return `${backendOrigin}${url}`;
  }

  return `${backendOrigin}/${url}`;
};
