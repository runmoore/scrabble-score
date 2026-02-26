import { faker } from "@faker-js/faker";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with a random user. Yields the user and adds an alias to the user
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login({ email: 'whatever@example.com' })
       */
      login: typeof login;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupUser}
       * @memberof Chainable
       * @example
       *    cy.cleanupUser()
       * @example
       *    cy.cleanupUser({ email: 'whatever@example.com' })
       */
      cleanupUser: typeof cleanupUser;

      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       *  @example
       *    cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck;

      // =============================================================================
      // GAME-SPECIFIC COMMANDS
      // =============================================================================

      /**
       * Creates a game with specified players
       * @param players - Array of player names, or number to auto-generate
       * @param options - Optional config: skipGameType to create without a game type
       * @example cy.createGameWithPlayers(['Alice', 'Bob'])
       * @example cy.createGameWithPlayers(3)
       * @example cy.createGameWithPlayers(['Alice', 'Bob'], { skipGameType: true })
       */
      createGameWithPlayers: typeof createGameWithPlayers;

      /**
       * Submits a score for the current player
       * @param score - Score to submit (can be positive or negative)
       * @example cy.submitScore('15')
       */
      submitScore: typeof submitScore;

      /**
       * Checks the enabled/disabled state of +/- buttons
       * @param minusEnabled - Whether minus button should be enabled
       * @param plusEnabled - Whether plus button should be enabled
       * @example cy.checkButtonStates(true, false)
       */
      checkButtonStates: typeof checkButtonStates;

      /**
       * Toggles score sign using +/- buttons
       * @param makeNegative - True for negative, false for positive
       * @example cy.toggleScoreSign(true)
       */
      togglePlusScoreSign: typeof togglePlusScoreSign;
      toggleNegativeScoreSign: typeof toggleNegativeScoreSign;

      /**
       * Navigates to games page safely
       * @example cy.goToGames()
       */
      goToGames: typeof goToGames;

      /**
       * Creates a quick test game with default players
       * @param playerCount - Number of players (default: 2)
       * @example cy.quickStartGame()
       */
      quickStartGame: typeof quickStartGame;

      /**
       * Submits multiple scores in sequence for testing
       * @param scores - Array of scores to submit
       * @example cy.submitMultipleScores(['10', '-5', '20'])
       */
      submitMultipleScores: typeof submitMultipleScores;
    }
  }
}

function login({
  email = faker.internet.email(undefined, undefined, "example.com"),
}: {
  email?: string;
} = {}) {
  cy.then(() => ({ email })).as("user");
  cy.exec(`npx tsx ./cypress/support/create-user.ts "${email}"`).then(
    ({ stdout }) => {
      const cookieValue = stdout
        .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
        .trim();
      cy.setCookie("__session", cookieValue);
    }
  );
  return cy.get("@user");
}

function cleanupUser({ email }: { email?: string } = {}) {
  if (email) {
    deleteUserByEmail(email);
  } else {
    cy.get("@user").then((user) => {
      const email = (user as { email?: string }).email;
      if (email) {
        deleteUserByEmail(email);
      }
    });
  }
  cy.clearCookie("__session");
}

function deleteUserByEmail(email: string) {
  cy.exec(`npx tsx ./cypress/support/delete-user.ts "${email}"`);
  cy.clearCookie("__session");
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime: number = 1500) {
  cy.visit(url);
  cy.location("pathname").should("contain", url).wait(waitTime);
}

export const registerCommands = () => {
  Cypress.Commands.add("login", login);
  Cypress.Commands.add("cleanupUser", cleanupUser);
  Cypress.Commands.add("visitAndCheck", visitAndCheck);

  // Game-specific commands
  Cypress.Commands.add("createGameWithPlayers", createGameWithPlayers);
  Cypress.Commands.add("submitScore", submitScore);
  Cypress.Commands.add("checkButtonStates", checkButtonStates);
  Cypress.Commands.add("togglePlusScoreSign", togglePlusScoreSign);
  Cypress.Commands.add("toggleNegativeScoreSign", toggleNegativeScoreSign);
  Cypress.Commands.add("goToGames", goToGames);
  Cypress.Commands.add("quickStartGame", quickStartGame);
  Cypress.Commands.add("submitMultipleScores", submitMultipleScores);
};

// =============================================================================
// GAME-SPECIFIC COMMAND IMPLEMENTATIONS
// =============================================================================

function createGameWithPlayers(
  players: string[] | number,
  options: { skipGameType?: boolean } = {}
) {
  let playerNames: string[];

  if (typeof players === "number") {
    playerNames = Array.from({ length: players }, () =>
      faker.person.firstName()
    );
  } else {
    playerNames = players;
  }

  if (playerNames.length < 2) {
    throw new Error("Games require at least 2 players");
  }

  cy.visit("/games");
  cy.findByRole("link", { name: /\+ new game/i }).click();

  // Wait for the new game form to be fully loaded
  cy.findByRole("textbox", { name: /game type name/i })
    .should("be.visible")
    .and("not.be.disabled");

  if (!options.skipGameType) {
    // Add and select a game type
    const gameTypeName = faker.word.noun();
    cy.intercept("POST", "**/games/new**").as("addGameType");
    cy.findByRole("textbox", { name: /game type name/i }).type(gameTypeName);
    cy.findByRole("button", { name: /\+ add new game type/i }).click();
    cy.wait("@addGameType");

    cy.findByRole("radio", { name: new RegExp(gameTypeName, "i") })
      .should("be.visible")
      .check();
  }

  // Add all players
  playerNames.forEach((playerName, index) => {
    // Set up intercept before the action that will trigger it
    cy.intercept("POST", "**/games/new**").as(`addPlayer${index}`);

    // Wait for input to be ready, then interact with it
    cy.findByRole("textbox", { name: "name" })
      .should("be.visible")
      .and("not.be.disabled");
    cy.findByRole("textbox", { name: "name" }).clear();
    cy.findByRole("textbox", { name: "name" }).type(playerName);

    cy.findByRole("button", { name: /\+ Add new player/i }).click();
    cy.wait(`@addPlayer${index}`);

    // Wait for the form to reset/reload after adding player
    cy.findByRole("textbox", { name: "name" }).should("have.value", "");
  });

  // Select all players - wait for each checkbox to be available
  playerNames.forEach((playerName) => {
    cy.findByRole("checkbox", { name: playerName })
      .should("be.visible")
      .check();
  });

  // Start the game - set up intercept before clicking
  cy.intercept("POST", "**/games/new**").as("startGame");
  cy.findByRole("button", { name: /start new game/i })
    .should("not.be.disabled")
    .click();
  cy.wait("@startGame");

  // Wait for navigation to play page
  cy.url().should("include", /play/);
  // Ensure the game interface is loaded
  cy.findByRole("spinbutton", { name: /score/i }).should("be.visible");

  // Return player names for further use
  return cy.wrap(playerNames);
}

function submitScore(score: string) {
  if (score) {
    cy.findByRole("spinbutton", { name: /score/i })
      .should("be.visible")
      .clear();
    cy.findByRole("spinbutton", { name: /score/i }).type(score);
  }

  cy.findByRole("button", { name: /submit score/i })
    .should("be.visible")
    .and("not.be.disabled");

  cy.intercept("POST", "**/play/**").as("submitScore");
  cy.findByRole("button", { name: /submit score/i }).click();
  cy.wait("@submitScore").then((interception) => {
    expect(interception.response?.statusCode).to.be.oneOf([200, 204]);
  });
}

function checkButtonStates(minusEnabled: boolean, plusEnabled: boolean) {
  // Check minus button state with automatic retry logic
  cy.findByRole("button", { name: "-" })
    .should("be.visible")
    .and(minusEnabled ? "not.be.disabled" : "be.disabled");

  // Check plus button state with automatic retry logic
  cy.findByRole("button", { name: "+" })
    .should("be.visible")
    .and(plusEnabled ? "not.be.disabled" : "be.disabled");
}

function togglePlusScoreSign() {
  cy.findByRole("button", { name: "+" })
    .should("be.visible")
    .and("not.be.disabled")
    .click();
}

function toggleNegativeScoreSign() {
  cy.findByRole("button", { name: "-" })
    .should("be.visible")
    .and("not.be.disabled")
    .click();
}

// function toggleScoreSign(makeNegative: boolean) {
//   const buttonName = makeNegative ? "-" : "+";
//   cy.findByRole("button", { name: buttonName }).click();
// }

function goToGames() {
  cy.visit("/games");
}

function quickStartGame(playerCount: number = 2) {
  return createGameWithPlayers(playerCount);
}

function submitMultipleScores(
  scores: Array<{ score: string; negative?: boolean }>
) {
  scores.forEach(({ score, negative = false }) => {
    // Clear any existing value
    cy.findByRole("spinbutton", { name: /score/i }).clear();

    // Re-query and type new score (avoids detached element)
    cy.findByRole("spinbutton", { name: /score/i }).type(score);

    // Re-query and verify value was set (waits for React state)
    cy.findByRole("spinbutton", { name: /score/i }).should("have.value", score);

    if (negative) {
      cy.toggleNegativeScoreSign();
      // Verify the value became negative (re-query again)
      cy.findByRole("spinbutton", { name: /score/i }).should(
        "have.value",
        `-${score}`
      );
    }

    cy.submitScore("");
  });
}
/*
eslint
  @typescript-eslint/no-namespace: "off",
*/
