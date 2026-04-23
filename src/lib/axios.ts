import axios from "axios"
import Cookies from "js-cookie"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"

export const rootApi = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
})

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api/admin`,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
})


api.interceptors.request.use((config) => {
  const token = Cookies.get("XSRF-TOKEN")
  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token)
  }
  return config
})
