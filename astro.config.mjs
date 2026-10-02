import { defineConfig } from "astro/config";

export default defineConfig({
  // PLACEHOLDER: replace with the real domain before launch (canonical + hreflang URLs).
  site: "https://highgrowthhoney.com",
  server: { port: 5179 },
  trailingSlash: "ignore",
  build: { format: "directory" },
  vite: {
    // The 3D layer is loaded lazily, so Vite would only discover these deps
    // mid-session and re-optimize (the "Outdated Optimize Dep" 504). Pre-bundle
    // them at startup instead.
    optimizeDeps: {
      include: [
        "three",
        "three/examples/jsm/loaders/GLTFLoader.js",
        "three/examples/jsm/environments/RoomEnvironment.js",
        "three/examples/jsm/utils/SkeletonUtils.js",
        "three/examples/jsm/libs/meshopt_decoder.module.js",
        "gsap",
        "lenis",
      ],
    },
  },
});
