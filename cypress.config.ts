import { execFileSync } from "node:child_process";

import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents: (on, config) => {
      const isDev = config.watchForFileChanges;
      const port = process.env.PORT ?? (isDev ? "3000" : "8811");
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        baseUrl: `http://localhost:${port}`,
        video: !process.env.CI,
        screenshotOnRunFailure: !process.env.CI,
      };

      // To use this:
      // cy.task('log', whateverYouWantInTheTerminal)
      const runScript = (script: string, email: string) =>
        execFileSync("npx", ["tsx", script, email], {
          cwd: config.projectRoot,
          encoding: "utf8",
        });

      on("task", {
        log: (message) => {
          console.log(message);

          return null;
        },
        createUser: (email: string) =>
          runScript("./cypress/support/create-user.ts", email)
            .replace(
              /.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s,
              "$<cookieValue>"
            )
            .trim(),
        deleteUser: (email: string) => {
          runScript("./cypress/support/delete-user.ts", email);

          return null;
        },
      });

      return { ...config, ...configOverrides };
    },
  },
});
