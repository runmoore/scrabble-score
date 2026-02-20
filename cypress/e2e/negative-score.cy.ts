/**
 * Negative Score Functionality Tests
 * Tests +/- button behavior using shared commands for efficiency
 */
describe("Negative Score Functionality", () => {
  beforeEach(() => {
    cy.login();
    cy.quickStartGame(); // Use shared command for consistent setup
  });

  afterEach(() => {
    cy.cleanupUser();
  });

  it("should handle +/- button functionality for score input", () => {
    // Test positive score entry (baseline)
    cy.findByRole("spinbutton", { name: /score/i })
      .clear()
      .type("10")
      .should("have.value", "10"); // Wait for value to be set

    cy.checkButtonStates(true, false); // minus enabled, plus disabled
    cy.toggleNegativeScoreSign();

    // Verify the value changed to negative
    cy.findByRole("spinbutton", { name: /score/i }).should("have.value", "-10");

    // After making negative: minus disabled, plus enabled
    cy.checkButtonStates(false, true);
    cy.togglePlusScoreSign();

    // Verify the value changed back to positive
    cy.findByRole("spinbutton", { name: /score/i }).should("have.value", "10");

    // Back to: minus enabled, plus disabled
    cy.checkButtonStates(true, false);

    // Submit the positive score
    cy.submitScore("");
  });

  it("should integrate negative scores with complete game workflow", () => {
    // Player 1: Submit positive score
    cy.findByRole("spinbutton", { name: /score/i }).type("15");
    cy.findByRole("spinbutton", { name: /score/i }).should("have.value", "15");
    cy.submitScore("");

    // Player 2: Submit negative score
    cy.findByRole("spinbutton", { name: /score/i }).type("5");
    cy.findByRole("spinbutton", { name: /score/i }).should("have.value", "5");
    cy.toggleNegativeScoreSign();
    cy.submitScore("");

    // Complete the game
    cy.intercept("POST", "**/play/**").as("completeGame");
    cy.findByRole("button", { name: /complete game/i }).click();
    cy.wait("@completeGame");

    // Verify the player with positive score wins
    cy.findByText(/has won with a score of 15/i).should("be.visible");
  });

  it("should handle multiple negative score submissions", () => {
    // Test submitting multiple scores with mixed positive/negative
    const scoreData = [
      { score: "10", negative: false },
      { score: "5", negative: true },
      { score: "20", negative: false },
    ];

    cy.submitMultipleScores(scoreData);

    // Should still be in the game after multiple submissions
    cy.url().should("include", /play/);
  });
});
