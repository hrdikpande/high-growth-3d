import * as THREE from "three";
import gsap from "gsap";
import {
  engine,
  clamp,
  damp,
  lerp,
  ramp,
  rand,
  clientToNdc,
  ndcToWorld,
  halfAt,
  stickyProgress,
  elementToWorld,
} from "../engine";
import { createJar, loadImage, capWorldPoint, CAP_R, JAR_W } from "../jar";
import { Bee, loadBeeTemplate, yawFacing, YAW_CAMERA, type Region } from "../bee";
import { BannerBee } from "../banner";
import {
  createPlinth,
  slotOf,
  dropJar,
  heroBeeSize,
  companionSize,
  viewportRegion,
  renderBeeShots,
  pointerSmooth,
  capDiameter,
  type Slot,
  type JarMotion,
} from "../common";
import { lenis } from "../../site";

/**
 * Home page story, driven by scroll:
 *
 *  hero      the bee arrives, the jar drops onto the plinth, she circles it and
 *            lands on the cap, then loops: sit, roam beside the jar, land again
 *  lid       the jar floats down and tips toward the camera; the cap turns like
 *            a dial through four promises while the bee circles it
 *  varieties the jar spins and swoops toward the camera between honeys; its
 *            colour and neck tag change with each one
 *  claims    the jar sinks away; banner bees tow each claim across the screen
 *  route     the bee flies the apiary route, leaving a dotted trail
 *  finale    a jar drops onto a second plinth and the bee lands on it
 *
 * Between sections she swoops right up to the camera and back.
 */

const HERO_COLOR = "#a8420c";

type Pose = { x: number; y: number; z: number; s: number; rx: number; ry: number; rz: number };

const mix = (a: Pose, b: Pose, k: number): Pose => ({
  x: lerp(a.x, b.x, k),
  y: lerp(a.y, b.y, k),
  z: lerp(a.z, b.z, k),
  s: lerp(a.s, b.s, k),
  rx: lerp(a.rx, b.rx, k),
  ry: lerp(a.ry, b.ry, k),
  rz: lerp(a.rz, b.rz, k),
});

/** 0 → 1 → 0 across [a, b]. */
const bump = (x: number, a: number, b: number) => Math.sin(Math.PI * ramp(x, a, b));

const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s) as T;
const qa = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)];

/** World-space box of an element as it sits once its sticky parent is pinned. */
function pinnedBox(el: Element, sticky: Element) {
  const r = el.getBoundingClientRect();
  const s = sticky.getBoundingClientRect();
  const top = r.top - s.top;
  const { nx, ny } = clientToNdc(r.left + r.width / 2, top + r.height / 2);
  const c = ndcToWorld(nx, ny, 0);
  const w = (r.width / engine.view.w) * 2 * engine.view.halfW;
  const h = (r.height / engine.view.h) * 2 * engine.view.halfH;
  return { cx: c.x, cy: c.y, w, h, bottom: c.y - h / 2 };
}

export async function run(config: { lang: string; data: any; banners: Record<string, string> }) {
  const data = config.data as {
    products: { color: string; label: string; name: string; type: string }[];
    lid: { mark: string; caption: string }[];
    claims: string[];
  };

  const [tpl, photo] = await Promise.all([loadBeeTemplate(), loadImage("/images/honey-jar.webp").catch(() => null)]);

  const el = {
    hero: q(".hero"),
    heroStage: q('[data-anchor="hero-stage"]'),
    lid: q('[data-scene-part="lid"]'),
    lidSticky: q('[data-scene-part="lid"] .scene__sticky'),
    lidStage: q('[data-anchor="lid-stage"]'),
    lidItems: qa(".lid__item"),
    vars: q('[data-scene-part="varieties"]'),
    varSticky: q('[data-scene-part="varieties"] .scene__sticky'),
    varStage: q('[data-anchor="var-stage"]'),
    varPanels: qa(".variety"),
    varDots: qa<HTMLButtonElement>(".var__dots button"),
    varFlavors: qa(".var__flavor span"),
    claims: q('[data-scene-part="claims"]'),
    claimCards: qa("[data-claim]"),
    routeSection: q('[data-scene-part="route"]'),
    route: q("[data-route]"),
    pins: qa("[data-pin]"),
    story: q('[data-scene-part="story"]'),
    finale: q('[data-scene-part="finale"]'),
    finaleStage: q('[data-anchor="finale-stage"]'),
  };

  /* ---------- Objects ---------- */

  const jar = createJar(photo, HERO_COLOR);
  jar.group.visible = false;
  engine.scene.add(jar.group);
  const heroPlinth = createPlinth();
  const finalePlinth = createPlinth();

  const maya = new Bee(tpl, engine.scene).withTrail(engine.scene);
  maya.root.visible = false;
  renderBeeShots(maya);

  const banners: BannerBee[] = [];
  Promise.all([...data.claims, config.banners.marketplace].map((text) => BannerBee.create(text, config.lang))).then((list) =>
    banners.push(...list),
  );

  /* ---------- State ---------- */

  const heroM: JarMotion = { drop: 0, tilt: 0 };
  const finaleM: JarMotion = { drop: 0, tilt: 0 };
  const S = {
    heroJar: engine.reduceMotion, // jar has dropped in the hero
    introDone: false,
    finaleDropped: false,
    finaleSettled: false,
    zone: "",
    token: 0,
    pose: null as Pose | null,
    swoop: new THREE.Vector3(),
    varIndex: -1,
    lidIndex: -1,
  };
  let heroTimeline: gsap.core.Timeline | null = null;
  const orbitPhase = { v: 0 };
  let orbitTween: gsap.core.Tween | null = null;

  /** Run fn later unless the zone has changed since. */
  const later = (sec: number, fn: () => void) => {
    const my = S.token;
    gsap.delayedCall(sec, () => my === S.token && fn());
  };

  /* ---------- Jar poses ---------- */

  const heroSlot = (): Slot => slotOf(el.heroStage);

  function slotPose(slot: Slot, m: JarMotion): Pose {
    const corner = (m.tilt > 0 ? -1 : 1) * slot.h * JAR_W * 0.45;
    return {
      x: slot.x + corner - corner * Math.cos(m.tilt),
      y: slot.y + m.drop - corner * Math.sin(m.tilt),
      z: 0,
      s: slot.h,
      rx: 0,
      ry: 0,
      rz: m.tilt,
    };
  }

  // Same 3/4 view of the cap on every screen size.
  const tilt = () => 1.25;
  function lidScale() {
    const b = pinnedBox(el.lidStage, el.lidSticky);
    return ((engine.view.mobile ? 0.78 : 0.8) * Math.min(b.w, b.h)) / (2 * CAP_R);
  }

  function lidPose(p: number): Pose {
    const b = pinnedBox(el.lidStage, el.lidSticky);
    const s = lidScale();
    const u = clamp((p - 0.15) / 0.73, 0, 0.9999) * data.lid.length;
    const k = Math.floor(u);
    const turn = k + ramp(u - k, 0, 0.22);
    // Phones: the jar body hangs below the cap, so lift the cap a little to
    // keep the whole jar inside the stage above the copy.
    const capY = engine.view.mobile ? b.cy + b.h * 0.12 : b.cy;
    return {
      x: b.cx,
      y: capY - Math.cos(tilt()) * s,
      z: -Math.sin(tilt()) * s,
      s,
      rx: tilt(),
      ry: -Math.PI * 2 * (turn + ramp(p, 0, 0.15)),
      rz: 0,
    };
  }

  function varPose(p: number, t: number): Pose {
    // The jar waits in its stage (pinned position) so it never drops away
    // between sections; once the section has finished it leaves with it.
    let b: { cx: number; bottom: number; h: number };
    if (p >= 1) {
      const live = slotOf(el.varStage);
      b = { cx: live.x, bottom: live.y, h: live.h };
    } else {
      b = pinnedBox(el.varStage, el.varSticky);
    }
    const n = data.products.length;
    const u = clamp(p, 0, 0.9999) * n;
    const k = Math.floor(u);
    const f = u - k;
    const tr = k > 0 ? ramp(f, 0, 0.25) : 0;
    return {
      x: b.cx,
      y: b.bottom,
      z: k > 0 ? bump(f, 0, 0.25) * 1.1 : 0,
      s: b.h,
      rx: 0.05,
      ry: -0.35 - Math.PI * 2 * (k + tr) + Math.sin(t * 0.6) * 0.12,
      rz: 0,
    };
  }

  /* ---------- Bee helpers ---------- */

  const heroCap = () => capWorldPoint(jar);
  const heroLandSize = () => capDiameter(heroSlot().h) * 0.48;

  function heroWanderRegion(): Region {
    const { halfW, halfH } = halfAt(0);
    const s = maya.size;
    return engine.view.mobile
      ? { x: [-0.12 * halfW, 0.12 * halfW], y: [0.2 * halfH, 0.36 * halfH], z: [-0.25 * s, 0.12 * s] }
      : { x: [-0.15 * halfW, 0.1 * halfW], y: [-0.06 * halfH, 0.1 * halfH], z: [-0.25 * s, 0.12 * s] };
  }

  // Beside the hero jar, not in front of the label.
  function besideJarRegion(): Region {
    const slot = heroSlot();
    const half = maya.size * 0.5;
    const side = Math.random() < 0.6 ? (maya.pos.x >= slot.x ? -1 : 1) : maya.pos.x >= slot.x ? 1 : -1;
    const x = slot.x + side * (slot.h * JAR_W * 0.5 + half * 0.8 + rand(0, engine.view.halfW * 0.08));
    const y = slot.y + slot.h * rand(0.55, 0.9);
    return { x: [x, x], y: [y, y], z: [0, 0] };
  }

  function orbitPoint(phase: number) {
    const slot = heroSlot();
    const rx = slot.h * JAR_W * 0.5 + maya.size * 0.6;
    return new THREE.Vector3(
      slot.x + Math.cos(phase) * rx,
      slot.y + slot.h * 0.62 + Math.sin(phase * 2) * slot.h * 0.08,
      Math.sin(phase) * 1.6,
    );
  }

  function orbitHeroJar(): Promise<void> {
    const slot = heroSlot();
    const start = maya.pos.x < slot.x ? Math.PI : 0;
    const end = start === Math.PI ? Math.PI * 2.5 : -Math.PI * 1.5;
    orbitPhase.v = start;
    maya.chase(() => orbitPoint(orbitPhase.v), 16);
    gsap.to(maya, { size: heroBeeSize() * 0.45, duration: 3.2, ease: "sine.inOut" });
    return new Promise((resolve) => {
      orbitTween = gsap.to(orbitPhase, { v: end, duration: 3.4, ease: "sine.inOut", onComplete: () => resolve() });
    });
  }

  function landOnHeroJar() {
    const my = S.token;
    maya.land(heroCap, heroLandSize()).then(() => {
      if (my !== S.token) return;
      later(rand(4, 6), () => {
        maya.takeOff(heroBeeSize() * 0.5, besideJarRegion).then(() => {
          later(rand(5, 7), () => {
            if (Math.random() < 0.5) orbitHeroJar().then(() => my === S.token && landOnHeroJar());
            else landOnHeroJar();
          });
        });
      });
    });
  }

  function toCompanion(region: () => Region, size = companionSize()) {
    if (maya.mode === "perched") {
      maya.takeOff(size, region);
    } else {
      maya.wander(region);
      gsap.to(maya, { size, life: 1, duration: 1.2, ease: "power2.inOut" });
    }
  }

  /* ---------- Hero intro ---------- */

  function playIntro() {
    const start = ndcToWorld(-1.35, -0.15);
    const mid = ndcToWorld(-0.45, 0.55);
    const home = ndcToWorld(-0.05, 0.1);
    maya.root.visible = true;
    maya.mode = "scripted";
    maya.size = heroBeeSize();
    maya.pos.copy(start);
    maya.yaw = 0;
    maya.bank = -0.1;
    maya.nose = 0.25;

    const tl = gsap.timeline();
    heroTimeline = tl;
    const path = { t: 0 };
    tl.to(path, {
      t: 1,
      duration: 1.8,
      ease: "power3.out",
      onUpdate: () => {
        const a = start.clone().lerp(mid, path.t);
        const b = mid.clone().lerp(home, path.t);
        maya.pos.copy(a.lerp(b, path.t));
      },
    }, 0.1);
    tl.to(maya, { nose: -0.18, duration: 0.9, ease: "sine.inOut" }, 0.1);
    tl.to(maya, { nose: 0, duration: 1.1, ease: "sine.out" }, 1.0);
    tl.to(maya, { yaw: yawFacing(-1), bank: 0.08, duration: 1.8, ease: "power2.inOut" }, 1.1);
    tl.add(() => maya.wander(heroWanderRegion), 2.3);

    // The jar drops; the bee notices, darts clear and faces it.
    tl.add(() => {
      S.heroJar = true;
      const slot = heroSlot();
      const side = maya.pos.x >= slot.x ? 1 : -1;
      const spot = new THREE.Vector3(slot.x + side * (slot.h * JAR_W * 0.5 + heroBeeSize() * 0.55), slot.y + slot.h * 0.75, 0.6);
      maya.chase(() => spot, 26);
      maya.yawFromVelocity = false;
      maya.yawTarget = yawFacing(-side);
      maya.yawStiffness = 14;
      gsap.to(maya, { size: heroBeeSize() * 0.6, duration: 1.4, ease: "power2.inOut" });
    }, 3.15);
    const impact = dropJar(tl, 3.0, heroM, heroSlot().h, () => (maya.vel.y += maya.size * 1.2));
    tl.add(() => {
      S.introDone = true;
      orbitHeroJar().then(() => S.zone === "hero" && landOnHeroJar());
    }, impact + 0.9);
  }

  /* ---------- Zones ---------- */

  const zones: [string, HTMLElement][] = [
    ["leaving", el.hero],
    ["lid", el.lid],
    ["var", el.vars],
    ["claims", el.claims],
    ["route", el.routeSection],
    ["story", el.story],
    ["finale", el.finale],
  ];

  function currentZone() {
    if (window.scrollY < el.hero.offsetHeight * 0.15) return "hero";
    const mid = engine.view.h / 2;
    for (const [name, node] of zones) {
      const r = node.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) return name;
    }
    return window.scrollY > el.finale.offsetTop ? "finale" : S.zone || "story";
  }

  function lidOrbit() {
    return () => {
      const b = pinnedBox(el.lidStage, el.lidSticky);
      const R = CAP_R * lidScale();
      const t = performance.now() / 1000;
      return new THREE.Vector3(b.cx + Math.cos(t * 0.7) * R * 1.3, b.cy + Math.sin(t * 0.7) * R * 0.8, 1.2 + Math.sin(t * 0.35) * 0.6);
    };
  }

  function varRegion(): Region {
    const s = slotOf(el.varStage);
    const w = s.h * JAR_W;
    return { x: [s.x - w * 1.6, s.x + w * 1.4], y: [s.y + s.h * 0.45, s.y + s.h * 1.1], z: [-0.4, 1.2] };
  }

  function routeProgress() {
    const r = el.route.getBoundingClientRect();
    return clamp((engine.view.h * 0.6 - r.top) / r.height, 0, 1);
  }

  function routePoint() {
    const pts = el.pins.map((p) => elementToWorld(p, 0.5, 0, 0.8));
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const p = curve.getPointAt(routeProgress());
    p.y += maya.size * 0.5;
    return p;
  }

  function finaleSlot(): Slot {
    return slotOf(el.finaleStage);
  }

  function enterZone(zone: string) {
    const prev = S.zone;
    S.zone = zone;
    if (engine.reduceMotion) return;

    // An intro interrupted by scrolling: finish its state instantly.
    if (prev === "hero" && heroTimeline && heroTimeline.isActive()) {
      heroTimeline.progress(1).kill();
      S.heroJar = true;
      S.introDone = true;
    }
    S.token++;
    orbitTween?.kill();
    maya.trailAlways = false;

    switch (zone) {
      case "hero":
        if (S.introDone) {
          gsap.to(maya, { size: heroBeeSize() * 0.5, duration: 1 });
          landOnHeroJar();
        }
        break;
      case "lid":
        if (maya.mode === "perched") maya.takeOff(companionSize()).then(() => S.zone === "lid" && maya.chase(lidOrbit(), 8));
        else {
          maya.chase(lidOrbit(), 8);
          gsap.to(maya, { size: companionSize(), life: 1, duration: 1.2 });
        }
        break;
      case "var":
        toCompanion(varRegion);
        break;
      case "route":
        if (maya.mode === "perched") maya.takeOff(companionSize() * 0.8);
        maya.chase(routePoint, 10);
        maya.trailAlways = true;
        gsap.to(maya, { size: companionSize() * 0.8, life: 1, duration: 1 });
        break;
      case "finale":
        if (S.finaleSettled) landOnFinale();
        else toCompanion(viewportRegion(-0.5, 1, 0.6, 0.5, 0.1));
        break;
      default:
        toCompanion(viewportRegion(-0.8, 1.4, 0.8, 0.6, 0.15));
    }
  }

  function landOnFinale() {
    const my = S.token;
    maya.land(() => capWorldPoint(jar), capDiameter(finaleSlot().h) * 0.48).then(() => {
      if (my !== S.token) return;
      later(rand(5, 7), () => {
        maya.takeOff(companionSize() * 0.7, viewportRegion(-0.5, 1, 0.6, 0.5, 0.1)).then(() => {
          later(rand(5, 7), () => landOnFinale());
        });
      });
    });
  }

  function dropFinaleJar() {
    S.finaleDropped = true;
    const tl = gsap.timeline();
    const impact = dropJar(tl, 0, finaleM, finaleSlot().h, () => (maya.vel.y += maya.size * 1.2));
    tl.add(() => {
      S.finaleSettled = true;
      if (S.zone === "finale") {
        S.token++;
        landOnFinale();
      }
    }, impact + 0.8);
    banners[3]?.fly(engine.view.mobile ? 0.8 : 0.7, 0.4, -1, 7);
  }

  /* ---------- Var dots ---------- */

  el.varDots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      const top = el.vars.offsetTop + (el.vars.offsetHeight - engine.view.h) * ((i + 0.35) / data.products.length);
      if (lenis) lenis.scrollTo(top);
      else window.scrollTo({ top, behavior: "smooth" });
    }),
  );

  /* ---------- Claim banners ---------- */

  const claimIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const i = Number((e.target as HTMLElement).dataset.claim);
        // Phones: fly in the strip under the header, never across the cards.
        const ny = engine.view.mobile ? 0.78 - (i % 2) * 0.06 : 0.62 - i * 0.14;
        banners[i]?.fly(ny, rand(0, 0.8), i % 2 ? -1 : 1, engine.view.mobile ? 5.5 : 7);
      }
    },
    { threshold: 0.6 },
  );
  el.claimCards.forEach((c) => claimIO.observe(c));

  /* ---------- Frame ---------- */

  engine.ticks.add((dt, t) => {
    const vh = engine.view.h;
    const heroOut = clamp(window.scrollY / el.hero.offsetHeight, 0, 1);
    const lidP = stickyProgress(el.lid);
    const varP = stickyProgress(el.vars);
    const claimsTop = el.claims.getBoundingClientRect().top;
    const finaleTop = el.finale.getBoundingClientRect().top;

    const zone = currentZone();
    if (zone !== S.zone) enterZone(zone);

    // --- Jar pose ---
    let target: Pose;
    let visible = S.heroJar;
    let lambda = 7;
    const inFinale = finaleTop < vh * 0.95 && !engine.reduceMotion;

    if (inFinale) {
      if (!S.finaleDropped && finaleTop < vh * 0.55) dropFinaleJar();
      target = slotPose(finaleSlot(), finaleM);
      visible = S.finaleDropped;
      lambda = 30;
    } else {
      target = slotPose(heroSlot(), heroM);
      const toLid = engine.reduceMotion ? 0 : clamp(0.6 * ramp(heroOut, 0.5, 1) + 0.4 * ramp(lidP, 0, 0.15), 0, 1);
      if (toLid === 0) lambda = 30;
      else target = mix(target, lidPose(lidP), toLid);
      const toVar = engine.reduceMotion ? 0 : ramp(lidP, 0.88, 1);
      if (toVar > 0) target = mix(target, varPose(varP, t), toVar);
      const exit = engine.reduceMotion ? 0 : clamp((vh - claimsTop) / vh, 0, 1);
      // The jar already rides up and away with its section; just stop
      // drawing it once the next section has taken over the screen.
      if (exit >= 1) visible = false;

      // Cap face: default mark in the hero, the dial in the lid scene.
      if (lidP > 0.1 && lidP < 0.95) {
        const u = clamp((lidP - 0.15) / 0.73, 0, 0.9999) * data.lid.length;
        const k = Math.floor(u);
        const r = ramp(u - k, 0, 0.22);
        const items = [{ ...data.lid[k], alpha: k === 0 ? 1 : r }];
        if (k > 0 && r < 1) items.unshift({ ...data.lid[k - 1], alpha: 1 - r });
        jar.setCap(items);
        if (k !== S.lidIndex) {
          S.lidIndex = k;
          el.lidItems.forEach((li, i) => li.classList.toggle("is-active", i === k));
        }
      } else {
        jar.setCap([{ mark: "HG", caption: "since 1992" }]);
      }

      // Honey colour and tag follow the variety on show.
      if (toVar > 0.5 && exit < 1) {
        const n = data.products.length;
        const u = clamp(varP, 0, 0.9999) * n;
        const k = Math.floor(u);
        const f = u - k;
        // Swap while the jar is turned away, half way through the spin.
        const shown = k > 0 && f < 0.12 ? k - 1 : k;
        if (shown !== S.varIndex) {
          S.varIndex = shown;
          const p = data.products[shown];
          jar.setHoneyColor(p.color);
          jar.setLabel(p.label);
          jar.setTag(p.name, p.type);
          el.varPanels.forEach((panel, i) => panel.classList.toggle("is-active", i === shown));
          el.varDots.forEach((d, i) => d.classList.toggle("is-active", i === shown));
          el.varFlavors.forEach((f, i) => f.classList.toggle("is-active", i === shown));
        }
      } else if (S.varIndex !== -1) {
        S.varIndex = -1;
        jar.setHoneyColor(HERO_COLOR);
        jar.setLabel(null);
        jar.setTag(null);
      }
    }

    // Smooth toward the target; crisp while a drop is playing.
    if (!S.pose) S.pose = { ...target };
    const P = S.pose;
    const k = 1 - Math.exp(-lambda * dt);
    (Object.keys(P) as (keyof Pose)[]).forEach((key) => (P[key] = lerp(P[key], target[key], k)));
    jar.group.visible = visible;
    jar.group.position.set(P.x, P.y, P.z);
    jar.group.scale.setScalar(P.s);
    jar.group.rotation.set(P.rx, P.ry, P.rz, "XYZ");
    jar.update(dt, t);

    heroPlinth.place(heroSlot(), heroM.drop);
    finalePlinth.place(finaleSlot(), finaleM.drop, !engine.reduceMotion);

    // --- Pins along the route ---
    if (S.zone === "route") {
      const p = routeProgress();
      el.pins.forEach((pin, i) => pin.classList.toggle("is-reached", p >= i / (el.pins.length - 1) - 0.03));
    }

    // --- Bee ---
    const w = engine.reduceMotion
      ? 0
      : Math.max(bump(heroOut, 0.2, 0.8), bump(lidP, 0.86, 1), bump(varP, 0.94, 1), bump(clamp((vh - claimsTop) / vh, 0, 1), 0.1, 0.7));
    const free = maya.mode === "wander" || maya.mode === "follow";
    // How close to the camera she swoops; gentler on phones where she'd fill the screen.
    const swoopDepth = engine.view.mobile ? 3.2 : 6.2;
    const sw = free ? w : 0;
    S.swoop.set(
      damp(S.swoop.x, -maya.pos.x * 0.75 * sw, 5, dt),
      damp(S.swoop.y, (-maya.pos.y * 0.75 + 0.3) * sw, 5, dt),
      damp(S.swoop.z, swoopDepth * sw, 5, dt),
    );
    maya.extraOffset.copy(S.swoop);
    maya.update(dt, t, pointerSmooth);
    if (sw > 0.01) maya.root.rotation.y = lerp(maya.root.rotation.y, YAW_CAMERA, (S.swoop.z / swoopDepth) * 0.85);

    banners.forEach((b) => b.update(dt, t));
  });

  /* ---------- Start ---------- */

  if (engine.reduceMotion) {
    gsap.set(qa("[data-from]"), { opacity: 1 });
    maya.root.visible = true;
    maya.size = heroLandSize();
    maya.life = 0;
    maya.yaw = -0.6;
    maya.perch = heroCap;
    maya.mode = "perched";
    if (maya.idle) {
      maya.hover.stop();
      maya.idle.play();
    }
    S.zone = "hero";
    return;
  }

  if (window.scrollY < el.hero.offsetHeight * 0.15) {
    S.zone = "hero";
    playIntro();
  } else {
    // Arrived mid-page (reload, anchor link): skip the intro.
    S.heroJar = true;
    S.introDone = true;
    maya.root.visible = true;
    maya.size = companionSize();
    maya.pos.copy(ndcToWorld(-0.6, 0.4));
  }
}
