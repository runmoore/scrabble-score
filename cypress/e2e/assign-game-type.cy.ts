import { faker } from "@faker-js/faker";

describe("Assign game type to existing game", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  /**
   * Helper: creates a game without selecting a game type.
   * Adds players, selects them, and starts the game with N/A game type.
   */
  function createGameWithoutType(playerNames: string[]) {
    cy.visit("/games");
    cy.findByRole("link", { name: /\+ new game/i }).click();

    // Add all players
    playerNames.forEach((playerName, index) => {
      cy.intercept("POST", "**/games/new**").as(`addPlayer${index}`);
      cy.findByRole("textbox", { name: "name" })
        .should("be.visible")
        .and("not.be.disabled");
      cy.findByRole("textbox", { name: "name" }).clear();
      cy.findByRole("textbox", { name: "name" }).type(playerName);
      cy.findByRole("button", { name: /\+ Add new player/i }).click();
      cy.wait(`@addPlayer${index}`);
      cy.findByRole("textbox", { name: "name" }).should("have.value", "");
    });

    // Select all players
    playerNames.forEach((playerName) => {
      cy.findByRole("checkbox", { name: playerName })
        .should("be.visible")
        .check();
    });

    // Start game without selecting a game type (N/A is default)
    cy.intercept("POST", "**/games/new**").as("startGame");
    cy.findByRole("button", { name: /start new game/i })
      .should("not.be.disabled")
      .click();
    cy.wait("@startGame");

    // Wait for play page
    cy.url().should("include", /play/);
    cy.findByRole("spinbutton", { name: /score/i }).should("be.visible");
  }

  it("should assign an existing game type from the game summary page", () => {
    cy.login();

    const players = [faker.person.firstName(), faker.person.firstName()];

    // First, create a game type by creating a game with one
    cy.createGameWithPlayers(players);

    // Complete the game
    cy.intercept("POST", "**/play/**").as("completeGame");
    cy.findByRole("button", { name: /complete game/i }).click();
    cy.wait("@completeGame");

    // Now create a second game WITHOUT a game type
    createGameWithoutType(players);

    // Submit a score and complete the game
    cy.submitScore("10");
    cy.submitScore("20");
    cy.intercept("POST", "**/play/**").as("completeGame2");
    cy.findByRole("button", { name: /complete game/i }).click();
    cy.wait("@completeGame2");

    // We're on the summary page — should see "Set game type:" section
    cy.findByText("Set game type:").should("be.visible");

    // The game type from the first game should appear as a button
    // Find any game type button and click it
    cy.get('button[name="gameTypeId"]').first().should("be.visible").click();

    // The game type heading should now appear
    cy.findByText("Set game type:").should("not.exist");
  });

  it("should create and assign a new game type from the play screen", () => {
    cy.login();

    const players = [faker.person.firstName(), faker.person.firstName()];
    const newGameTypeName = `TestType${Date.now()}`;

    // Create a game without a game type
    createGameWithoutType(players);

    // Should see "Set game type:" on the play screen
    cy.findByText("Set game type:").should("be.visible");

    // Create a new game type inline and assign it
    cy.findByRole("textbox", { name: /new game type name/i })
      .should("be.visible")
      .type(newGameTypeName);

    cy.intercept("POST", "**/play/**").as("setGameType");
    cy.findByRole("button", { name: /\+ add & set/i }).click();
    cy.wait("@setGameType");

    // The game type heading should now appear
    cy.findByText(newGameTypeName).should("be.visible");
    cy.findByText("Set game type:").should("not.exist");
  });

  it("should not show assignment UI when game already has a type", () => {
    cy.login();

    // Create a game WITH a game type (using shared command)
    cy.createGameWithPlayers(2);

    // On play screen, should NOT see "Set game type:"
    cy.findByText("Set game type:").should("not.exist");

    // Complete the game to get to summary
    cy.submitScore("5");
    cy.submitScore("10");
    cy.intercept("POST", "**/play/**").as("completeGame");
    cy.findByRole("button", { name: /complete game/i }).click();
    cy.wait("@completeGame");

    // On summary page, should NOT see "Set game type:"
    cy.findByText("Set game type:").should("not.exist");
  });
});
