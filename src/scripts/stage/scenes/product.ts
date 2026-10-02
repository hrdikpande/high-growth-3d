import * as THREE from "three";
import gsap from "gsap";
import { engine, damp, rand, ndcToWorld } from "../engine";
import { createJar, loadImage, capWorldPoint, JAR_W } from "../jar";
import { Bee, loadBeeTemplate, type Region } from "../bee";
import { BannerBee } from "../banner";
import { scroll } from "../../scroll";
import { createPlinth, slotOf, dropJar, capDiameter, renderJarShots, pointerSmooth, type JarMotion } from "../common";

/**
 * Product page: the jar for this honey stands on a plinth in the sticky viewer
 * and turns when dragged. The bee flies in, circles it and lands on the cap,
 * then keeps a sit / roam / land loop going.
 */
export async function run(config: { lang: string; data: any; banners: Record<string, string> }) {
  const { color, label, name, type } = config.data as { color: string; label: string; name: string; type: string };
  const [tpl, photo] = await Promise.all([loadBeeTemplate(), loadImage("/images/honey-jar.webp").catch(() => null)]);

  renderJarShots(photo, {});

  const stage = document.querySelector<HTMLElement>('[data-anchor="product-stage"]')!;
  const drag = document.querySelector<HTMLElement>("[data-drag]");

  const jar = createJar(photo, color, label);
  jar.setTag(name, type);
  jar.group.visible = false;
  engine.scene.add(jar.group);
  const plinth = createPlinth();

  const bee = new Bee(tpl, engine.scene).withTrail(engine.scene);
  bee.root.visible = false;
  let banner: BannerBee | null = null;
  BannerBee.create(config.banners.marketplace, config.lang).then((b) => (banner = b));

  const m: JarMotion = { drop: 0, tilt: 0 };
  const spin = { y: -0.35, vel: 0, dragging: false, lastX: 0 };
  let token = 0;

  // Drag to turn the jar, with a little inertia.
  drag?.addEventListener("pointerdown", (e) => {
    spin.dragging = true;
    spin.lastX = e.clientX;
    drag.setPointerCapture(e.pointerId);
  });
  drag?.addEventListener("pointermove", (e) => {
    if (!spin.dragging) return;
    const dx = e.clientX - spin.lastX;
    spin.lastX = e.clientX;
    spin.vel = dx * 0.012;
    spin.y += spin.vel;
  });
  const release = () => (spin.dragging = false);
  drag?.addEventListener("pointerup", release);
  drag?.addEventListener("pointercancel", release);

  const slot = () => slotOf(stage);
  const cap = () => capWorldPoint(jar);
  const landSize = () => capDiameter(slot().h) * 0.48;
  const roamSize = () => slot().h * 0.32;

  function besideJar(): Region {
    const s = slot();
    const side = Math.random() < 0.6 ? (bee.pos.x >= s.x ? -1 : 1) : bee.pos.x >= s.x ? 1 : -1;
    const x = s.x + side * (s.h * JAR_W * 0.5 + bee.size * 0.6 + rand(0, s.h * 0.15));
    const y = s.y + s.h * rand(0.5, 1.05);
    return { x: [x, x], y: [y, y], z: [-0.3, 0.6] };
  }

  function orbit(): Promise<void> {
    const s0 = slot();
    const phase = { v: bee.pos.x < s0.x ? Math.PI : 0 };
    const end = phase.v === Math.PI ? Math.PI * 2.5 : -Math.PI * 1.5;
    bee.chase(() => {
      const s = slot();
      const rx = s.h * JAR_W * 0.5 + bee.size * 0.6;
      return new THREE.Vector3(s.x + Math.cos(phase.v) * rx, s.y + s.h * 0.62 + Math.sin(phase.v * 2) * s.h * 0.08, Math.sin(phase.v) * 1.2);
    }, 16);
    gsap.to(bee, { size: roamSize(), duration: 2, ease: "sine.inOut" });
    return new Promise((resolve) => gsap.to(phase, { v: end, duration: 3.2, ease: "sine.inOut", onComplete: () => resolve() }));
  }

  function cycle() {
    const my = ++token;
    bee.land(cap, landSize()).then(() => {
      if (my !== token) return;
      gsap.delayedCall(rand(4, 6), () => {
        if (my !== token) return;
        bee.takeOff(roamSize(), besideJar).then(() =>
          gsap.delayedCall(rand(5, 7), () => {
            if (my !== token) return;
            if (Math.random() < 0.5) orbit().then(() => my === token && cycle());
            else cycle();
          }),
        );
      });
    });
  }

  engine.ticks.add((dt, t) => {
    const s = slot();
    if (!spin.dragging) {
      spin.vel = damp(spin.vel, 0, 3, dt);
      spin.y += spin.vel + dt * 0.08; // slow idle turn
    }
    const corner = (m.tilt > 0 ? -1 : 1) * s.h * JAR_W * 0.45;
    jar.group.position.set(s.x + corner - corner * Math.cos(m.tilt), s.y + m.drop - corner * Math.sin(m.tilt), 0);
    jar.group.scale.setScalar(s.h);
    jar.group.rotation.set(0, spin.y, m.tilt, "XYZ");
    jar.update(dt, t);
    plinth.place(s, m.drop);
    bee.update(dt, t, pointerSmooth);
    banner?.update(dt, t);
  });

  if (engine.reduceMotion) {
    jar.group.visible = true;
    bee.root.visible = true;
    bee.size = landSize();
    bee.life = 0;
    bee.yaw = -0.6;
    bee.perch = cap;
    bee.mode = "perched";
    if (bee.idle) {
      bee.hover.stop();
      bee.idle.play();
    }
    return;
  }

  // Intro: jar drops, bee arrives, circles and lands.
  const tl = gsap.timeline();
  tl.add(() => (jar.group.visible = true), 0.3);
  const impact = dropJar(tl, 0.3, m, slot().h);
  tl.add(() => {
    const s = slot();
    bee.root.visible = true;
    bee.size = roamSize() * 1.6;
    bee.pos.copy(ndcToWorld(-1.3, 0.3, 0.5));
    bee.wander(() => ({ x: [s.x - s.h * 0.7, s.x - s.h * 0.5], y: [s.y + s.h * 0.8, s.y + s.h], z: [0.2, 0.6] }));
  }, impact + 0.2);
  tl.add(() => orbit().then(cycle), impact + 1.6);
  tl.add(() => banner?.fly(engine.view.mobile ? 0.82 : 0.78, 0.4, 1, 8), impact + 6);

  // Scrolling the details shakes her loose for a lap, trail and all.
  // (Checked from the render loop with Lenis' velocity, no scroll listener.)
  let lastScroll = 0;
  engine.ticks.add(() => {
    const now = performance.now();
    if (bee.mode !== "perched" || now - lastScroll < 9000 || Math.abs(scroll.velocity) < 8) return;
    lastScroll = now;
    token++;
    bee.takeOff(roamSize(), besideJar).then(() => {
      bee.doTrick("roll");
      gsap.delayedCall(3, cycle);
    });
  });
}
