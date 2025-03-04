import postcssSortMediaQueries from "postcss-sort-media-queries";
import postcssPresetEnv from "postcss-preset-env";
import autoprefixer from "autoprefixer";

export default {
  plugins: [
    postcssSortMediaQueries({ sort: "mobile-first" }),
    postcssPresetEnv({ stage: 0 }),
    autoprefixer(),
  ],
};
