import type { APIRoute } from "astro";
import { LOCALES, href } from "../data/i18n";
import { PRODUCTS } from "../data/products";

/** Every public page in both languages, with hreflang alternates. */
export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL("https://highgrowthhoney.com");
  const paths = ["/", "/honeys", "/about", "/contact", ...PRODUCTS.map((p) => `/honeys/${p.slug}`)];

  const urls = paths
    .flatMap((path) =>
      LOCALES.map((lang) => {
        const alternates = LOCALES.map(
          (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${new URL(href(l, path), base).href}"/>`,
        ).join("\n");
        return `  <url>\n    <loc>${new URL(href(lang, path), base).href}</loc>\n${alternates}\n  </url>`;
      }),
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
