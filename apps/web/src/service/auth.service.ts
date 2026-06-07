export interface User {
  id: number;
  pseudo: string;
  email: string;
  createdAt: string;
}

interface ErrorBody {
  message?: string;
}

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

const BASE_URL = "http://localhost:8080/api";

async function request<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  const response = await fetch(BASE_URL + path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ErrorBody = await response.json().catch(() => ({ message: "Erreur réseau" }));
    throw new Error(error.message || "Erreur");
  }

  if (response.status === 204) return null;

  return response.json() as Promise<T>;
}

export function login(email: string, password: string): Promise<User | null> {
  return request<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(pseudo: string, email: string, password: string): Promise<User | null> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ pseudo, email, password }),
  });
}

export function logout(): Promise<null> {
  return request<never>("/auth/logout", { method: "POST" }) as Promise<null>;
}

export function me(): Promise<User | null> {
  return request<User>("/users/me");
}