import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize owner-authored rich text before rendering (spec §7: "escape dữ liệu
 * xuất HTML"). Allows the formatting the editor produces (headings, lists,
 * tables, links, images) but strips scripts and event handlers.
 */
export function sanitizeRichText(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h2", "h3", "h4", "p", "br", "hr", "strong", "em", "u", "s",
      "ul", "ol", "li", "blockquote", "a", "img",
      "table", "thead", "tbody", "tr", "th", "td", "span", "div",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt", "width", "height", "colspan", "rowspan"],
    ALLOW_DATA_ATTR: false,
  });
}
