/**
 * Centralized Server Image URL Resolver for Roti Wala Web Frontend.
 *
 * Ensures all dish, category, and shop images load directly from the
 * production backend server (https://backend.alidarbar.in) over HTTPS,
 * preventing relative path 404s, Mixed Content blocking, and missing placeholder errors.
 */

// Production API host origin
export const BACKEND_SERVER_ORIGIN = "https://backend.alidarbar.in";

/**
 * Returns a fully qualified, HTTPS server-side image URL.
 *
 * @param {string} rawUrl - Raw image path or URL from backend API
 * @returns {string} Fully qualified HTTPS image URL
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

  // Handle relative paths (e.g. /media/menu_items/... or media/menu_items/...)
  if (url.startsWith("/")) {
    url = `${BACKEND_SERVER_ORIGIN}${url}`;
  } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `${BACKEND_SERVER_ORIGIN}/${url}`;
  }

  // Map any local/test hostnames to production server origin
  if (
    url.includes("127.0.0.1:8000") ||
    url.includes("localhost:8000") ||
    url.includes("testserver")
  ) {
    url = url
      .replace(/https?:\/\/127\.0\.0\.1:8000/i, BACKEND_SERVER_ORIGIN)
      .replace(/https?:\/\/localhost:8000/i, BACKEND_SERVER_ORIGIN)
      .replace(/https?:\/\/testserver/i, BACKEND_SERVER_ORIGIN);
  }

  // Always enforce HTTPS to prevent browser Mixed Content blocking
  if (url.startsWith("http://")) {
    url = url.replace(/^http:\/\//i, "https://");
  }

  return url;
};
