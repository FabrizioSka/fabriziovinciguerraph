const esbuild = require("esbuild");

async function buildCss() {
  await esbuild.build({
    entryPoints: ["css/style.css"],
    bundle: true,
    minify: true,
    outfile: "_site/css/style.css",
    external: ["/assets/*", "../../assets/*"],
    logLevel: "info"
  });
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");

  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.addWatchTarget("./css/");

  eleventyConfig.on("eleventy.after", async () => {
    await buildCss();
  });

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};