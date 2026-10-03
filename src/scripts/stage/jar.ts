import * as THREE from "three";

/**
 * Procedural High Growth jar, modelled on the product photo.
 *
 * Unit space: the jar is 1 tall (bottom at y=0, top of the cap at y=1) and
 * JAR_W wide. Body cross-sections are superellipses (a rounded square) that
 * relax into a circle at the neck. The label on the front is the label from
 * the photo, mapped by projected x so the front view matches the photo.
 */

export const JAR_W = 0.644; // width / height, from the photo
const DEPTH = 0.9; // depth relative to width
const LABEL_BOTTOM = 0.096;
const LABEL_TOP = 0.676;
const GLASS_TOP = 0.88;
const HONEY_TOP = 0.79;
const CAP_BOTTOM = 0.862;
const CAP_RADIUS = 0.873 * (JAR_W / 2);
export const CAP_TOP_Y = 1;
export const CAP_R = CAP_RADIUS;

// Label region inside /images/honey-jar.webp (784 x 1217).
const LABEL_SRC = { x: 2, y: 394, w: 779, h: 706 };
const LABEL_YELLOW = "#f7de3a";

// [y, half-width scale, superellipse exponent]
const PROFILE: [number, number, number][] = [
  [0.0, 0.8, 5],
  [0.008, 0.9, 5],
  [0.025, 0.97, 5],
  [0.055, 1.0, 5],
  [0.66, 1.0, 5],
  [0.7, 0.985, 4.6],
  [0.735, 0.955, 4],
  [0.77, 0.905, 3.2],
  [0.8, 0.86, 2.5],
  [0.83, 0.835, 2.1],
  [GLASS_TOP, 0.83, 2],
];

function sampleProfile(y: number) {
  for (let i = 1; i < PROFILE.length; i++) {
    const [y1, s1, n1] = PROFILE[i];
    const [y0, s0, n0] = PROFILE[i - 1];
    if (y <= y1) {
      const t = (y - y0) / (y1 - y0);
      const k = t * t * (3 - 2 * t);
      return { s: s0 + (s1 - s0) * k, n: n0 + (n1 - n0) * k };
    }
  }
  const last = PROFILE[PROFILE.length - 1];
  return { s: last[1], n: last[2] };
}

/** Lofted superellipse shell between y0 and y1. Seam sits at the left side. */
function loftGeometry(y0: number, y1: number, inset: number, rings: number, segs = 96, uvMode: "label" | "wrap" = "wrap") {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const hw = JAR_W / 2;
  for (let i = 0; i <= rings; i++) {
    const y = y0 + ((y1 - y0) * i) / rings;
    const { s, n } = sampleProfile(y);
    const e = 2 / n;
    for (let j = 0; j <= segs; j++) {
      const th = Math.PI - (2 * Math.PI * j) / segs;
      const c = Math.cos(th);
      const sn = Math.sin(th);
      const x = Math.sign(c) * Math.pow(Math.abs(c), e) * hw * s * inset;
      const z = Math.sign(sn) * Math.pow(Math.abs(sn), e) * hw * s * inset * DEPTH;
      pos.push(x, y, z);
      let u: number;
      if (uvMode === "label") {
        // Front half carries the photo label (u 0..0.5), back half the back label.
        const xn = x / (hw * s * inset) / 2 + 0.5; // 0 at left, 1 at right
        u = j <= segs / 2 ? xn * 0.5 : 0.5 + (1 - xn) * 0.5;
      } else {
        u = j / segs;
      }
      uv.push(u, (y - y0) / (y1 - y0));
    }
  }
  const row = segs + 1;
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * row + j;
      const b = a + row;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Flat superellipse cap at height y (for the honey surface and jar floor). */
function discGeometry(y: number, inset: number, segs = 96) {
  const { s, n } = sampleProfile(y);
  const e = 2 / n;
  const hw = JAR_W / 2;
  const pos = [0, y, 0];
  const idx: number[] = [];
  for (let j = 0; j <= segs; j++) {
    const th = (2 * Math.PI * j) / segs;
    const c = Math.cos(th);
    const sn = Math.sin(th);
    pos.push(
      Math.sign(c) * Math.pow(Math.abs(c), e) * hw * s * inset,
      y,
      Math.sign(sn) * Math.pow(Math.abs(sn), e) * hw * s * inset * DEPTH,
    );
    if (j > 0) idx.push(0, j + 1, j);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function capGeometry() {
  const r = CAP_RADIUS;
  const h = CAP_TOP_Y - CAP_BOTTOM;
  const pts = [
    [r * 0.97, 0],
    [r, h * 0.06],
    [r * 1.008, h * 0.5],
    [r, h * 0.86],
    [r * 0.975, h * 0.95],
    [r * 0.93, h],
    [r * 0.9, h],
  ].map(([x, y]) => new THREE.Vector2(x, CAP_BOTTOM + y));
  return new THREE.LatheGeometry(pts, 128);
}

function canvasTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function ridgeBumpTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 16;
  const g = c.getContext("2d")!;
  for (let x = 0; x < c.width; x += 8) {
    const grad = g.createLinearGradient(x, 0, x + 8, 0);
    grad.addColorStop(0, "#000");
    grad.addColorStop(0.5, "#fff");
    grad.addColorStop(1, "#000");
    g.fillStyle = grad;
    g.fillRect(x, 0, 8, c.height);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function buildLabelCanvas(photo: HTMLImageElement | null) {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = Math.round((1024 * LABEL_SRC.h) / LABEL_SRC.w);
  const g = c.getContext("2d")!;
  g.fillStyle = LABEL_YELLOW;
  g.fillRect(0, 0, c.width, c.height);
  if (photo) {
    g.drawImage(photo, LABEL_SRC.x, LABEL_SRC.y, LABEL_SRC.w, LABEL_SRC.h, 0, 0, 1024, c.height);
  }
  // Back label: plain brand panel.
  const bx = 1024;
  const H = c.height;
  g.fillStyle = "#7d1416";
  g.beginPath();
  g.ellipse(bx + 512, H * 0.24, 230, 90, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff7e0";
  g.textAlign = "center";
  g.font = "700 64px Georgia, 'Tiro Devanagari Hindi', serif";
  g.fillText("HIGH GROWTH", bx + 512, H * 0.25);
  g.font = "36px Georgia, 'Tiro Devanagari Hindi', serif";
  g.fillText("since 1992", bx + 512, H * 0.31);
  g.fillStyle = "#3a2a10";
  g.font = "600 46px Georgia, 'Tiro Devanagari Hindi', serif";
  g.fillText("Raw · Unheated · Unfiltered", bx + 512, H * 0.5);
  g.font = "34px Georgia, 'Tiro Devanagari Hindi', serif";
  ["Strained cold through 400 micron mesh.", "Every batch NABL lab tested.", "Sold on Amazon & Flipkart."].forEach(
    (line, i) => g.fillText(line, bx + 512, H * 0.6 + i * 54),
  );
  g.fillStyle = "#5cbf4a";
  g.fillRect(bx + 140, H * 0.84, 744, 70);
  g.fillStyle = "#1d3a12";
  g.font = "600 34px Georgia, 'Tiro Devanagari Hindi', serif";
  g.fillText("100% NATURAL · PURE AND ORGANIC", bx + 512, H * 0.84 + 47);
  return c;
}

export type CapContent = { mark: string; caption?: string; alpha?: number };

function drawCapTop(c: HTMLCanvasElement, contents: CapContent[]) {
  const g = c.getContext("2d")!;
  const S = c.width;
  const R = S / 2;
  g.clearRect(0, 0, S, S);
  // Brushed gold.
  const base = g.createRadialGradient(R * 0.8, R * 0.7, R * 0.1, R, R, R);
  base.addColorStop(0, "#e9c665");
  base.addColorStop(0.55, "#c28f2c");
  base.addColorStop(1, "#7d5815");
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  for (let r = R * 0.98; r > 4; r -= 3) {
    g.strokeStyle = `rgba(255,240,200,${0.03 + Math.random() * 0.05})`;
    g.lineWidth = 1;
    g.beginPath();
    g.arc(R, R, r, 0, Math.PI * 2);
    g.stroke();
  }
  // Pressed rings.
  g.strokeStyle = "rgba(90,60,10,0.55)";
  g.lineWidth = 6;
  g.beginPath();
  g.arc(R, R, R * 0.86, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = "rgba(255,240,190,0.5)";
  g.lineWidth = 2;
  g.beginPath();
  g.arc(R, R, R * 0.84, 0, Math.PI * 2);
  g.stroke();
  // Ring lettering.
  const ring = "HIGH GROWTH HONEY  ·  SINCE 1992  ·  RAW & UNHEATED  ·  ";
  g.fillStyle = "rgba(70,45,8,0.85)";
  g.font = `600 ${S * 0.04}px Georgia, 'Tiro Devanagari Hindi', serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const chars = ring.split("");
  const step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    const a = -Math.PI / 2 + i * step;
    g.save();
    g.translate(R + Math.cos(a) * R * 0.92, R + Math.sin(a) * R * 0.92);
    g.rotate(a + Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
  });
  // Centre content (cross-fades when several are passed with alphas).
  for (const item of contents) {
    const alpha = item.alpha ?? 1;
    if (alpha <= 0.001) continue;
    g.globalAlpha = alpha;
    const size = item.mark.length <= 4 ? S * 0.25 : S * 0.15;
    g.font = `700 ${size}px Georgia, 'Tiro Devanagari Hindi', serif`;
    // Pressed into the metal: a light lip below, dark letterform on top.
    g.fillStyle = "rgba(255,236,180,0.75)";
    g.fillText(item.mark, R + 2, R - S * 0.02 + 4);
    g.fillStyle = "#4a2e06";
    g.fillText(item.mark, R, R - S * 0.02);
    if (item.caption) {
      g.font = `600 ${S * 0.045}px Georgia, 'Tiro Devanagari Hindi', serif`;
      g.fillStyle = "#4a2e06";
      g.fillText(item.caption.toUpperCase(), R, R + S * 0.17);
    }
    g.globalAlpha = 1;
  }
}

function drawTag(c: HTMLCanvasElement, title: string, subtitle: string) {
  const g = c.getContext("2d")!;
  const { width: W, height: H } = c;
  g.clearRect(0, 0, W, H);
  const r = 24;
  g.fillStyle = "#f8efdc";
  g.beginPath();
  g.moveTo(r, 0);
  g.lineTo(W - r, 0);
  g.quadraticCurveTo(W, 0, W, r);
  g.lineTo(W, H - r);
  g.quadraticCurveTo(W, H, W - r, H);
  g.lineTo(r, H);
  g.quadraticCurveTo(0, H, 0, H - r);
  g.lineTo(0, r);
  g.quadraticCurveTo(0, 0, r, 0);
  g.fill();
  g.strokeStyle = "#c9821c";
  g.lineWidth = 6;
  g.strokeRect(18, 18, W - 36, H - 36);
  g.fillStyle = "#c9821c";
  g.beginPath();
  g.arc(W / 2, 46, 12, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#3b240c";
  g.textAlign = "center";
  g.font = `700 ${W * 0.14}px Georgia, 'Tiro Devanagari Hindi', serif`;
  wrapText(g, title, W / 2, H * 0.42, W * 0.82, W * 0.16);
  g.font = `${W * 0.085}px Georgia, 'Tiro Devanagari Hindi', serif`;
  g.fillStyle = "#8a5a1a";
  g.fillText(subtitle, W / 2, H * 0.86);
}

function wrapText(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > max && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  lines.push(line);
  const start = y - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => g.fillText(l, x, start + i * lh));
}

export type Jar = ReturnType<typeof createJar>;

// One label canvas per page, shared by every jar; flavours are applied in the shader.
let labelCanvasShared: { photo: HTMLImageElement | null; canvas: HTMLCanvasElement } | null = null;
function sharedLabelCanvas(photo: HTMLImageElement | null) {
  if (!labelCanvasShared || labelCanvasShared.photo !== photo) labelCanvasShared = { photo, canvas: buildLabelCanvas(photo) };
  return labelCanvasShared.canvas;
}

/** GLSL port of the label recolour: yellows take the flavour's hue, keeping
 *  the photo's shading and print. Runs on the GPU, so switching is free. */
const LABEL_RECOLOR_GLSL = /* glsl */ `
  uniform vec3 uFlavorHsl;
  uniform float uRecolor;
  vec3 hgRgb2Hsl(vec3 c) {
    float mx = max(c.r, max(c.g, c.b));
    float mn = min(c.r, min(c.g, c.b));
    float l = (mx + mn) * 0.5;
    if (mx == mn) return vec3(0.0, 0.0, l);
    float d = mx - mn;
    float s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);
    float h;
    if (mx == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
    else h = (c.r - c.g) / d + 4.0;
    return vec3(h / 6.0, s, l);
  }
  float hgHue(float p, float q, float t) {
    t = fract(t);
    if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
    if (t < 0.5) return q;
    if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
    return p;
  }
  vec3 hgHsl2Rgb(vec3 hsl) {
    if (hsl.y == 0.0) return vec3(hsl.z);
    float q = hsl.z < 0.5 ? hsl.z * (1.0 + hsl.y) : hsl.z + hsl.y - hsl.z * hsl.y;
    float p = 2.0 * hsl.z - q;
    return vec3(hgHue(p, q, hsl.x + 1.0 / 3.0), hgHue(p, q, hsl.x), hgHue(p, q, hsl.x - 1.0 / 3.0));
  }
  vec3 hgRecolor(vec3 c) {
    vec3 hsl = hgRgb2Hsl(c);
    float deg = hsl.x * 360.0;
    if (deg < 30.0 || deg > 72.0 || hsl.y < 0.25 || hsl.z < 0.2) return c;
    float w = min(1.0, (hsl.y - 0.25) / 0.35);
    float nl = min(0.94, hsl.z * (uFlavorHsl.z / 0.58) * (0.85 + 0.15 * w) + (1.0 - w) * 0.12);
    vec3 target = hgHsl2Rgb(vec3(uFlavorHsl.x, uFlavorHsl.y * (0.55 + 0.45 * w), nl));
    return mix(c, target, max(w, 0.6));
  }
`;

export function createJar(photo: HTMLImageElement | null, honeyColor = "#a8420c", labelColor: string | null = null) {
  const group = new THREE.Group(); // origin at the bottom centre
  const tilt = new THREE.Group(); // inner group so callers can tip it toward the camera
  group.add(tilt);

  const honeyMat = new THREE.MeshPhysicalMaterial({
    color: honeyColor,
    roughness: 0.22,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.1,
    emissive: new THREE.Color(honeyColor).multiplyScalar(0.12),
    envMapIntensity: 0.4,
  });
  // Back-lit look: the edges of the honey glow brighter than its face.
  const rim = { value: new THREE.Color(honeyColor) };
  honeyMat.onBeforeCompile = (shader) => {
    shader.uniforms.uRim = rim;
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform vec3 uRim;\nvoid main() {")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float rimK = pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 2.2);
        totalEmissiveRadiance += uRim * rimK * 0.7;`,
      );
  };
  const honey = new THREE.Mesh(loftGeometry(0.012, HONEY_TOP, 0.955, 40), honeyMat);
  const honeyTop = new THREE.Mesh(discGeometry(HONEY_TOP, 0.955), honeyMat);
  tilt.add(honey, honeyTop);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: 0.07,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 3,
    depthWrite: false,
  });
  const glass = new THREE.Mesh(loftGeometry(0, GLASS_TOP, 1, 56), glassMat);
  glass.renderOrder = 3;
  tilt.add(glass);

  // The photo label already carries its own lighting, so it renders unlit.
  const labelMat = new THREE.MeshBasicMaterial({ map: canvasTexture(sharedLabelCanvas(photo)), color: 0xf2efe8, toneMapped: false });
  const flavorUniforms = { uFlavorHsl: { value: new THREE.Vector3() }, uRecolor: { value: 0 } };
  const applyFlavor = (flavor: string | null) => {
    flavorUniforms.uRecolor.value = flavor ? 1 : 0;
    if (!flavor) return;
    const rgb = new THREE.Color(flavor).getStyle().match(/\d+/g)!.slice(0, 3).map((v) => Number(v) / 255) as [number, number, number];
    flavorUniforms.uFlavorHsl.value.set(...rgbToHsl(...rgb));
  };
  applyFlavor(labelColor);
  labelMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, flavorUniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", `${LABEL_RECOLOR_GLSL}\nvoid main() {`)
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        if (uRecolor > 0.5) {
          // Recolour in sRGB, like the photo editing it mirrors.
          vec3 srgb = sRGBTransferOETF(vec4(diffuseColor.rgb, 1.0)).rgb;
          diffuseColor.rgb = sRGBTransferEOTF(vec4(hgRecolor(srgb), 1.0)).rgb;
        }`,
      );
  };
  const label = new THREE.Mesh(loftGeometry(LABEL_BOTTOM, LABEL_TOP, 1.006, 24, 128, "label"), labelMat);
  tilt.add(label);

  const bump = ridgeBumpTexture();
  bump.repeat.set(1, 1);
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xc99a38,
    metalness: 1,
    roughness: 0.24,
    bumpMap: bump,
    bumpScale: 0.35,
    envMapIntensity: 1.1,
  });
  const capSide = new THREE.Mesh(capGeometry(), goldMat);
  tilt.add(capSide);

  const capCanvas = document.createElement("canvas");
  capCanvas.width = capCanvas.height = 1024;
  drawCapTop(capCanvas, [{ mark: "HG", caption: "since 1992" }]);
  const capTex = canvasTexture(capCanvas);
  const capTopMat = new THREE.MeshStandardMaterial({ map: capTex, color: 0x8f8a80, metalness: 0.45, roughness: 0.45, envMapIntensity: 0.7 });
  const capTop = new THREE.Mesh(new THREE.CircleGeometry(CAP_RADIUS * 0.93, 96), capTopMat);
  capTop.rotation.x = -Math.PI / 2;
  capTop.position.y = CAP_TOP_Y + 0.0005;
  tilt.add(capTop);

  // Paper tag hanging from the neck on a string.
  const tagCanvas = document.createElement("canvas");
  tagCanvas.width = 400;
  tagCanvas.height = 520;
  const tagTex = canvasTexture(tagCanvas);
  const tagPivot = new THREE.Group();
  tagPivot.position.set(JAR_W * 0.24, 0.84, (JAR_W / 2) * DEPTH + 0.035);
  const tag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.26).translate(0, -0.2, 0),
    new THREE.MeshStandardMaterial({ map: tagTex, roughness: 0.8, side: THREE.DoubleSide, transparent: true }),
  );
  const string = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.03, 0.01, -0.02), new THREE.Vector3(0, -0.07, 0)]),
    new THREE.LineBasicMaterial({ color: 0x7a5a2a }),
  );
  tagPivot.add(tag, string);
  tagPivot.visible = false;
  tilt.add(tagPivot);

  const shadowFloor = new THREE.Mesh(discGeometry(0.004, 0.97), new THREE.MeshBasicMaterial({ color: 0x2a1405 }));
  tilt.add(shadowFloor);

  const target = new THREE.Color(honeyColor);
  const current = new THREE.Color(honeyColor);
  let capKey = "";

  return {
    group,
    tilt,
    capTop,
    /** Flavour theme for the label; null restores the original yellow. */
    setLabel(flavor: string | null) {
      applyFlavor(flavor);
    },
    setHoneyColor(hex: string, instant = false) {
      target.set(hex);
      if (instant) current.copy(target);
    },
    setTag(title: string | null, subtitle = "") {
      tagPivot.visible = !!title;
      if (title) {
        drawTag(tagCanvas, title, subtitle);
        tagTex.needsUpdate = true;
      }
    },
    /** Redraws the cap top only when its content changes. */
    setCap(contents: CapContent[]) {
      const key = JSON.stringify(contents.map((c) => [c.mark, c.caption, Math.round((c.alpha ?? 1) * 40)]));
      if (key === capKey) return;
      capKey = key;
      drawCapTop(capCanvas, contents);
      capTex.needsUpdate = true;
    },
    update(dt: number, t: number) {
      current.lerp(target, 1 - Math.exp(-dt * 4));
      honeyMat.color.copy(current).multiplyScalar(0.5);
      honeyMat.emissive.copy(current).multiplyScalar(0.1);
      rim.value.copy(current).lerp(new THREE.Color(0xffc060), 0.35);
      tagPivot.rotation.z = Math.sin(t * 1.3) * 0.06;
      tagPivot.rotation.y = Math.sin(t * 0.9) * 0.1 - 0.12;
    },
  };
}

/** World position of the centre of the cap top, for landing on it. */
export function capWorldPoint(jar: Jar, out = new THREE.Vector3()) {
  jar.capTop.updateWorldMatrix(true, false);
  return jar.capTop.getWorldPosition(out);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
