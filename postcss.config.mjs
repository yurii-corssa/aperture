import postcssSortMediaQueries from "postcss-sort-media-queries";
import autoprefixer from "autoprefixer";
import postcssPresetEnv from "postcss-preset-env";
import cssnano from "cssnano";

export default {
  plugins: [
    postcssSortMediaQueries({ sort: "mobile-first" }),
    autoprefixer(),
    postcssPresetEnv({ stage: 2 }),
    cssnano(),
  ],
};
