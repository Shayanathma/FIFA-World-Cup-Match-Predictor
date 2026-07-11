import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 30000,
});

export async function getTeams() {
  const response = await api.get("/teams");
  return response.data;
}

export async function predictMatch(teamA, teamB) {
  const response = await api.post("/predict", {
    team_a: teamA,
    team_b: teamB,
  });
  return response.data;
}

export function getApiBaseUrl() {
  return api.defaults.baseURL || "same origin";
}
