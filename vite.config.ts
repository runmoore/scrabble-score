import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    // Vite defaults to 5173. Cypress (`test:e2e:dev`) expects 3000.
    port: 3000,
  },
  plugins: [
    remix({
      // Opt in early to the behaviour that becomes the default in React Router v7.
      // https://remix.run/docs/en/2.17.5/start/future-flags
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
  ],
});
