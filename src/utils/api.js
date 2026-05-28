export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.cynexicb.com/api";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function resolveApiAssetUrl(url = "") {
  if (!url) {
    return "";
  }

  return /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url}`;
}

export async function readApiJson(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  }

  const body = await response.text();
  const preview = body.replace(/\s+/g, " ").trim().slice(0, 120);
  throw new Error(
    `Expected JSON from ${response.url}, but received ${contentType || "unknown content"}. ` +
      `Check VITE_API_URL and backend routes. Response preview: ${preview || "empty response"}`
  );
}
