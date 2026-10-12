import { absoluteUrl } from "./site";

/**
 * Domains allowed to be embedded in an iframe (spec §7).
 * The Admin can extend this via the AllowedIframeDomain collection, but we
 * keep a hard-coded baseline so the public site never embeds arbitrary hosts.
 */
export const BASELINE_ALLOWED_IFRAME_HOSTS = [
  "html5.gamedistribution.com",
  "gamedistribution.com",
  "www.gameflare.com",
  "gameflare.com",
  "html5.gamemonetize.co",
  "html5.gamemonetize.com",
];

export function isAllowedIframeUrl(
  url: string,
  extraHosts: string[] = []
): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const allowed = new Set([
      ...BASELINE_ALLOWED_IFRAME_HOSTS,
      ...extraHosts.map((h) => h.toLowerCase()),
    ]);
    return allowed.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Build the final iframe src for a game, attaching gd_sdk_referrer_url.
 *
 * IMPORTANT (GameDistribution): the referrer MUST be the exact page URL where
 * the iframe is actually embedded — not just the game's own page. On the
 * homepage that is the site root ("" -> "/"); on a game page it is that slug.
 * A mismatch can trigger GameDistribution's "not available here" interstitial.
 */
export function buildIframeSrc(baseUrl: string, pagePath: string): string {
  try {
    const u = new URL(baseUrl);
    if (u.hostname.toLowerCase() === "html5.gamedistribution.com") {
      u.searchParams.set("gd_sdk_referrer_url", absoluteUrl(pagePath));
    }
    return u.toString();
  } catch {
    return baseUrl;
  }
}
