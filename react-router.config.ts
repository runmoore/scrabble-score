import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
    v8_trailingSlashAwareDataRequests: true,
    v8_passThroughRequests: true,
  },
  // React Router rejects a form POST whose Origin differs from the request URL's
  // origin. Behind Fly's proxy the app sees http while browsers send https, so the
  // production host has to be allowed explicitly.
  allowedActionOrigins: ["scrabble-score-e630.fly.dev"],
} satisfies Config;
