import * as THREE from "three";
import gsap from "gsap";
import { Bee, loadBeeTemplate, YAW_RIGHT, YAW_LEFT } from "./bee";
import { engine, halfAt, rand } from "./engine";

/**
 * A bee towing a fabric banner across the screen, like a plane over a beach.
 * The banner is a segmented plane whose vertices ripple each frame, hung
 * behind the bee on a short tow line. Text always reads left to right.
 */

const SEG_X = 32;
const SEG_Y = 4;

function bannerCanvas(text: string, lang: string) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const font = lang === "hi" ? "'Mukta', 'Tiro Devanagari Hindi', sans-serif" : "'Inter Variable', 'Inter', system-ui, sans-serif";
  const size = 120;
  g.font = `700 ${size}px ${font}`;
  const w = Math.ceil(g.measureText(text).width + size * 1.6);
  c.width = Math.max(w, 600);
  c.height = 220;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f7e9c8";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#c9821c";
  ctx.fillRect(0, 0, c.width, 16);
  ctx.fillRect(0, c.height - 16, c.width, 16);
  ctx.fillStyle = "#2a1a0a";
  ctx.font = `700 ${size}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, c.width / 2, c.height / 2 + 6);
  return c;
}

export class BannerBee {
  bee: Bee;
  mesh: THREE.Mesh;
  line: THREE.Line;
  private base: Float32Array;
  private width: number;
  private height: number;
  private dir = 1;
  busy = false;

  static async create(text: string, lang: string) {
    const tpl = await loadBeeTemplate();
    return new BannerBee(new Bee(tpl, engine.scene), text, lang);
  }

  constructor(bee: Bee, text: string, lang: string) {
    this.bee = bee;
    bee.tricks = false;
    bee.root.visible = false;
    const canvas = bannerCanvas(text, lang);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    this.height = 1;
    this.width = canvas.width / canvas.height;
    const geo = new THREE.PlaneGeometry(this.width, this.height, SEG_X, SEG_Y);
    this.base = Float32Array.from(geo.attributes.position.array as Float32Array);
    this.mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.85, metalness: 0 }),
    );
    this.mesh.visible = false;
    this.line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineBasicMaterial({ color: 0x5a4020 }),
    );
    this.line.visible = false;
    engine.scene.add(this.mesh, this.line);
  }

  /** Fly once across the screen at a normalized height. */
  fly(ny = 0.4, z = rand(0, 0.8), direction: 1 | -1 = Math.random() < 0.5 ? 1 : -1, duration = 7) {
    if (this.busy || engine.reduceMotion) return;
    this.busy = true;
    this.dir = direction;
    const bee = this.bee;
    const { halfW, halfH } = halfAt(z);
    // Phones get a relatively bigger banner so the text stays readable.
    bee.size = Math.min(halfW * (engine.view.mobile ? 0.3 : 0.13), 0.75);
    const bannerLen = this.width * bee.size * this.scaleK();
    const startX = -direction * (halfW + bee.size + bannerLen + 0.5);
    const endX = direction * (halfW + bee.size + 0.5);
    bee.pos.set(startX, ny * halfH, z);
    bee.mode = "scripted";
    bee.yaw = direction > 0 ? YAW_RIGHT + 0.3 : YAW_LEFT - 0.3;
    bee.root.visible = this.mesh.visible = this.line.visible = true;
    gsap.to(bee.pos, {
      x: endX,
      duration,
      ease: "none",
      onUpdate: () => {
        bee.pos.y = ny * halfH + Math.sin(bee.pos.x * 0.9) * bee.size * 0.25;
      },
      onComplete: () => {
        bee.root.visible = this.mesh.visible = this.line.visible = false;
        this.busy = false;
      },
    });
  }

  private scaleK() {
    return engine.view.mobile ? 0.62 : 0.5;
  }

  update(dt: number, t: number) {
    if (!this.mesh.visible) return;
    const bee = this.bee;
    bee.vel.set(this.dir, 0, 0);
    bee.update(dt, t);
    const s = bee.size;
    const scale = s * this.scaleK();
    const rope = s * 0.9;
    // Front edge of the banner hangs a rope's length behind the bee.
    const frontX = bee.pos.x - this.dir * (s * 0.4 + rope);
    const centerX = frontX - this.dir * (this.width * scale) / 2;
    this.mesh.position.set(centerX, bee.pos.y - s * 0.05, bee.pos.z - 0.02);
    this.mesh.scale.setScalar(scale);

    // Ripple: amplitude grows toward the free end.
    const pos = this.mesh.geometry.attributes.position as THREE.BufferAttribute;
    const w = this.width;
    for (let i = 0; i < pos.count; i++) {
      const x = this.base[i * 3];
      const y = this.base[i * 3 + 1];
      const fromFront = this.dir > 0 ? (w / 2 - x) / w : (x + w / 2) / w; // 0 at the tow end
      const wave = Math.sin(fromFront * 9 - t * 7) * 0.09 * fromFront;
      pos.setXYZ(i, x, y + wave * 0.6, wave * 1.4);
    }
    pos.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();

    const p = this.line.geometry.attributes.position as THREE.BufferAttribute;
    p.setXYZ(0, bee.pos.x - this.dir * s * 0.4, bee.pos.y, bee.pos.z);
    p.setXYZ(1, frontX, this.mesh.position.y + scale * 0.45, this.mesh.position.z);
    p.needsUpdate = true;
  }
}
