import type { RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

// Routes come from the file names in `app/routes/`. Tests live beside their routes,
// so they are ignored here.
export default flatRoutes({
  ignoredRouteFiles: ["**/*.test.{ts,tsx}"],
}) satisfies RouteConfig;
