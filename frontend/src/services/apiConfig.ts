export const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const getApiUrl = (endpoint: string): string => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};
