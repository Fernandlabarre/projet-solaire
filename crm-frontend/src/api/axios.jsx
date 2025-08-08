// src/api/axios.jsx
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // <- plus "localhost"
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// 👉 initialise l’Authorization dès le chargement du module
const saved = localStorage.getItem("token");
if (saved) setAuthToken(saved);

export default api;
