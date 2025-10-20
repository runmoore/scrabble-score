import { faker } from "@faker-js/faker";

describe("negative score functionality", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow entering negative scores using +/− buttons", () => {
    const player1 = faker.person.firstName();
    const player2 = faker.person.firstName();

    cy.login();
    cy.visitAndCheck("/");

    // Create a new game with two players
    cy.findByRole("link", { name: /games/i }).click();
    cy.findByRole("link", { name: /\+ new game/i }).click();

    cy.findByRole("textbox", { name: /name/i }).type(player1);
    cy.findByRole("button", { name: /\+ Add new player/i }).click();
    cy.wait(500);

    cy.findByRole("textbox", { name: /name/i }).type(player2);
    cy.findByRole("button", { name: /\+ add new player/i }).click();
    cy.wait(500);

    cy.findByRole("checkbox", { name: player1 }).check();
    cy.findByRole("checkbox", { name: player2 }).check();

    cy.findByRole("button", { name: /start new game/i }).click();
    cy.url().should("include", /play/);

    // Test positive score entry (baseline)
    cy.findByRole("spinbutton", { name: /score/i }).type("10");
    cy.findByRole("button", { name: /submit score/i }).should(
      "not.be.disabled"
    );

    // Test +/− button functionality
    cy.findByRole("button", { name: "−" }).should("not.be.disabled");
    cy.findByRole("button", { name: "+" }).should("be.disabled");

    // Click minus button to make score negative
    cy.findByRole("button", { name: "−" }).click();
    cy.findByRole("spinbutton", { name: /score/i }).should("have.value", "-10");

    // After making negative, minus should be disabled, plus should be enabled
    cy.findByRole("button", { name: "−" }).should("be.disabled");
    cy.findByRole("button", { name: "+" }).should("not.be.disabled");

    // Submit negative score
    cy.findByRole("button", { name: /submit score/i }).click();
    cy.wait(500);

    // Verify negative score appears in the game (check for -10 in the score display)
    cy.contains("-10").should("be.visible");

    // Test positive score for second player
    cy.findByRole("spinbutton", { name: /score/i }).type("15");
    cy.findByRole("button", { name: /submit score/i }).click();
    cy.wait(500);

    // Go back to first player and test plus button functionality
    cy.findByRole("spinbutton", { name: /score/i }).type("5");

    // Make it negative first
    cy.findByRole("button", { name: "−" }).click();
    cy.findByRole("spinbutton", { name: /score/i }).should("have.value", "-5");

    // Now test plus button to make it positive again
    cy.findByRole("button", { name: "+" }).click();
    cy.findByRole("spinbutton", { name: /score/i }).should("have.value", "5");

    // Plus button should now be disabled, minus should be enabled
    cy.findByRole("button", { name: "+" }).should("be.disabled");
    cy.findByRole("button", { name: "−" }).should("not.be.disabled");

    // Submit positive score
    cy.findByRole("button", { name: /submit score/i }).click();
    cy.wait(500);

    // Test buttons are disabled when no score is entered
    cy.findByRole("button", { name: "−" }).should("be.disabled");
    cy.findByRole("button", { name: "+" }).should("be.disabled");

    // Enter a score and verify buttons become enabled appropriately
    cy.findByRole("spinbutton", { name: /score/i }).type("3");
    cy.findByRole("button", { name: "−" }).should("not.be.disabled");
    cy.findByRole("button", { name: "+" }).should("be.disabled");
  });

  it("should handle edge cases for +/− buttons", () => {
    const player1 = faker.person.firstName();
    const player2 = faker.person.firstName();

    cy.login();
    cy.visitAndCheck("/");

    // Create a game with two players (minimum required)
    cy.findByRole("link", { name: /games/i }).click();
    cy.findByRole("link", { name: /\+ new game/i }).click();

    cy.findByRole("textbox", { name: /name/i }).type(player1);
    cy.findByRole("button", { name: /\+ Add new player/i }).click();
    cy.wait(500);

    cy.findByRole("textbox", { name: /name/i }).type(player2);
    cy.findByRole("button", { name: /\+ Add new player/i }).click();
    cy.wait(500);

    cy.findByRole("checkbox", { name: player1 }).check();
    cy.findByRole("checkbox", { name: player2 }).check();
    cy.findByRole("button", { name: /start new game/i }).should(
      "not.be.disabled"
    );
    cy.findByRole("button", { name: /start new game/i }).click();

    cy.url().should("include", /play/);

    // Test with zero
    cy.findByRole("spinbutton", { name: /score/i }).type("0");
    cy.findByRole("button", { name: "−" }).should("not.be.disabled");
    cy.findByRole("button", { name: "−" }).click();
    cy.findByRole("spinbutton", { name: /score/i }).should("have.value", "-0");

    // Test clearing input resets button states
    cy.findByRole("spinbutton", { name: /score/i }).clear();
    cy.findByRole("button", { name: "−" }).should("be.disabled");
    cy.findByRole("button", { name: "+" }).should("be.disabled");

    // Test multiple digit numbers
    cy.findByRole("spinbutton", { name: /score/i }).type("123");
    cy.findByRole("button", { name: "−" }).click();
    cy.findByRole("spinbutton", { name: /score/i }).should(
      "have.value",
      "-123"
    );
    cy.findByRole("button", { name: "+" }).click();
    cy.findByRole("spinbutton", { name: /score/i }).should("have.value", "123");
  });
});
