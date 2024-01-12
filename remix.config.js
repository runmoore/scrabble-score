const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/*"],
  serverModuleFormat: "cjs",
  routes(defineRoutes) {
    // uses the v1 convention, works in v1.15+ and v2
    return createRoutesFromFolders(defineRoutes, {
      ignoredFilePatterns: [".*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
    });
  },
};
