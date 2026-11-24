import { readdirSync } from "node:fs";
import path from "node:path";

import type { RouteConfigEntry } from "@react-router/dev/routes";

import routes from "./routes";

function filesIn(config: RouteConfigEntry[]): string[] {
  return config.flatMap((entry) => [
    entry.file,
    ...filesIn(entry.children ?? []),
  ]);
}

describe("route config", () => {
  it("lists every route file in app/routes", async () => {
    const routesDirectory = path.join(__dirname, "routes");
    const routeFilesOnDisk = readdirSync(routesDirectory, { recursive: true })
      .map(String)
      .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
      .map((file) => `routes/${file}`);

    expect(filesIn(await routes).sort()).toEqual(routeFilesOnDisk.sort());
  });
});
