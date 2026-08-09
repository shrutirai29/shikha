import axios from "axios";

export const TOKEN_KEY = "shikha_token";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
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
