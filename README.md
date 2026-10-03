# High Growth Honey

Showcase site for High Growth Honey, an Indian raw honey brand established in 1992.
English (`/en/`) and Hindi (`/hi/`). No cart: every product links out to Amazon or Flipkart.

- Static site built with [Astro](https://astro.build)
- 3D layer with three.js: a procedural jar (the real label wrapped on the front, recoloured per flavour on the GPU), a rigged honey bee, banner-towing bees, a dotted flight trail
- Scroll story driven by Lenis + a custom scroll director, GSAP for timelines
- Self-hosted fonts (Instrument Serif, Inter, Mukta, Tiro Devanagari Hindi)

## Local development

Requires Node 22.12 or newer (`.nvmrc`).

```bash
npm install
npm run dev       # http://localhost:5179
npm run build     # outputs dist/
npm run preview   # serves dist/ locally
```

## Deploying to Netlify

Everything Netlify needs is in `netlify.toml` (build command, Node version, redirects, security headers, caching).

**Option A: from a Git repository (recommended)**

1. Put this folder in its own Git repository and push it to GitHub, GitLab or Bitbucket
2. In Netlify: *Add new site → Import an existing project*, pick the repository
3. Netlify reads `netlify.toml`, so the build settings fill themselves in (`npm run build`, publish `dist`)
4. Deploy

**Option B: Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
netlify deploy --build          # draft URL to check
netlify deploy --build --prod   # live
```

### After the first deploy

- **Enquiry form:** in Netlify, *Forms* should list a form named `enquiry` (detected from the built HTML). Add an email notification under *Forms → Settings → Form notifications*. Spam is filtered with a honeypot field.
- **Custom domain:** add it under *Domain management*, then update the domain in the two places listed below and redeploy.

## What `netlify.toml` does

| Area | Behaviour |
|---|---|
| Root URL | `/` redirects to `/hi/` for Hindi browsers, `/en/` for everyone else |
| Old/bare links | `/honeys/*`, `/about`, `/contact` redirect to the English pages |
| Missing pages | Served by `404.html` |
| Security | HSTS, no framing, nosniff, strict referrer, Content-Security-Policy (allows the WebAssembly model decoder and blob/data textures the 3D layer needs) |
| Caching | Hashed assets in `/_astro/` cached for a year; the model and product image cached for a month |

## Placeholders to replace before launch

Everything in this list was carried over from the earlier site or invented so the pages are populated. None of it should go live as is.

| What | Where |
|---|---|
| Domain `highgrowthhoney.com` | `site` in `astro.config.mjs`, and `public/robots.txt` |
| Prices, jar sizes, stock | `src/data/products.ts` |
| Amazon / Flipkart links (currently **search** pages, not real listings) | `marketplaceUrl()` in `src/data/products.ts` |
| Phone, email, address, social links, FSSAI licence number | `footer` in `src/data/content.ts` (both `en` and `hi`) |
| Team member names (shown as "Name to be added") | `about.team` in `src/data/content.ts` |
| "33+ years", apiary names and harvest months | `src/data/content.ts` |
| Hindi product descriptions (a first translation, needs a native-speaker review) | `src/data/products.ts` |
| Flavour label colours (picked by eye) | `label` per product in `src/data/products.ts` |

## Project layout

```
src/
  data/        content (en/hi), products, i18n helpers, formatting
  layouts/     Base.astro: head, fonts, header/footer, 3D canvas
  components/  Header, Footer, Logo, MarketButtons
  pages/       [lang]/ index, honeys, honeys/[slug], about, contact; 404; sitemap.xml
  scripts/
    site.ts          smooth scroll, header, reveals, filters, size picker, form
    stage/           the 3D layer (loaded after first paint)
      engine.ts      renderer, camera, DOM-to-world helpers
      jar.ts         procedural jar, cap face, neck tag, GPU label recolour
      bee.ts         bee model, flight physics, tricks, perching
      banner.ts      banner-towing bee
      trail.ts       dotted flight trail
      scenes/        home, product, other pages
  styles/global.css
public/
  models/bee.glb          meshopt-compressed bee
  images/honey-jar.webp   product photo (label source)
```

## Credits

Bee model: “Honey Bee” by Tony's Classics, [CC BY 4.0](https://sketchfab.com/3d-models/honey-bee-aaf957992c1142bb8e3ad52c457ab014). The licence requires this credit, which is shown in the site footer.
