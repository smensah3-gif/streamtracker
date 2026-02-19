import { tokenStore } from "./tokenStore";

const BASE_URL = "http://localhost:8000/api/v1";

async function request(path, options = {}) {
  const token = tokenStore.get();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeader, ...options.headers },
    ...options,
  });

  if (response.status === 204) return null;

  if (response.status === 401) {
    tokenStore.triggerUnauthorized();
    throw new Error("Session expired. Please log in again.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail ?? "Request failed");
  }
  return data;
}

// --- Auth ---
export const authApi = {
  register: (body) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  refresh: (refreshToken) =>
    request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
  me: () => request("/auth/me"),
};

// --- Platforms ---
export const platformsApi = {
  list: () => request("/platforms/"),
  create: (body) => request("/platforms/", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/platforms/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id) => request(`/platforms/${id}`, { method: "DELETE" }),
};

// --- Watchlist ---
export const watchlistApi = {
  list: (status) =>
    request(`/watchlist/${status ? `?status=${status}` : ""}`),
  create: (body) => request("/watchlist/", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/watchlist/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id) => request(`/watchlist/${id}`, { method: "DELETE" }),
};

// --- Insights ---
export const insightsApi = {
  get: () => request("/insights/"),
};

// --- Discovery ---
export const discoveryApi = {
  get: () => request("/discovery/"),
};
