import { faker } from "@faker-js/faker";

describe("Assign game type to existing game", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

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
    cy.createGameWithPlayers(players, { skipGameType: true });

    // Submit a score and complete the game
    cy.submitScore("10");
    cy.submitScore("20");
    cy.intercept("POST", "**/play/**").as("completeGame2");
    cy.findByRole("button", { name: /complete game/i }).click();
    cy.wait("@completeGame2");

    // We're on the summary page — should see "Set game type:" section
    cy.findByText("Set game type:").should("be.visible");

    // The game type from the first game should appear as a button
    cy.get('button[name="gameTypeId"]').first().should("be.visible").click();

    // The game type heading should now appear
    cy.findByText("Set game type:").should("not.exist");
  });

  it("should assign an existing game type from the play screen", () => {
    cy.login();

    const players = [faker.person.firstName(), faker.person.firstName()];

    // First, create a game type by creating a game with one
    cy.createGameWithPlayers(players);

    // Complete the game
    cy.intercept("POST", "**/play/**").as("completeGame");
    cy.findByRole("button", { name: /complete game/i }).click();
    cy.wait("@completeGame");

    // Now create a second game WITHOUT a game type
    cy.createGameWithPlayers(players, { skipGameType: true });

    // Should see "Set game type:" on the play screen
    cy.findByText("Set game type:").should("be.visible");

    // Select an existing game type
    cy.intercept("POST", "**/play/**").as("setGameType");
    cy.get('button[name="gameTypeId"]').first().should("be.visible").click();
    cy.wait("@setGameType");

    // The assignment UI should be replaced by the game type heading
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
