import * as THREE from "three";

/**
 * Dotted trail: points dropped at even spacing behind a moving bee, each
 * fading and shrinking over its lifetime. One draw call per trail.
 */
const MAX = 160;

const vertex = /* glsl */ `
  attribute float age;
  uniform float uLife;
  uniform float uScale;
  varying float vFade;
  void main() {
    float k = clamp(age / uLife, 0.0, 1.0);
    vFade = 1.0 - k;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uScale * (0.35 + 0.65 * vFade) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vFade;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.3, d) * vFade * 0.9;
    gl_FragColor = vec4(uColor, a);
  }
`;

export class Trail {
  points: THREE.Points;
  private positions = new Float32Array(MAX * 3);
  private ages = new Float32Array(MAX).fill(999);
  private head = 0;
  private last = new THREE.Vector3(Infinity, 0, 0);
  spacing = 0.12;
  life = 1.6;

  constructor(scene: THREE.Scene, color = "#f0b43c") {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    g.setAttribute("age", new THREE.BufferAttribute(this.ages, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uLife: { value: this.life },
        uScale: { value: 90 },
      },
    });
    this.points = new THREE.Points(g, m);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    scene.add(this.points);
  }

  setScale(pixelsAtUnitDepth: number) {
    (this.points.material as THREE.ShaderMaterial).uniforms.uScale.value = pixelsAtUnitDepth;
  }

  /** Call every frame with the emitter position; drops a dot every `spacing`. */
  feed(p: THREE.Vector3, emitting: boolean) {
    if (emitting && this.last.distanceTo(p) >= this.spacing) {
      const i = this.head;
      this.positions[i * 3] = p.x;
      this.positions[i * 3 + 1] = p.y;
      this.positions[i * 3 + 2] = p.z;
      this.ages[i] = 0;
      this.head = (this.head + 1) % MAX;
      this.last.copy(p);
    }
    if (!emitting) this.last.set(Infinity, 0, 0);
  }

  update(dt: number) {
    for (let i = 0; i < MAX; i++) this.ages[i] += dt;
    const g = this.points.geometry;
    g.attributes.age.needsUpdate = true;
    g.attributes.position.needsUpdate = true;
  }
}
