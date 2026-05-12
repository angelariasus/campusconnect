import { getApiBase } from "./config.js";
import { getToken, clearSession } from "./state.js";

const parseJsonSafely = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { message: text };
  }
};

export const apiFetch = async (path, options = {}) => {
  const url = `${getApiBase()}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    clearSession();
  }

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message = data?.message || "Error al consumir API.";
    throw new Error(message);
  }

  return data;
};

export const downloadFile = async (path) => {
  const url = `${getApiBase()}${path}`;
  const token = getToken();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await parseJsonSafely(response);
    throw new Error(data?.message || "Error al descargar archivo.");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition") || "";
  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  const filename = match ? match[1] : "material";

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
};
