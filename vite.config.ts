import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Inject __BUILD_TIME__ into sw.js so each deploy gets a fresh cache key
function swVersion(): import("vite").Plugin {
  let buildTime = "";
  return {
    name: "sw-version",
    configResolved() {
      buildTime = String(Date.now());
    },
    transformIndexHtml: {
      order: "post",
      handler() {
        return [{ tag: "script", children: `window.__BUILD_TIME__ = "${buildTime}";`, injectTo: "head" }];
      },
    },
    closeBundle() {
      const base = "/KOTODOMA/";
      // Patch sw.js — replace build time
      const swPath = path.resolve(__dirname, "dist/sw.js");
      if (fs.existsSync(swPath)) {
        let content = fs.readFileSync(swPath, "utf-8");
        content = content.replace(/__BUILD_TIME__/g, buildTime);
        fs.writeFileSync(swPath, content);
      }
      // Patch manifest.json — inject base path for PWA
      const mfPath = path.resolve(__dirname, "dist/manifest.json");
      if (fs.existsSync(mfPath)) {
        let content = fs.readFileSync(mfPath, "utf-8");
        content = content.replace(/"start_url":\s*"\/"/, `"start_url": "${base}"`);
        content = content.replace(/"src":\s*"\/icons\//g, `"src": "${base}icons/`);
        fs.writeFileSync(mfPath, content);
      }
    },
  };
}

export default defineConfig({
  base: "/KOTODOMA/",
  plugins: [react(), swVersion()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
