/**
 * Renders a JSON-LD structured-data block. Server-safe (no client JS).
 * Only declare facts we actually have — no fabricated ratings/play counts (§8).
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe inside a JSON-LD script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
