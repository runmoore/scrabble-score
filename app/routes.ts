import type { RouteConfig } from "@remix-run/route-config";
import { remixRoutesOptionAdapter } from "@remix-run/routes-option-adapter";
import { createRoutesFromFolders } from "@remix-run/v1-route-convention";

export default remixRoutesOptionAdapter((defineRoutes) => {
  // uses the v1 convention, works in v1.15+ and v2
  return createRoutesFromFolders(defineRoutes, {
    ignoredFilePatterns: [".*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  });
}) satisfies RouteConfig;
