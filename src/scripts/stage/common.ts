import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import gsap from "gsap";
import { addLights, engine, elementToWorld, elementWorldHeight, halfAt } from "./engine";
import { createJar, JAR_W, CAP_R } from "./jar";
import type { Bee, Region } from "./bee";

export const pointer = new THREE.Vector2();
window.addEventListener("pointermove", (e) => {
  pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
});
const pointerSmooth = new THREE.Vector2();
engine.ticks.add(() => pointerSmooth.lerp(pointer, 0.05));
export { pointerSmooth };

/* ---------- Sizes ---------- */

/** Big, hero-sized bee (body length in world units). */
export function heroBeeSize() {
  const { halfW, halfH, mobile } = engine.view;
  return Math.min(halfW * 2 * (mobile ? 0.42 : 0.4), halfH * 2 * 0.5);
}

/** Companion size while she roams the page. */
export function companionSize() {
  const { halfW, halfH, mobile } = engine.view;
  return Math.min(halfW * (mobile ? 0.3 : 0.28), halfH * 0.42);
}

/** A region covering most of the viewport at depths z0..z1. */
export function viewportRegion(z0 = -1, z1 = 1.2, mx = 0.8, my = 0.65, yShift = 0): () => Region {
  return () => {
    const { halfW, halfH } = halfAt(0);
    // Phones: copy fills the width, so roam the upper band and the edges.
    if (engine.view.mobile) return { x: [-halfW * 0.75, halfW * 0.75], y: [halfH * 0.42, halfH * 0.72], z: [z0, Math.min(z1, 0.6)] };
    return { x: [-halfW * mx, halfW * mx], y: [-halfH * my + yShift * halfH, halfH * my + yShift * halfH], z: [z0, z1] };
  };
}

/* ---------- Slots: where an element wants a jar ---------- */

export type Slot = { x: number; y: number; h: number };

/** Bottom-centre and height (world) of an element, optionally as if its sticky
 *  parent were pinned at the top of the viewport. */
export function slotOf(el: Element, pinnedIn?: Element | null): Slot {
  const p = elementToWorld(el, 0.5, 1);
  let y = p.y;
  if (pinnedIn) {
    const r = el.getBoundingClientRect();
    const s = pinnedIn.getBoundingClientRect();
    const bottomPx = r.bottom - s.top; // where it sits once pinned
    y = -((bottomPx / engine.view.h) * 2 - 1) * engine.view.halfH;
  }
  return { x: p.x, y, h: elementWorldHeight(el) };
}

/* ---------- Plinth ---------- */

export function createPlinth() {
  const pts = [
    [0.0001, -1.2],
    [1, -1.2],
    [1, -0.06],
    [0.985, -0.015],
    [0.955, 0],
    [0, 0],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const mesh = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 96),
    // Drawn first and without depth, so the bee is never hidden behind the plinth.
    new THREE.MeshStandardMaterial({ color: 0x8a6237, roughness: 0.7, metalness: 0, envMapIntensity: 0.45, depthWrite: false }),
  );
  mesh.renderOrder = -2;
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: radialTexture(), transparent: true, depthWrite: false, toneMapped: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = 1;
  const group = new THREE.Group();
  group.add(mesh, shadow);
  engine.scene.add(group);
  return {
    group,
    /** Place on a slot; `lift` is the jar's height above the plinth (for the shadow). */
    place(slot: Slot, lift = 0, visible = true) {
      const radius = slot.h * JAR_W * 0.58;
      group.visible = visible;
      group.position.set(slot.x, slot.y, 0);
      mesh.scale.set(radius, slot.h * 0.09, radius);
      const k = THREE.MathUtils.clamp(lift / (slot.h * 1.5), 0, 1);
      const spread = slot.h * JAR_W * (1.25 + k * 0.6);
      shadow.position.y = 0.002;
      shadow.scale.set(spread, spread * 0.5, 1);
      (shadow.material as THREE.MeshBasicMaterial).opacity = 1 - k * 0.85;
    },
  };
}

function radialTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(40,22,6,0.55)");
  grad.addColorStop(0.55, "rgba(40,22,6,0.25)");
  grad.addColorStop(1, "rgba(40,22,6,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- Jar drop with a heavy wobble ---------- */

export type JarMotion = { drop: number; tilt: number };

/** Animate `m` like a heavy jar falling onto a surface `h` tall. Returns impact time (s). */
export function dropJar(tl: gsap.core.Timeline, at: number, m: JarMotion, h: number, onImpact?: () => void) {
  const fall = 0.75;
  const impact = at + fall;
  tl.fromTo(m, { drop: engine.view.halfH * 2 + h * 0.2 }, { drop: 0, duration: fall, ease: "power2.in" }, at);
  tl.to(m, { drop: h * 0.025, duration: 0.11, ease: "power2.out" }, impact);
  tl.to(m, { drop: 0, duration: 0.11, ease: "power2.in" }, impact + 0.11);
  const rock = { t: 0 };
  tl.to(
    rock,
    {
      t: 1.6,
      duration: 1.6,
      ease: "none",
      onUpdate: () => (m.tilt = 0.075 * Math.exp(-rock.t * 2.8) * Math.sin(rock.t * 13)),
      onComplete: () => (m.tilt = 0),
    },
    impact,
  );
  const shake = { k: 1 };
  tl.fromTo(
    shake,
    { k: 1 },
    {
      k: 0,
      duration: 0.35,
      ease: "power2.out",
      onUpdate: () => {
        engine.camera.position.x = (Math.random() - 0.5) * 0.05 * shake.k;
        engine.camera.position.y = (Math.random() - 0.5) * 0.05 * shake.k;
      },
      onComplete: () => engine.camera.position.set(0, 0, 10),
    },
    impact,
  );
  if (onImpact) tl.add(onImpact, impact);
  return impact;
}

/** Jar group transform for a slot, with drop height and corner rocking. */
export function placeJarOnSlot(group: THREE.Object3D, slot: Slot, m: JarMotion) {
  const corner = (m.tilt > 0 ? -1 : 1) * slot.h * JAR_W * 0.45;
  const c = Math.cos(m.tilt);
  const s = Math.sin(m.tilt);
  group.position.set(slot.x + corner - corner * c, slot.y + m.drop - corner * s, 0);
  group.rotation.set(0, 0, m.tilt);
  group.scale.setScalar(slot.h);
}

export function capDiameter(slotH: number) {
  return CAP_R * 2 * slotH;
}

/* ---------- Offscreen snapshots ---------- */

function offscreen(w: number, h: number, background?: THREE.Texture | null) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: !background, preserveDrawingBuffer: true });
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  if (background) scene.background = background;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  addLights(scene);
  return {
    renderer,
    scene,
    dispose() {
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

function gradientTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#e9cf9c");
  grad.addColorStop(0.55, "#9a6a35");
  grad.addColorStop(1, "#2a1c0e");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Close-ups of the bee for the hero's folder cards. */
export function renderBeeShots(bee: Bee) {
  const imgs = document.querySelectorAll<HTMLImageElement>("img[data-shot]");
  if (!imgs.length) return;
  const w = 640;
  const h = 480;
  const off = offscreen(w, h, gradientTexture());
  const copy = cloneSkinned(bee.model);
  const holder = new THREE.Group();
  holder.add(copy);
  holder.rotation.y = -0.45;
  off.scene.add(holder);
  const mixer = new THREE.AnimationMixer(copy);
  mixer.clipAction(bee.hover.getClip()).play();
  mixer.setTime(0.35);
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(copy);
  const span = box.getSize(new THREE.Vector3()).length();
  const find = (part: string) => {
    let found: THREE.Object3D | null = null;
    copy.traverse((o: any) => {
      if (!found && o.isBone && o.name.toLowerCase().includes(part)) found = o;
    });
    return found as THREE.Object3D | null;
  };
  const cam = new THREE.PerspectiveCamera(28, w / h, span * 0.01, span * 10);
  imgs.forEach((img) => {
    const head = img.dataset.shot === "head";
    const bone = find(head ? "head_jnt" : "r_wing_jnt02");
    const target = bone ? bone.getWorldPosition(new THREE.Vector3()) : box.getCenter(new THREE.Vector3());
    const dir = new THREE.Vector3(...((head ? [0.55, 0.12, 1] : [-0.35, 0.65, 1]) as [number, number, number])).normalize();
    cam.position.copy(target).addScaledVector(dir, span * (head ? 0.42 : 0.62));
    cam.lookAt(target);
    off.renderer.render(off.scene, cam);
    img.src = off.renderer.domElement.toDataURL("image/webp", 0.9);
    img.classList.add("is-ready");
  });
  off.dispose();
}

/** Product cards: render the 3D jar in each honey colour into the card images.
 *  Deferred until the cards come near the viewport, then done in one idle pass. */
export function renderJarShots(photo: HTMLImageElement | null, colors: Record<string, { color: string; label: string }>) {
  const imgs = [...document.querySelectorAll<HTMLImageElement>("img[data-jar-shot]")];
  if (!imgs.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const run = () => paintJarShots(photo, colors, imgs);
      "requestIdleCallback" in window ? requestIdleCallback(run, { timeout: 800 }) : setTimeout(run, 50);
    },
    { rootMargin: "600px 0px" },
  );
  imgs.forEach((img) => io.observe(img));
}

function paintJarShots(photo: HTMLImageElement | null, colors: Record<string, { color: string; label: string }>, imgs: HTMLImageElement[]) {
  const w = 600;
  const h = 860;
  const off = offscreen(w, h, null);
  const jar = createJar(photo);
  off.scene.add(jar.group);
  jar.group.rotation.y = -0.35;
  const cam = new THREE.PerspectiveCamera(24, w / h, 0.1, 50);
  cam.position.set(0, 0.62, 3.2);
  cam.lookAt(0, 0.5, 0);
  const cache: Record<string, string> = {};
  // One jar per idle slot, so the page never sees one long blocking task.
  const queue = [...imgs];
  const next = () => {
    const img = queue.shift();
    if (!img) return off.dispose();
    const slug = img.dataset.jarShot!;
    const color = img.dataset.jarColor ?? colors[slug]?.color;
    const label = img.dataset.jarLabel ?? colors[slug]?.label ?? null;
    if (color) {
      if (!cache[slug]) {
        jar.setHoneyColor(color, true);
        jar.setLabel(label);
        jar.update(0, 0);
        off.renderer.render(off.scene, cam);
        cache[slug] = off.renderer.domElement.toDataURL("image/webp", 0.9);
      }
      img.src = cache[slug];
      img.removeAttribute("width");
      img.removeAttribute("height");
    }
    "requestIdleCallback" in window ? requestIdleCallback(next, { timeout: 500 }) : setTimeout(next, 16);
  };
  next();
}

export const tween = gsap;
