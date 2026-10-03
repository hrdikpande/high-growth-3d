import * as THREE from "three";
import gsap from "gsap";
import { engine, clamp, rand, ndcToWorld, elementToWorld } from "../engine";
import { loadImage } from "../jar";
import { Bee, loadBeeTemplate } from "../bee";
import { BannerBee } from "../banner";
import { companionSize, viewportRegion, renderJarShots, pointerSmooth } from "../common";

/**
 * Inner pages share one companion: she flies in, roams the margins doing
 * tricks, and leaves a dotted trail while you scroll. Each page adds a beat:
 *  - catalogue: jar renders for the cards; she perches on the card you hover
 *  - about:     she flies down the timeline with your scroll
 *  - contact:   she sits on the form while you type
 * plus a banner bee carrying a line for that page.
 */
export async function run(config: { scene: string; lang: string; data: any; banners: Record<string, string> }) {
  const scene = config.scene;
  const [tpl, photo] = await Promise.all([
    loadBeeTemplate(),
    scene === "catalogue" ? loadImage("/images/honey-jar.webp").catch(() => null) : Promise.resolve(null),
  ]);

  if (scene === "catalogue") {
    const colors: Record<string, { color: string; label: string }> = {};
    for (const p of config.data.products ?? []) colors[p.slug] = { color: p.color, label: p.label };
    renderJarShots(photo, colors);
  }

  const bee = new Bee(tpl, engine.scene).withTrail(engine.scene);
  const size = () => companionSize() * 0.85;
  // Keep to the upper-right and margins so she rarely sits over body text.
  const roam = viewportRegion(-1, 1.4, 0.82, 0.55, 0.2);

  const bannerText =
    scene === "about" ? config.banners.since : scene === "contact" ? config.banners.bulk : config.banners.marketplace;
  let banner: BannerBee | null = null;
  BannerBee.create(bannerText, config.lang).then((b) => {
    banner = b;
    gsap.delayedCall(2.5, () => b.fly(engine.view.mobile ? 0.8 : 0.62, 0.4, -1, 8));
  });

  let token = 0;

  /* ---------- Catalogue: perch on the hovered card ---------- */
  if (scene === "catalogue" && !engine.view.mobile) {
    document.querySelectorAll<HTMLElement>(".card").forEach((card) => {
      card.addEventListener("pointerenter", () => {
        const my = ++token;
        bee.land(() => elementToWorld(card, 0.72, 0, 0.3), size() * 0.55, 1.4).then(() => {
          if (my !== token) bee.takeOff(size(), roam);
        });
      });
      card.addEventListener("pointerleave", () => {
        const my = ++token;
        gsap.delayedCall(0.3, () => {
          if (my === token && (bee.mode === "perched" || bee.mode === "scripted")) bee.takeOff(size(), roam);
        });
      });
    });
  }

  /* ---------- About: follow the timeline ---------- */
  const timeline = document.querySelector<HTMLElement>("[data-timeline] .timeline");
  const dots = [...document.querySelectorAll<HTMLElement>("[data-tl-dot]")];
  let onTimeline = false;
  const timelineProgress = () => {
    const r = timeline!.getBoundingClientRect();
    return clamp((engine.view.h * 0.55 - r.top) / r.height, 0, 1);
  };
  const timelinePoint = () => {
    const pts = dots.map((d) => elementToWorld(d, 0.5, 0.5, 0.6));
    const p = new THREE.CatmullRomCurve3(pts, false, "centripetal").getPointAt(timelineProgress());
    p.x += bee.size * 0.7;
    return p;
  };

  /* ---------- Contact: sit on the form while typing ---------- */
  const form = document.querySelector<HTMLElement>("[data-enquiry]");
  if (form && !engine.view.mobile) {
    form.addEventListener("focusin", () => {
      if (bee.mode === "perched") return;
      const my = ++token;
      bee.land(() => elementToWorld(form, 0.9, 0, 0.3), size() * 0.6, 1.8).then(() => {
        if (my !== token) bee.takeOff(size(), roam);
      });
    });
    form.addEventListener("focusout", () => {
      gsap.delayedCall(0.2, () => {
        if (!form.contains(document.activeElement)) {
          token++;
          if (bee.mode === "perched") bee.takeOff(size(), roam);
        }
      });
    });
    form.addEventListener("submit", () => gsap.delayedCall(0.4, () => bee.doTrick("loop")));
  }

  engine.ticks.add((dt, t) => {
    if (timeline && dots.length > 1) {
      const r = timeline.getBoundingClientRect();
      const inView = r.top < engine.view.h * 0.6 && r.bottom > engine.view.h * 0.3;
      if (inView && !onTimeline && bee.mode !== "perched") {
        onTimeline = true;
        bee.chase(timelinePoint, 10);
        bee.trailAlways = true;
      } else if (!inView && onTimeline) {
        onTimeline = false;
        bee.trailAlways = false;
        bee.wander(roam);
      }
    }
    bee.update(dt, t, pointerSmooth);
    banner?.update(dt, t);
  });

  // Entrance.
  bee.size = size();
  bee.pos.copy(ndcToWorld(-1.3, 0.5, 0.4));
  if (engine.reduceMotion) {
    bee.pos.copy(ndcToWorld(0.7, 0.55));
    bee.mode = "scripted";
    return;
  }
  bee.mode = "scripted";
  gsap.to(bee.pos, {
    x: ndcToWorld(0.55, 0.4).x,
    y: ndcToWorld(0.55, 0.4).y,
    duration: 2,
    ease: "power3.out",
    onComplete: () => {
      bee.wander(roam);
      gsap.delayedCall(rand(1, 2), () => bee.doTrick("roll"));
    },
  });
}
