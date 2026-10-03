import { engine, initEngine } from "./engine";

/**
 * Boots the shared 3D layer and hands over to the page's scene. Each scene
 * module is loaded on demand so pages only pay for what they use.
 */

type Config = { scene: string; lang: string; data: any; banners: Record<string, string> };

const canvas = document.querySelector<HTMLCanvasElement>(".stage-canvas");
const config: Config = JSON.parse(document.getElementById("stage-config")?.textContent ?? "{}");

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function showStaticContent() {
  document.querySelectorAll<HTMLElement>("[data-from]").forEach((el) => (el.style.opacity = "1"));
}

async function boot() {
  if (!canvas || !webglAvailable()) {
    showStaticContent();
    return;
  }
  initEngine(canvas);
  try {
    await document.fonts?.ready;
    const scenes: Record<string, () => Promise<{ run: (c: Config) => Promise<void> }>> = {
      home: () => import("./scenes/home"),
      product: () => import("./scenes/product"),
      catalogue: () => import("./scenes/pages"),
      about: () => import("./scenes/pages"),
      contact: () => import("./scenes/pages"),
      ambient: () => import("./scenes/pages"),
    };
    const mod = await (scenes[config.scene] ?? scenes.ambient)();
    await mod.run(config);
  } catch (err) {
    console.error("3D stage failed", err);
    showStaticContent();
    engine.ticks.clear();
  }
}

boot();
