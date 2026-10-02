import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * One full-screen WebGL canvas fixed over the page (pointer-events: none).
 * Everything 3D on every page lives in this scene. Objects that belong to a
 * place in the document follow that element by reading its rect each frame.
 */

export const CAMERA_Z = 10;

type Tick = (dt: number, t: number) => void;

export const engine = {
  renderer: null as unknown as THREE.WebGLRenderer,
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(30, 1, 0.1, 100),
  view: { w: 1, h: 1, halfW: 1, halfH: 1, mobile: false },
  ticks: new Set<Tick>(),
  resizers: new Set<() => void>(),
  reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

export function initEngine(canvas: HTMLCanvasElement) {
  const phone = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !phone || devicePixelRatio < 2, alpha: true, powerPreference: "high-performance" });
  // Phones: cap resolution, the canvas covers the whole screen.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, phone ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  engine.renderer = renderer;

  const pmrem = new THREE.PMREMGenerator(renderer);
  engine.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  addLights(engine.scene);

  engine.camera.position.set(0, 0, CAMERA_Z);

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    engine.camera.aspect = w / h;
    engine.camera.updateProjectionMatrix();
    const halfH = Math.tan(THREE.MathUtils.degToRad(engine.camera.fov / 2)) * CAMERA_Z;
    Object.assign(engine.view, { w, h, halfH, halfW: halfH * (w / h), mobile: w < 900 });
    engine.resizers.forEach((fn) => fn());
  };
  window.addEventListener("resize", resize);
  resize();

  const timer = new THREE.Timer();
  const loop = (now: number) => {
    timer.update(now);
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();
    engine.ticks.forEach((fn) => fn(dt, t));
    renderer.render(engine.scene, engine.camera);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

export function addLights(target: THREE.Object3D) {
  target.add(new THREE.HemisphereLight(0xfff1d6, 0x3a2410, 1.1));
  const key = new THREE.DirectionalLight(0xffe2b0, 2.4);
  key.position.set(3, 5, 6);
  target.add(key);
  const rim = new THREE.DirectionalLight(0xffc6a8, 1.6);
  rim.position.set(-5, 2, -4);
  target.add(rim);
}

/** Half extents of the view at a given depth (z toward the camera is positive). */
export function halfAt(z: number) {
  const k = (CAMERA_Z - z) / CAMERA_Z;
  return { halfW: engine.view.halfW * k, halfH: engine.view.halfH * k };
}

/** World point for a normalized screen position (-1..1, y up) at depth z. */
export function ndcToWorld(nx: number, ny: number, z = 0, out = new THREE.Vector3()) {
  const { halfW, halfH } = halfAt(z);
  return out.set(nx * halfW, ny * halfH, z);
}

/** Normalized screen position of a client-space point. */
export function clientToNdc(x: number, y: number) {
  return { nx: (x / engine.view.w) * 2 - 1, ny: -((y / engine.view.h) * 2 - 1) };
}

/** World point at the centre (or a fractional spot) of an element, at depth z. */
export function elementToWorld(el: Element, fx = 0.5, fy = 0.5, z = 0, out = new THREE.Vector3()) {
  const r = el.getBoundingClientRect();
  const { nx, ny } = clientToNdc(r.left + r.width * fx, r.top + r.height * fy);
  return ndcToWorld(nx, ny, z, out);
}

/** World height of an element at depth z. */
export function elementWorldHeight(el: Element, z = 0) {
  const r = el.getBoundingClientRect();
  return (r.height / engine.view.h) * 2 * halfAt(z).halfH;
}

/** 0..1 progress of an element scrolling through the viewport: 0 when its top
 *  reaches the top of the viewport, 1 when its bottom reaches the bottom. */
export function stickyProgress(el: Element) {
  const r = el.getBoundingClientRect();
  const span = r.height - engine.view.h;
  if (span <= 0) return r.top <= 0 ? 1 : 0;
  return THREE.MathUtils.clamp(-r.top / span, 0, 1);
}

export const clamp = THREE.MathUtils.clamp;
export const lerp = THREE.MathUtils.lerp;
export const damp = THREE.MathUtils.damp;
export const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** 0..1 ramp of x across [a, b], smoothed. */
export function ramp(x: number, a: number, b: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
