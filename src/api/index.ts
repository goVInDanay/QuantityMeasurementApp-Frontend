import type { QuantityDTO, CompareRequest, HistoryItem, User } from "../types";

const API_BASE = "https://apigateway-mxaf.onrender.com";

const defaultOpts: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

export async function loginApi(
  email: string,
  password: string,
): Promise<Response> {
  return fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    credentials: "include", // 🔥 FIX
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}
export async function registerApi(
  name: string,
  email: string,
  password: string,
  mobile: string,
): Promise<Response> {
  return fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    credentials: "include", // 🔥 ADD THIS
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, mobile }),
  });
}

export async function logoutApi(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    ...defaultOpts,
    method: "POST",
  });
}

export const googleLoginUrl = `https://quantitymeasurmentapp.onrender.com/oauth2/authorization/google`;

export async function getUserProfile(): Promise<User | null> {
  const res = await fetch(`${API_BASE}/api/users/profile`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function convertApi(
  quantity: QuantityDTO,
  targetUnit: string,
): Promise<QuantityDTO> {
  const res = await fetch(
    `${API_BASE}/api/quantity/convert?targetUnit=${targetUnit}`,
    {
      ...defaultOpts,
      method: "POST",
      body: JSON.stringify(quantity),
    },
  );
  if (!res.ok) throw new Error("Conversion failed");
  return res.json();
}

export async function addApi(req: CompareRequest): Promise<QuantityDTO> {
  const res = await fetch(`${API_BASE}/api/quantity/add`, {
    ...defaultOpts,
    method: "POST",
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("Add failed");
  return res.json();
}

export async function subtractApi(req: CompareRequest): Promise<QuantityDTO> {
  const res = await fetch(`${API_BASE}/api/quantity/subtract`, {
    ...defaultOpts,
    method: "POST",
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("Subtract failed");
  return res.json();
}

export async function divideApi(req: CompareRequest): Promise<number> {
  const res = await fetch(`${API_BASE}/api/quantity/divide`, {
    ...defaultOpts,
    method: "POST",
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("Divide failed");
  return res.json();
}

export async function compareApi(req: CompareRequest): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/quantity/compare`, {
    ...defaultOpts,
    method: "POST",
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("Compare failed");
  return res.json();
}

export async function getHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE}/api/history`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) return [];
  return res.json();
}
