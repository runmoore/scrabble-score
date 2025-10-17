import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };

    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();

    cy.findByRole("link", { name: /games/i }).click();
    cy.findByRole("button", { name: /logout/i }).click();
    cy.findByRole("link", { name: /log in/i });
  });

  it("should allow you to add new players, start a new game, and start playing", () => {
    const player1 = faker.person.firstName();
    const player2 = faker.person.firstName();

    cy.login();
    cy.visitAndCheck("/");

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

    cy.findByRole("textbox", { name: /score/i }).type("5");
    cy.findByRole("button", { name: /submit score/i }).should("not.be.disabled");
    cy.findByRole("button", { name: /submit score/i }).click();

    cy.wait(500);

    cy.findByRole("textbox", { name: /score/i }).type("11");
    cy.findByRole("button", { name: /submit score/i }).should("not.be.disabled");
    cy.findByRole("button", { name: /submit score/i }).click();
    cy.wait(500);

    cy.findByRole("button", { name: /complete game/i }).click();
    cy.wait(500);
    cy.findByText(`${player2} has won with a score of 11`);
  });
});
