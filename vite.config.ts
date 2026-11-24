import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    // Vite defaults to 5173. Cypress (`test:e2e:dev`) expects 3000.
    port: 3000,
  },
  plugins: [reactRouter(), tsconfigPaths()],
});
