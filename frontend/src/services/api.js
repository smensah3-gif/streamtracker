const BASE_URL = "http://localhost:8000/api/v1";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail ?? "Request failed");
  }
  return data;
}

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
