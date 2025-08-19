import path from "path";
import { defineConfig } from "vite";
import glob from "fast-glob";
import { fileURLToPath } from "url";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import tsconfigPaths from "vite-tsconfig-paths";
import injectHTML from "vite-plugin-html-inject";

// ESLint: ignore no-undef for __dirname and URL
/* global __dirname, URL */

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    injectHTML(),
    ViteImageOptimizer({
      svg: {
        plugins: [{ name: "removeViewBox", active: false }, { name: "sortAttrs" }],
      },
    }),
  ],
  base: "/",
  build: {
    minify: true, // Use default minification (esbuild)
    sourcemap: false, // Disable source maps for production
    rollupOptions: {
      input: Object.fromEntries(
        glob
          .sync(["./*.html", "./pages/**/*.html"])
          .map((file) => [
            path.relative(__dirname, file.slice(0, file.length - path.extname(file).length)),
            fileURLToPath(new URL(file, import.meta.url)),
          ])
      ),
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];

          // Зображення (включаючи WebP)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }

          // Відео файли
          if (/mp4|webm|avi|mov|mkv|flv|wmv/i.test(ext)) {
            return `assets/video/[name]-[hash][extname]`;
          }

          // CSS файли
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }

          // JavaScript файли
          if (/js/i.test(ext)) {
            return `assets/js/[name]-[hash][extname]`;
          }

          // Всі інші файли
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
      },
    },
  },
});
