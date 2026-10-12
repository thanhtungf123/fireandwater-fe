"use client";

const API = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"
).replace(/\/$/, "");

const TOKEN_KEY = "wf_admin_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API}/api${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    throw new ApiError(401, "unauthorized");
  }
  if (!res.ok) {
    let code = `http_${res.status}`;
    try {
      code = (await res.json()).error || code;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, code);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---- Auth ----
export async function login(username: string, password: string) {
  const data = await request<{ token: string; user: { username: string } }>(
    "/admin/login",
    { method: "POST", body: JSON.stringify({ username, password }) }
  );
  setToken(data.token);
  return data.user;
}
export const fetchMe = () => request<{ user: { username: string } }>("/admin/me");

// ---- Games ----
export interface AdminGame {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  iframeUrl: string;
  frameWidth?: number;
  frameHeight?: number;
  group: "lua-va-nuoc" | "tuong-tu";
  order: number;
  status: "draft" | "published" | "hidden";
  seoContentHtml?: string;
  seo?: {
    title?: string;
    metaDescription?: string;
    canonical?: string;
    robots?: "index" | "noindex";
    ogImage?: string;
  };
  related?: { mode: "manual" | "auto"; limit: number; gameIds: string[] };
}

export const listGames = (params = "") =>
  request<AdminGame[]>(`/admin/games${params}`);
export const getGame = (id: string) => request<AdminGame>(`/admin/games/${id}`);
export const createGame = (data: Partial<AdminGame>) =>
  request<AdminGame>("/admin/games", { method: "POST", body: JSON.stringify(data) });
export const updateGame = (id: string, data: Partial<AdminGame>) =>
  request<AdminGame>(`/admin/games/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteGame = (id: string) =>
  request<{ ok: true }>(`/admin/games/${id}`, { method: "DELETE" });
export const reorderGames = (ids: string[]) =>
  request<{ ok: true }>("/admin/games/reorder", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });

// ---- Settings ----
export interface SiteLink {
  label: string;
  url: string;
}
export interface AdminSettings {
  homeDefaultGameId?: string;
  homeH1?: string;
  homeSeoContentHtml?: string;
  homeRelated?: { mode: "manual" | "auto"; limit: number; gameIds: string[] };
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  // Appearance
  headerTitle?: string;
  logoUrl?: string;
  faviconUrl?: string;
  footerText?: string;
  footerLinks?: SiteLink[];
  headerLinks?: SiteLink[];
}
export const getSettings = () => request<AdminSettings>("/admin/settings");
export const updateSettings = (data: AdminSettings) =>
  request<AdminSettings>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });

// ---- Static pages ----
export interface AdminPage {
  _id?: string;
  slug: string;
  title: string; // H1 / display title
  headerLabel?: string;
  showInHeader?: boolean;
  headerOrder?: number;
  contentHtml?: string;
  status: "published" | "hidden";
  seo?: AdminGame["seo"];
}
export const listPages = () => request<AdminPage[]>("/admin/pages");
export const createPage = (data: Partial<AdminPage>) =>
  request<AdminPage>("/admin/pages", { method: "POST", body: JSON.stringify(data) });
export const updatePage = (slug: string, data: Partial<AdminPage>) =>
  request<AdminPage>(`/admin/pages/${slug}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deletePage = (slug: string) =>
  request<{ ok: true }>(`/admin/pages/${slug}`, { method: "DELETE" });
export const reorderPages = (slugs: string[]) =>
  request<{ ok: true }>("/admin/pages/reorder", {
    method: "PUT",
    body: JSON.stringify({ slugs }),
  });

// ---- Upload ----
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const data = await request<{ url: string }>("/admin/upload", {
    method: "POST",
    body: fd,
  });
  return data.url;
}
