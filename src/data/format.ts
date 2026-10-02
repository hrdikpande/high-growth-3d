import type { Locale } from "./i18n";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return rupees.format(value);
}

export function formatWeight(value: number, unit: "G" | "KG", lang: Locale): string {
  if (lang === "hi") return `${value} ${unit === "KG" ? "कि.ग्रा." : "ग्रा."}`;
  return `${value} ${unit === "KG" ? "kg" : "g"}`;
}

export function savingsPercent(mrp: number, price: number): number | null {
  if (mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

/** Paragraphs, "- " lists, **bold** and *italic*. Enough for product copy. */
export function richText(source: string): string {
  return source
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- "))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join("")}</ul>`;
      }
      return `<p>${inline(lines.join(" "))}</p>`;
    })
    .join("");
}
