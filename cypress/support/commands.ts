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
       * @example cy.createGameWithPlayers(['Alice', 'Bob'])
       * @example cy.createGameWithPlayers(3)
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
function visitAndCheck(url: string, waitTime: number = 1000) {
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

function createGameWithPlayers(players: string[] | number) {
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

  // Add all players
  playerNames.forEach((playerName) => {
    cy.findByRole("textbox", { name: /name/i }).should("not.be.disabled");
    cy.findByRole("textbox", { name: /name/i }).clear();
    cy.findByRole("textbox", { name: /name/i }).type(playerName);
    cy.intercept("POST", "**/games/new**").as("addPlayer");
    cy.findByRole("button", { name: /\+ Add new player/i }).click();
    cy.wait("@addPlayer");
  });

  // Select all players
  playerNames.forEach((playerName) => {
    cy.findByRole("checkbox", { name: playerName }).check();
  });

  // Start the game
  cy.intercept("POST", "**/games/new**").as("startGame");
  cy.findByRole("button", { name: /start new game/i }).click();
  cy.wait("@startGame");

  cy.url().should("include", /play/);

  // Return player names for further use
  return cy.wrap(playerNames);
}

function submitScore(score: string) {
  if (score) {
    cy.findByRole("spinbutton", { name: /score/i }).clear();
    cy.findByRole("spinbutton", { name: /score/i }).type(score);
  }

  cy.findByRole("button", { name: /submit score/i }).should("not.be.disabled");

  cy.intercept("POST", "**/play/**").as("submitScore");
  cy.findByRole("button", { name: /submit score/i }).click();
  cy.wait("@submitScore").then((interception) => {
    expect(interception.response?.statusCode).to.be.oneOf([200, 204]);
  });
}

function checkButtonStates(minusEnabled: boolean, plusEnabled: boolean) {
  cy.findByRole("button", { name: "-" }).should(
    minusEnabled ? "not.be.disabled" : "be.disabled"
  );
  cy.findByRole("button", { name: "+" }).should(
    plusEnabled ? "not.be.disabled" : "be.disabled"
  );
}

function togglePlusScoreSign() {
  cy.findByRole("button", { name: "+" }).click();
}

function toggleNegativeScoreSign() {
  cy.findByRole("button", { name: "-" }).click();
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

function submitMultipleScores(scores: Array<{ score: string; negative?: boolean }>) {
  scores.forEach(({ score, negative = false }) => {
    cy.findByRole("spinbutton", { name: /score/i }).type(score);

    if (negative) {
      cy.toggleNegativeScoreSign();
    }

    cy.submitScore("");
  });
}
/*
eslint
  @typescript-eslint/no-namespace: "off",
*/
