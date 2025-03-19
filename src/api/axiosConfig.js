import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-cac    he",
    Pragma: "no-cache",
    Expires: "0",
  },
});

export default api;
