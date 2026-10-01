import axios from "axios";

export const TOKEN_KEY = "shikha_token";

// In dev, requests go through the Vite proxy (/api -> localhost:5000).
// In production builds, point VITE_API_URL at the deployed backend,
// e.g. VITE_API_URL=https://shikha-backend.up.railway.app
const rawApiUrl = import.meta.env.VITE_API_URL || "/api";

// Ensure the base URL always points at the API root: if a full origin is
// provided without the /api suffix, append it so requests hit the backend
// routes (e.g. https://host/api/auth/login instead of https://host/auth/login).
const API_URL = rawApiUrl.endsWith("/api")
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/$/, "")}/api`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  // No global Content-Type: axios sets application/json automatically for
  // JSON bodies, and leaving it unset lets the browser attach the correct
  // multipart boundary when posting FormData (file uploads).
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export interface ApiErrorShape {
  success: boolean;
  message: string;
  code?: string;
  errors?: { field: string; message: string }[];
  requestId?: string;
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorShape | undefined;

    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join(", ");
    }

    if (data?.message) {
      return data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

export const isApiError = (error: unknown): error is { response: { data: ApiErrorShape } } =>
  axios.isAxiosError(error) && Boolean(error.response?.data);
