import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/api";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * XML sitemap (spec §8): homepage + published games + indexable static pages,
 * sourced from the backend API. Never lists /tro-choi/ or /danh-muc/.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData();

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL + "/", changeFrequency: "daily", priority: 1 },
  ];

  for (const g of data?.games ?? []) {
    entries.push({
      url: absoluteUrl(g.slug),
      lastModified: g.updatedAt ? new Date(g.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const p of data?.pages ?? []) {
    entries.push({
      url: absoluteUrl(p.slug),
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.3,
    });
  }

  return entries;
}
