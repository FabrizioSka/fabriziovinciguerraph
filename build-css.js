const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["css/style.css"],
  bundle: true,
  minify: true,
  outfile: "_site/css/style.css",
  external: ["/assets/*", "../../assets/*"],
  logLevel: "info"
}).catch(() => process.exit(1));