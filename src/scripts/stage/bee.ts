import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import gsap from "gsap";
import { engine, clamp, damp, rand } from "./engine";
import { Trail } from "./trail";
import { scroll } from "../scroll";

/**
 * A honey bee with a physically-flavoured flight controller.
 *
 * Movement runs on a slightly underdamped spring toward a target, so the bee
 * accelerates, brakes and overshoots a touch like a real insect. Heading
 * follows travel, the body banks into turns, the nose dips under acceleration
 * and the wings beat faster under load. The model faces +X, so with "YXZ"
 * order rotation.x banks it and rotation.z tips the nose.
 *
 * Modes:
 *  - wander:   picks waypoints inside a region (drifts, darts, look-arounds),
 *              and now and then performs a trick
 *  - follow:   chases a moving target (paths, orbits)
 *  - scripted: position is driven from outside (GSAP)
 *  - perched:  stands on a surface point, wings folded
 */

const BASE_ROTATION = new THREE.Euler(0, Math.PI / 2, 0);
export const YAW_RIGHT = -0.45; // facing right, turned a little to camera
export const YAW_LEFT = -(Math.PI - 0.45);
export const YAW_CAMERA = -Math.PI / 2;
const YAW_MIN = -Math.PI + 0.1;
const YAW_MAX = -0.1;
export const yawFacing = (dir: number) => (dir > 0 ? YAW_RIGHT : YAW_LEFT);

type Template = { root: THREE.Object3D; clips: Record<string, THREE.AnimationClip>; unit: number; foot: number };
let templatePromise: Promise<Template> | null = null;

export function loadBeeTemplate(url = "/models/bee.glb") {
  // The model is meshopt-compressed (5.1 MB -> 1.3 MB); the decoder unpacks it.
  templatePromise ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url).then((gltf) => {
    const holder = new THREE.Group();
    const model = gltf.scene;
    model.rotation.copy(BASE_ROTATION);
    holder.add(model);
    model.traverse((o: any) => {
      if (o.isMesh) {
        o.frustumCulled = false;
        o.material.envMapIntensity = 0.9;
      }
    });
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    const unit = 1 / Math.max(size.x, size.y, size.z);
    const clips: Record<string, THREE.AnimationClip> = {};
    for (const c of gltf.animations) clips[c.name] = c;
    return { root: holder, clips, unit, foot: (center.y - box.min.y) * unit };
  });
  return templatePromise;
}

export type Region = { x: [number, number]; y: [number, number]; z: [number, number] };
type Trick = "roll" | "loop" | "pirouette" | "swoop";

export class Bee {
  root = new THREE.Group();
  model: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  hover: THREE.AnimationAction;
  idle: THREE.AnimationAction | null;
  unit: number;
  foot: number;

  size = 1; // body length in world units
  pos = new THREE.Vector3();
  vel = new THREE.Vector3();
  acc = new THREE.Vector3();
  target = new THREE.Vector3();
  yaw = YAW_RIGHT;
  yawVel = 0;
  yawTarget = YAW_RIGHT;
  yawStiffness = 7;
  yawFromVelocity = false;
  bank = 0.08;
  nose = 0;
  life = 1; // idle jitter + pointer parallax amount
  stiffness = 5;
  damping = 4;

  mode: "wander" | "follow" | "scripted" | "perched" = "scripted";
  region: () => Region = () => ({ x: [-1, 1], y: [-1, 1], z: [-0.5, 0.5] });
  follow: () => THREE.Vector3 = () => this.target;
  perch: (() => THREE.Vector3) | null = null;

  tricks = true;
  trickEvery: [number, number] = [5, 10];
  private trickTimer = rand(4, 7);
  private trick = { bank: 0, nose: 0, yaw: 0, offset: new THREE.Vector3(), busy: false };
  private waypointTimer = 0;
  private lastMode = "hover";

  trail: Trail | null = null;
  trailAlways = false;
  extraOffset = new THREE.Vector3(); // scene-driven offsets (scroll swoops)

  constructor(tpl: Template, scene: THREE.Scene) {
    this.model = cloneSkinned(tpl.root);
    this.root.add(this.model);
    this.unit = tpl.unit;
    this.foot = tpl.foot;
    this.mixer = new THREE.AnimationMixer(this.model);
    this.hover = this.mixer.clipAction(tpl.clips.hover ?? Object.values(tpl.clips)[0]);
    this.hover.play();
    this.mixer.setTime(Math.random() * 2);
    this.idle = tpl.clips.idle ? this.mixer.clipAction(tpl.clips.idle) : null;
    scene.add(this.root);
  }

  withTrail(scene: THREE.Scene, color?: string) {
    this.trail = new Trail(scene, color);
    return this;
  }

  setSpring(stiffness: number, ratio = 0.78) {
    this.stiffness = stiffness;
    this.damping = 2 * Math.sqrt(stiffness) * ratio;
  }

  wander(region?: () => Region) {
    if (region) this.region = region;
    this.mode = "wander";
    this.yawFromVelocity = false;
    this.target.copy(this.pos);
    this.waypointTimer = rand(0.2, 0.6);
  }

  chase(follow: () => THREE.Vector3, stiffness = 14) {
    this.follow = follow;
    this.mode = "follow";
    this.yawFromVelocity = true;
    this.yawStiffness = 9;
    this.setSpring(stiffness, 0.9);
  }

  /** Fly onto a surface point and fold the wings. Resolves on touchdown. */
  land(point: () => THREE.Vector3, size: number, duration = 2.2): Promise<void> {
    this.mode = "scripted";
    const from = this.pos.clone();
    const path = { t: 0 };
    const tl = gsap.timeline();
    tl.to(this, { size, duration: duration * 0.9, ease: "power2.inOut" }, 0);
    tl.to(this, { life: 0, duration: duration * 0.7, ease: "power1.in" }, duration * 0.2);
    tl.to(this, { yaw: -0.6, bank: 0.08, duration: duration * 0.7, ease: "power2.inOut" }, duration * 0.15);
    tl.to(this, { nose: 0.12, duration: duration * 0.45, ease: "sine.out" }, duration * 0.2);
    tl.to(this, { nose: 0, duration: duration * 0.35, ease: "sine.inOut" }, duration * 0.65);
    tl.to(
      path,
      {
        t: 1,
        duration,
        ease: "power2.inOut",
        onUpdate: () => {
          const to = point().clone();
          to.y += this.foot * this.size;
          const above = to.clone();
          above.y += this.size * 1.6;
          const a = from.clone().lerp(above, path.t);
          const b = above.clone().lerp(to, path.t);
          this.pos.copy(a.lerp(b, path.t));
        },
      },
      0,
    );
    return new Promise((resolve) => {
      tl.add(() => {
        this.perch = point;
        this.mode = "perched";
        this.vel.set(0, 0, 0);
        if (this.idle) {
          this.idle.reset().play();
          this.hover.crossFadeTo(this.idle, 0.5, false);
        }
        this.mixer.timeScale = 1;
        resolve();
      });
    });
  }

  /** Lift off from a perch and hand over to wander mode. */
  takeOff(size: number, region?: () => Region): Promise<void> {
    if (this.idle && this.mode === "perched") {
      this.hover.reset().play();
      this.idle.crossFadeTo(this.hover, 0.3, false);
    }
    this.mode = "scripted";
    this.perch = null;
    const side = Math.random() < 0.5 ? -1 : 1;
    const tl = gsap.timeline();
    tl.to(this, { size, duration: 1.3, ease: "power2.inOut" }, 0.05);
    tl.to(this, { life: 1, duration: 1, ease: "power1.out" }, 0.2);
    tl.to(this, { yaw: yawFacing(side), nose: 0.2, duration: 0.7, ease: "power2.out" }, 0.05);
    tl.to(this, { nose: 0, duration: 0.6, ease: "sine.inOut" }, 0.8);
    tl.to(this.pos, { x: `+=${side * size * 1.2}`, y: `+=${size * 1.1}`, z: "+=0.3", duration: 1.2, ease: "power2.inOut" }, 0.1);
    return new Promise((resolve) => {
      tl.add(() => {
        this.wander(region);
        resolve();
      });
    });
  }

  doTrick(kind?: Trick) {
    if (this.trick.busy || engine.reduceMotion) return;
    const tricks: Trick[] = ["roll", "loop", "pirouette", "swoop"];
    const k = kind ?? tricks[Math.floor(Math.random() * tricks.length)];
    const tr = this.trick;
    tr.busy = true;
    const done = () => {
      tr.bank = tr.nose = tr.yaw = 0;
      tr.offset.set(0, 0, 0);
      tr.busy = false;
    };
    const s = this.size;
    if (k === "roll") {
      gsap.fromTo(tr, { bank: 0 }, { bank: Math.PI * 2, duration: 0.9, ease: "power2.inOut", onComplete: done });
    } else if (k === "loop") {
      const dir = Math.cos(this.yaw) >= 0 ? 1 : -1;
      const o = { a: 0 };
      gsap.to(o, {
        a: Math.PI * 2,
        duration: 1.4,
        ease: "power1.inOut",
        onUpdate: () => {
          tr.nose = o.a;
          tr.offset.set(Math.sin(o.a) * s * 0.9 * dir, (1 - Math.cos(o.a)) * s * 0.9, 0);
        },
        onComplete: done,
      });
    } else if (k === "pirouette") {
      gsap.fromTo(tr, { yaw: 0 }, { yaw: -Math.PI * 2, duration: 1.1, ease: "power2.inOut", onComplete: done });
    } else {
      const o = { k: 0 };
      gsap.to(o, {
        k: 1,
        duration: 2.2,
        ease: "none",
        onUpdate: () => {
          const w = Math.sin(o.k * Math.PI);
          tr.offset.set(Math.sin(o.k * Math.PI * 2) * s * 0.6, -w * s * 0.3, w * 4);
          tr.yaw = w * (YAW_CAMERA - this.yaw) * 0.8;
        },
        onComplete: done,
      });
    }
  }

  private nextWaypoint() {
    const r = this.region();
    const roll = Math.random();
    let mode = roll < 0.5 ? "drift" : roll < 0.75 ? "dart" : "hover";
    if (mode === "hover" && this.lastMode === "hover") mode = "drift";
    this.lastMode = mode;
    if (mode === "hover") {
      this.target.copy(this.pos);
      this.setSpring(4);
      this.waypointTimer = rand(1, 1.8);
      const looks = [YAW_CAMERA + rand(-0.35, 0.35), YAW_RIGHT, YAW_LEFT];
      this.yawTarget = looks[Math.floor(Math.random() * looks.length)];
      this.yawStiffness = 5;
      return;
    }
    const p = new THREE.Vector3(rand(...r.x), rand(...r.y), rand(...r.z));
    if (mode === "dart" && p.distanceTo(this.pos) < this.size * 0.6) {
      p.x = this.pos.x > (r.x[0] + r.x[1]) / 2 ? r.x[0] : r.x[1];
    }
    this.target.copy(p);
    this.setSpring(mode === "dart" ? rand(20, 28) : rand(3.5, 6));
    this.waypointTimer = mode === "dart" ? rand(0.8, 1.2) : rand(1.6, 2.8);
    const dx = p.x - this.pos.x;
    if (Math.abs(dx) > this.size * 0.1) this.yawTarget = dx > 0 ? rand(-0.65, -0.3) : -Math.PI + rand(0.3, 0.65);
    this.yawStiffness = mode === "dart" ? 16 : 6;
  }

  private spring(dt: number) {
    const size = Math.max(this.size, 0.05);
    this.acc.copy(this.target).sub(this.pos).multiplyScalar(this.stiffness).addScaledVector(this.vel, -this.damping);
    this.vel.addScaledVector(this.acc, dt);
    this.pos.addScaledVector(this.vel, dt);

    if (this.yawFromVelocity) {
      const flat = Math.hypot(this.vel.x, this.vel.z);
      if (flat > size * 0.3) {
        let y = Math.atan2(-this.vel.z, this.vel.x);
        if (y > YAW_MAX) y = this.vel.x >= 0 ? YAW_RIGHT : YAW_LEFT;
        this.yawTarget = clamp(y, YAW_MIN, YAW_MAX);
      }
    }
    const yd = 2 * Math.sqrt(this.yawStiffness) * 0.72;
    this.yawVel += ((this.yawTarget - this.yaw) * this.yawStiffness - this.yawVel * yd) * dt;
    this.yaw = clamp(this.yaw + this.yawVel * dt, YAW_MIN - 0.1, YAW_MAX + 0.1);

    const forwardAcc = (this.acc.x * Math.cos(this.yaw) - this.acc.z * Math.sin(this.yaw)) / size;
    const climb = this.vel.y / size;
    this.nose = damp(this.nose, clamp(-forwardAcc * 0.03 + climb * 0.2, -0.35, 0.3), 6, dt);
    this.bank = damp(this.bank, 0.08 + clamp(-this.yawVel * 0.14, -0.45, 0.45), 6, dt);

    const speed = this.vel.length() / size;
    this.mixer.timeScale = damp(this.mixer.timeScale, 1 + Math.min(speed * 0.3, 0.5), 4, dt);
  }

  update(dt: number, t: number, pointer?: THREE.Vector2) {
    this.mixer.update(dt);

    switch (this.mode) {
      case "wander":
        this.waypointTimer -= dt;
        if (this.waypointTimer <= 0) this.nextWaypoint();
        this.spring(dt);
        if (this.tricks) {
          this.trickTimer -= dt;
          if (this.trickTimer <= 0) {
            this.doTrick();
            this.trickTimer = rand(...this.trickEvery);
          }
        }
        break;
      case "follow":
        this.target.copy(this.follow());
        this.spring(dt);
        break;
      case "perched":
        if (this.perch) {
          const p = this.perch();
          this.pos.set(p.x, p.y + this.foot * this.size, p.z);
        }
        break;
    }

    const s = this.size;
    const k = this.life;
    const tr = this.trick;
    const jx = (Math.sin(t * 0.9 + s) * 0.012 + Math.sin(t * 7.3) * 0.003) * s;
    const jy = (Math.sin(t * 1.7) * 0.02 + Math.sin(t * 11.3) * 0.0035) * s;
    const px = pointer ? pointer.x * 0.03 * s : 0;
    const py = pointer ? pointer.y * 0.02 * s : 0;

    this.root.scale.setScalar(s * this.unit);
    this.root.position
      .copy(this.pos)
      .add(tr.offset)
      .add(this.extraOffset)
      .add(new THREE.Vector3((jx + px) * k, (jy + py) * k, 0));
    this.root.rotation.set(
      this.bank + tr.bank + Math.sin(t * 1.1) * 0.03 * k,
      this.yaw + tr.yaw + (pointer ? pointer.x * 0.1 * k : 0),
      this.nose + tr.nose + Math.sin(t * 1.7 + 0.8) * 0.04 * k,
      "YXZ",
    );

    if (this.trail) {
      const fwd = new THREE.Vector3(Math.cos(this.root.rotation.y), 0, -Math.sin(this.root.rotation.y));
      const rear = this.root.position.clone().addScaledVector(fwd, -s * 0.45);
      const moving = this.vel.length() > s * 0.6 || tr.busy || Math.abs(scroll.velocity) > 0.3;
      this.trail.spacing = Math.max(s * 0.14, 0.04);
      this.trail.setScale(Math.max(s, 0.3) * 120 * engine.renderer.getPixelRatio());
      this.trail.feed(rear, this.mode !== "perched" && (moving || this.trailAlways));
      this.trail.update(dt);
    }
  }
}
