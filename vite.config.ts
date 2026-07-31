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
      // sw.js is copied from public/ — patch it after build
      const swPath = path.resolve(__dirname, "dist/sw.js");
      if (fs.existsSync(swPath)) {
        let content = fs.readFileSync(swPath, "utf-8");
        content = content.replace(/__BUILD_TIME__/g, buildTime);
        fs.writeFileSync(swPath, content);
      }
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [react(), swVersion()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
