/** Canonical site URL used for absolute links, canonical tags, sitemap. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "Lửa và Nước";

/** Build an absolute, trailing-slash path on the public site. */
export function absoluteUrl(path: string): string {
  const clean = "/" + path.replace(/^\/+/, "").replace(/\/+$/, "");
  const withSlash = clean === "/" ? "/" : clean + "/";
  return SITE_URL + withSlash;
}
