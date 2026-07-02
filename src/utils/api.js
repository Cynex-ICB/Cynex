export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://route.cynexicb.com/api";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function resolveApiAssetUrl(url = "") {
  if (!url) {
    return "";
  }

  return /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url}`;
}

export async function downloadApiFile(url, token, fallbackName = "download") {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      throw new Error(data.message || "Could not download file.");
    }

    throw new Error("Could not download file.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
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
