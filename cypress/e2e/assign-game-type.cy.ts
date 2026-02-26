describe("Assign game type to existing game", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should assign an existing game type from the game summary page", () => {
    cy.login();

    // Create a game type the user can select later
    cy.createGameType("Scrabble");

    // Create a game without a game type
    cy.createGameWithPlayers(2);

    // Submit scores and complete the game
    cy.submitScore("10");
    cy.submitScore("20");
    cy.completeGame();

    // We're on the summary page — should see "Set game type:" section
    cy.findByText("Set game type:").should("be.visible");

    // Select the game type
    cy.intercept("POST", "**/games/**").as("setGameType");
    cy.findByRole("button", { name: "Scrabble" }).should("be.visible").click();
    cy.wait("@setGameType");

    // The assignment UI should be replaced by the game type heading
    cy.findByText("Set game type:").should("not.exist");
  });

  it("should assign an existing game type from the play screen", () => {
    cy.login();

    // Create a game type the user can select later
    cy.createGameType("Sushi Go");

    // Create a game without a game type
    cy.createGameWithPlayers(2);

    // Should see "Set game type:" on the play screen
    cy.findByText("Set game type:").should("be.visible");

    // Select an existing game type
    cy.intercept("POST", "**/play/**").as("setGameType");
    cy.findByRole("button", { name: "Sushi Go" }).should("be.visible").click();
    cy.wait("@setGameType");

    // The assignment UI should be replaced by the game type heading
    cy.findByText("Set game type:").should("not.exist");
  });

  it("should not show assignment UI when game already has a type", () => {
    cy.login();

    // Create a game WITH a game type
    cy.createGameWithPlayers(2, "Molkky");

    // On play screen, should NOT see "Set game type:"
    cy.findByText("Set game type:").should("not.exist");

    // Complete the game to get to summary
    cy.submitScore("5");
    cy.submitScore("10");
    cy.completeGame();

    // On summary page, should NOT see "Set game type:"
    cy.findByText("Set game type:").should("not.exist");
  });
});
