import type { IGame } from "@/types/game";

/**
 * Server-side API client. The frontend never touches MongoDB directly — it
 * fetches from the backend service. Used inside Server Components so pages are
 * still fully server-rendered (good for SEO).
 */
const API_URL = (process.env.BACKEND_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

export interface GameDTO {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  iframeUrl: string;
  frameWidth: number;
  frameHeight: number;
  group: "lua-va-nuoc" | "tuong-tu";
  order: number;
  seoContentHtml?: string;
  seo?: IGame["seo"];
}

export interface HomePayload {
  h1: string;
  seo: { title?: string; description?: string; ogImage?: string };
  seoContentHtml: string | null;
  defaultGame: GameDTO | null;
  mainGames: GameDTO[];
  related: GameDTO[];
}

export interface GamePagePayload {
  game: GameDTO;
  mainGames: GameDTO[];
  related: GameDTO[];
}

export interface StaticPagePayload {
  slug: string;
  title: string;
  contentHtml: string | null;
  seo: IGame["seo"] | null;
}

export interface SitemapData {
  games: { slug: string; updatedAt: string }[];
  pages: { slug: string; updatedAt: string }[];
}

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, {
      // Always fresh — content is managed in Admin and must reflect quickly.
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    console.error("API request failed:", path, err);
    return null;
  }
}

export const getHome = () => apiGet<HomePayload>("/home");
export const getGamePage = (slug: string) =>
  apiGet<GamePagePayload>(`/games/${encodeURIComponent(slug)}`);
export const getStaticPage = (slug: string) =>
  apiGet<StaticPagePayload>(`/pages/${encodeURIComponent(slug)}`);
export const getMainGames = () => apiGet<GameDTO[]>("/games?group=lua-va-nuoc");
export const getSitemapData = () => apiGet<SitemapData>("/sitemap");

export interface SiteChrome {
  headerTitle: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  footerText: string | null;
  footerLinks: { label: string; url: string }[];
  headerLinks: { label: string; url: string }[];
  headerPages: { slug: string; label: string }[];
}
export const getSiteChrome = () => apiGet<SiteChrome>("/site-chrome");
export const getRedirect = (slug: string) =>
  apiGet<{ to: string }>(`/redirects/${encodeURIComponent(slug)}`);
