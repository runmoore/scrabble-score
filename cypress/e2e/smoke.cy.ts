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

    // Use shared command to create game with players and game type
    cy.createGameWithPlayers(2, "Scrabble").then((players) => {
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
});
