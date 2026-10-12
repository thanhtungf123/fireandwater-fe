/** Shared public types mirrored from the backend API responses. */
export interface SeoFields {
  title?: string;
  metaDescription?: string;
  canonical?: string;
  robots?: "index" | "noindex";
  ogImage?: string;
}

export interface IGame {
  seo?: SeoFields;
}
