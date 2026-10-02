import Lenis from "lenis";
import { scroll } from "./scroll";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Smooth scroll ---------- */

export let lenis: Lenis | null = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", (l: Lenis) => {
    scroll.velocity = l.velocity;
  });
  const raf = (time: number) => {
    lenis!.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

// In-page anchors go through Lenis so the jump is smooth too.
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest('a[href*="#"]') as HTMLAnchorElement | null;
  if (!a || !lenis) return;
  const url = new URL(a.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const target = document.querySelector(url.hash);
  if (!target) return;
  e.preventDefault();
  lenis.scrollTo(target as HTMLElement, { offset: -60 });
});

/* ---------- Header ---------- */

const header = document.querySelector<HTMLElement>(".header");
if (header) {
  const startsLight = header.dataset.light === "true";
  let pastHero = !startsLight;
  const update = () => {
    const solid = pastHero || !startsLight;
    header.classList.toggle("is-solid", solid);
    header.classList.toggle("is-light", startsLight && !solid);
  };
  // A 1px sentinel at 55vh: once it leaves the top of the viewport the
  // header turns solid. No scroll listener needed.
  if (startsLight) {
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:55vh;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => {
      pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    }).observe(sentinel);
  }
  update();

  const btn = header.querySelector<HTMLButtonElement>(".menu-btn");
  const menu = header.querySelector<HTMLElement>(".mobile-nav");
  btn?.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? btn.dataset.close! : btn.dataset.open!;
    menu?.classList.toggle("is-open", open);
    header.classList.toggle("is-solid", open || pastHero || !startsLight);
  });
}

/* ---------- Reveal on scroll ---------- */

const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    }
  },
  { rootMargin: "0px 0px -10% 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- Count-up numbers ---------- */

const counter = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    counter.unobserve(entry.target);
    const el = entry.target as HTMLElement;
    const raw = el.dataset.count ?? "";
    const m = raw.match(/^(\d+)(.*)$/);
    if (!m || reduceMotion) continue;
    const end = Number(m[1]);
    const suffix = m[2];
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min((now - t0) / 1400, 1);
      el.textContent = `${Math.round(end * (1 - Math.pow(1 - k, 3)))}${suffix}`;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
});
document.querySelectorAll("[data-count]").forEach((el) => counter.observe(el));

/* ---------- Folder-shaped cards ---------- */

function folderPath(w: number, h: number) {
  const tab = 22;
  const r = 16;
  const s = 10;
  const f = 8;
  const tx = w * 0.5;
  const bx = w * 0.62;
  const top = tab;
  const bottom = h - tab;
  return [
    `M 0 ${top + r}`, `Q 0 ${top} ${r} ${top}`, `L ${tx - f} ${top}`, `Q ${tx} ${top} ${tx} ${top - f}`,
    `L ${tx} ${s}`, `Q ${tx} 0 ${tx + s} 0`, `L ${w - r} 0`, `Q ${w} 0 ${w} ${r}`,
    `L ${w} ${bottom - r}`, `Q ${w} ${bottom} ${w - r} ${bottom}`, `L ${bx + f} ${bottom}`,
    `Q ${bx} ${bottom} ${bx} ${bottom + f}`, `L ${bx} ${h - s}`, `Q ${bx} ${h} ${bx - s} ${h}`,
    `L ${r} ${h}`, `Q 0 ${h} 0 ${h - r}`, "Z",
  ].join(" ");
}

function shapeFolders() {
  document.querySelectorAll<HTMLElement>(".folder").forEach((el) => {
    const { offsetWidth: w, offsetHeight: h } = el;
    if (w && h) el.style.clipPath = `path("${folderPath(w, h)}")`;
  });
}
shapeFolders();
window.addEventListener("resize", shapeFolders);
document.fonts?.ready.then(shapeFolders);

/* ---------- Catalogue filters ---------- */

const catalogue = document.querySelector<HTMLElement>("[data-catalogue]");
if (catalogue) {
  const chips = catalogue.querySelectorAll<HTMLButtonElement>("[data-filter]");
  const cards = catalogue.querySelectorAll<HTMLElement>(".card");
  const count = catalogue.querySelector<HTMLElement>(".count")!;
  const pattern = catalogue.dataset.countPattern ?? "{shown} of {total}";
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      let shown = 0;
      cards.forEach((card) => {
        const show = f === "all" || card.dataset.type === f;
        card.hidden = !show;
        if (show) shown++;
      });
      count.textContent = pattern.replace("{shown}", String(shown)).replace("{total}", String(cards.length));
    }),
  );
}

/* ---------- Jar size picker ---------- */

const sizes = document.querySelector<HTMLElement>("[data-sizes]");
if (sizes) {
  const buttons = sizes.querySelectorAll<HTMLButtonElement>(".size");
  const price = sizes.querySelector<HTMLElement>("[data-price-out]")!;
  const mrp = sizes.querySelector<HTMLElement>("[data-mrp-out]")!;
  const save = sizes.querySelector<HTMLElement>("[data-save-out]")!;
  const stock = sizes.querySelector<HTMLElement>("[data-stock-out]")!;
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      price.textContent = b.dataset.price ?? "";
      mrp.textContent = b.dataset.mrp ?? "";
      save.textContent = b.dataset.save ? `${b.dataset.save}% ${save.dataset.off}` : "";
      stock.textContent = b.dataset.stock ?? "";
    }),
  );
}

/* ---------- Enquiry form ---------- */

const form = document.querySelector<HTMLFormElement>("[data-enquiry]");
if (form) {
  const errors = JSON.parse(form.dataset.errors ?? "{}");
  const status = form.querySelector<HTMLElement>(".form__status")!;
  const rules: Record<string, (v: string) => string> = {
    name: (v) => (v.trim().length >= 2 ? "" : errors.name),
    phone: (v) => (!v.trim() ? errors.phone : /^[\d\s+()-]{7,}$/.test(v) ? "" : errors.phoneFormat),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : errors.email),
    city: (v) => (v.trim().length >= 2 ? "" : errors.city),
    message: (v) => (v.trim().length >= 10 ? "" : errors.message),
  };
  const check = (input: HTMLInputElement | HTMLTextAreaElement) => {
    const rule = rules[input.dataset.rule ?? ""];
    if (!rule) return true;
    const msg = rule(input.value);
    const field = input.closest(".field")!;
    field.classList.toggle("has-error", !!msg);
    field.querySelector(".error")!.textContent = msg;
    input.setAttribute("aria-invalid", String(!!msg));
    return !msg;
  };
  form.querySelectorAll<HTMLInputElement>("[data-rule]").forEach((i) => i.addEventListener("blur", () => check(i)));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll<HTMLInputElement>("[data-rule]")];
    const ok = inputs.map(check).every(Boolean);
    if (!ok) {
      status.textContent = errors.check;
      inputs.find((i) => i.getAttribute("aria-invalid") === "true")?.focus();
      return;
    }
    const body = new URLSearchParams(new FormData(form) as any).toString();
    try {
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.textContent = form.dataset.thanks ?? "";
    } catch {
      // No form backend (e.g. local preview): fall back to the visitor's mail app.
      const data = Object.fromEntries(new FormData(form) as any);
      const lines = Object.entries(data)
        .filter(([k]) => !["form-name", "company_website"].includes(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      location.href = `mailto:enquiry@highgrowthhoney.com?subject=${encodeURIComponent("Enquiry")}&body=${encodeURIComponent(lines)}`;
    }
  });
}
