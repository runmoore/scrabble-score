import { faker } from "@faker-js/faker";

describe("anagram circle smoke tests", () => {
  it("should generate an anagram circle", () => {
    cy.visitAndCheck("/anagram");

    const word = faker.word.sample({
      length: { min: 10, max: 20 },
      strategy: "longest",
    });

    cy.findByRole("textbox", { name: /word/i }).type(word);
    cy.findByRole("button", { name: /Go/i }).click();

    cy.url().should("include", `?word=${word}`);

    cy.findByTestId("letter0").should("have.text", word[0]);
    cy.findByTestId("letter1").should("have.text", word[1]);
    cy.findByTestId("letter2").should("have.text", word[2]);

    // Assert that shuffle works
    cy.findByRole("button", { name: /Shuffle/i }).click();
    let joinedText = "";
    cy.get(".letter")
      .each((l) => {
        joinedText += l.text();
      })
      .then(() => {
        expect(joinedText).not.to.equal(word);
      });

    cy.get("button").contains("❌").click();
    cy.findByTestId("letter0").should("not.exist");
  });
});
