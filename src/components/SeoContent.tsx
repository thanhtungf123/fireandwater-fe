import { sanitizeRichText } from "@/lib/sanitize";

/**
 * Single rich-text SEO block (spec §3 khối 06, §4 khu vực 6).
 * Renders nothing when empty — never outputs an empty block.
 */
export default function SeoContent({ html }: { html?: string }) {
  if (!html || !html.trim()) return null;
  const clean = sanitizeRichText(html);
  if (!clean.trim()) return null;

  return (
    <section
      className="seo-content prose prose-gray mt-10 max-w-none"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
