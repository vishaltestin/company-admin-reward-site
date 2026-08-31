import axios from "axios"
import Cookies from "js-cookie"
import { useAuthStore } from "@/store/useAuthStore"

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 419) {
      useAuthStore.getState().clearUser()
      const loginPath = `${import.meta.env.BASE_URL}login`
      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath
      }
    }
    return Promise.reject(error)
  }
)

type ApiErrorResponse = {
  message?: string
  errors?: Record<string, string[]>
}

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data
    return (
      data?.message ||
      Object.values(data?.errors ?? {})[0]?.[0] ||
      error.message ||
      "Something went wrong."
    )
  }

  return "Something went wrong."
}
