// import imagemin from "imagemin";
// import imageminWebp from "imagemin-webp";
import path from "path";
import { defineConfig } from "vite";
import glob from "fast-glob";
import { fileURLToPath } from "url";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import tsconfigPaths from "vite-tsconfig-paths";
import injectHTML from "vite-plugin-html-inject";

// "imagemin-webp": "^8.0.0",
// "imagemin": "^8.0.1",

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    injectHTML(),
    ViteImageOptimizer({
      webp: { quality: 85 },
      svg: {
        plugins: [{ name: "removeViewBox", active: false }, { name: "sortAttrs" }],
      },
    }),
    // {
    //   ...imagemin(["./src/img/**/*.{jpg,png,jpeg}"], {
    //     destination: "./src/img/webp/",
    //     // plugins: [imageminWebp({ quality: 36 })],
    //   }),
    //   apply: "serve",
    // },
  ],
  base: "/",
  build: {
    minify: true, // disable minification
    rollupOptions: {
      input: Object.fromEntries(
        glob
          .sync(["./*.html", "./pages/**/*.html"])
          .map((file) => [
            path.relative(__dirname, file.slice(0, file.length - path.extname(file).length)),
            fileURLToPath(new URL(file, import.meta.url)),
          ])
      ),
      // output unminified CSS file
      output: {
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
