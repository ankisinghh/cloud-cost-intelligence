import axios from "axios";

export const api = axios.create({
  baseURL:
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5001",
  withCredentials: true,
});

let unauthorizedHandler: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export function clearUnauthorizedHandler() {
  unauthorizedHandler = null;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);