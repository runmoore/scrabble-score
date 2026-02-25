import { faker } from "@faker-js/faker";

/**
 * Smoke Tests - Core Application Functionality
 * Uses shared commands for consistent and efficient testing
 */
describe("Smoke Tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow user registration and login flow", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };

    cy.then(() => ({ email: loginForm.email })).as("user");
    cy.visitAndCheck("/");

    // Registration flow
    cy.findByRole("link", { name: /sign up/i }).click();
    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();

    // Navigate to games and logout
    cy.findByRole("link", { name: /games/i }).click();
    cy.findByRole("button", { name: /logout/i }).click();
    cy.findByRole("link", { name: /log in/i });
  });

  it("should support complete game workflow with shared commands", () => {
    cy.login();

    // Use shared command to create game with players
    cy.createGameWithPlayers(2).then((players) => {
      expect(players).to.have.length(2);

      // Use shared command to submit scores
      cy.submitScore("5"); // Player 1: 5 points
      cy.submitScore("11"); // Player 2: 11 points

      // Complete the game using intercept for reliability
      cy.intercept("POST", "**/play/**").as("completeGame");
      cy.findByRole("button", { name: /complete game/i }).click();
      cy.wait("@completeGame");

      // Verify winner announcement (Player 2 with higher score)
      cy.findByText(`${players[1]} has won with a score of 11`).should(
        "be.visible"
      );
    });
  });

  it("should support game workflow with game type", () => {
    cy.login();
    cy.visit("/games");
    cy.findByRole("link", { name: /\+ new game/i }).click();

    // Add a game type
    cy.findByRole("textbox", { name: /game type name/i })
      .should("be.visible")
      .and("not.be.disabled");

    cy.intercept("POST", "**/games/new**").as("addGameType");
    cy.findByRole("textbox", { name: /game type name/i }).type("Scrabble");
    cy.findByRole("button", { name: /\+ add new game type/i }).click();
    cy.wait("@addGameType");

    // Verify game type appears as a radio button and select it
    cy.findByRole("radio", { name: /scrabble/i })
      .should("be.visible")
      .check();

    // Add players
    const playerNames = ["Alice", "Bob"];
    playerNames.forEach((name, index) => {
      cy.intercept("POST", "**/games/new**").as(`addPlayer${index}`);
      cy.findByRole("textbox", { name: /^name$/i })
        .should("be.visible")
        .clear();
      cy.findByRole("textbox", { name: /^name$/i }).type(name);
      cy.findByRole("button", { name: /\+ add new player/i }).click();
      cy.wait(`@addPlayer${index}`);
      cy.findByRole("textbox", { name: /^name$/i }).should("have.value", "");
    });

    // Select players and start game
    playerNames.forEach((name) => {
      cy.findByRole("checkbox", { name }).should("be.visible").check();
    });

    cy.intercept("POST", "**/games/new**").as("startGame");
    cy.findByRole("button", { name: /start new game/i })
      .should("not.be.disabled")
      .click();
    cy.wait("@startGame");

    // Verify game type is displayed on play screen
    cy.url().should("include", "/play/");
    cy.findByText("Scrabble").should("be.visible");

    // Submit scores and complete game
    cy.submitScore("10");
    cy.submitScore("20");

    cy.intercept("POST", "**/play/**").as("completeGame");
    cy.findByRole("button", { name: /complete game/i }).click();
    cy.wait("@completeGame");

    // Verify game type is displayed on game summary
    cy.findByText("Scrabble").should("be.visible");
    cy.findByText("Bob has won with a score of 20").should("be.visible");
  });
});
