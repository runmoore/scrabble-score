describe("cryptogram solver", () => {
  beforeEach(() => {
    cy.visitAndCheck("/cryptogram");
  });

  it("should allow user to enter a cryptogram and solve it using mapping grid", () => {
    const cryptogram = "URYYB JBEYQ";
    const expectedDecrypted = "HELLO WORLD";

    // Enter the cryptogram puzzle
    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Verify the encrypted text is displayed
    cy.findByTestId("encrypted-text").should("contain.text", "URYYB JBEYQ");

    // Create mappings using the grid (ROT13: U→H, R→E, Y→L, B→O, J→W, Q→D)
    cy.findByLabelText("Mapping for U").type("H");
    cy.findByLabelText("Mapping for R").type("E");
    cy.findByLabelText("Mapping for Y").type("L");
    cy.findByLabelText("Mapping for B").type("O");
    cy.findByLabelText("Mapping for J").type("W");
    cy.findByLabelText("Mapping for Q").type("D");

    // Verify instant updates in the decrypted display
    cy.findByTestId("decrypted-text").should("contain.text", expectedDecrypted);
  });

  it("should preserve case when applying mappings", () => {
    const cryptogram = "Uryyb Jbeyq";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create mappings
    cy.findByLabelText("Mapping for U").type("H");
    cy.findByLabelText("Mapping for R").type("E");
    cy.findByLabelText("Mapping for Y").type("L");
    cy.findByLabelText("Mapping for B").type("O");
    cy.findByLabelText("Mapping for J").type("W");
    cy.findByLabelText("Mapping for Q").type("D");

    // Verify case is preserved (Hello World, not HELLO WORLD)
    cy.findByTestId("decrypted-text").should("contain.text", "Hello World");
  });

  it("should update all instances when modifying an existing mapping", () => {
    const cryptogram = "AAA BBB";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create initial mapping A → X
    cy.findByLabelText("Mapping for A").type("X");
    cy.findByTestId("decrypted-text").should("contain.text", "XXX BBB");

    // Modify the mapping A → Y
    cy.findByLabelText("Mapping for A").clear().type("Y");

    // Verify all instances of A are updated to Y
    cy.findByTestId("decrypted-text").should("contain.text", "YYY BBB");
  });

  it("should revert to cipher text when clearing a mapping", () => {
    const cryptogram = "HELLO";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create mapping H → T
    cy.findByLabelText("Mapping for H").type("T");
    cy.findByTestId("decrypted-text").should("contain.text", "TELLO");

    // Clear the mapping
    cy.findByLabelText("Mapping for H").clear();

    // Verify H reverts to cipher text
    cy.findByTestId("decrypted-text").should("contain.text", "HELLO");
  });

  it("should clear all mappings when Clear All button is clicked", () => {
    const cryptogram = "URYYB JBEYQ";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create multiple mappings
    cy.findByLabelText("Mapping for U").type("H");
    cy.findByLabelText("Mapping for R").type("E");
    cy.findByLabelText("Mapping for Y").type("L");
    cy.findByLabelText("Mapping for B").type("O");

    // Verify decrypted text shows partial solution
    cy.findByTestId("decrypted-text").should("contain.text", "HELLO");

    // Click Clear All button
    cy.findByRole("button", { name: /clear all/i }).click();

    // Verify all mappings are cleared
    cy.findByLabelText("Mapping for U").should("have.value", "");
    cy.findByLabelText("Mapping for R").should("have.value", "");
    cy.findByLabelText("Mapping for Y").should("have.value", "");
    cy.findByLabelText("Mapping for B").should("have.value", "");

    // Verify decrypted text reverts to original cipher
    cy.findByTestId("decrypted-text").should("contain.text", "URYYB JBEYQ");
  });

  it("should preserve special characters and numbers in puzzle text", () => {
    const cryptogram = "HELLO, WORLD! 123";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create mapping H → T
    cy.findByLabelText("Mapping for H").type("T");

    // Verify special characters and numbers are preserved
    cy.findByTestId("decrypted-text").should("contain.text", "TELLO, WORLD! 123");
  });

  it("should show conflict warning when multiple cipher letters map to same plain letter", () => {
    const cryptogram = "ABC";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create conflicting mappings: A → E, C → E
    cy.findByLabelText("Mapping for A").type("E");
    cy.findByLabelText("Mapping for C").type("E");

    // Verify conflict warning appears
    cy.findByRole("alert").should("contain.text", "conflict");

    // Verify conflicting letters are highlighted
    cy.findByLabelText("Mapping for A").should("have.class", "ring-red-primary");
    cy.findByLabelText("Mapping for C").should("have.class", "ring-red-primary");
  });

  it("should handle 1000 character cryptogram without errors", () => {
    // Generate a 1000 character cryptogram
    const longCryptogram = "URYYB JBEYQ ".repeat(84).substring(0, 1000);

    cy.findByRole("textbox", { name: /puzzle/i }).type(longCryptogram);

    // Create a mapping
    cy.findByLabelText("Mapping for U").type("H");

    // Verify the mapping is applied (should be fast, <100ms per spec)
    cy.findByTestId("decrypted-text").should("contain.text", "H");
  });

  it("should show character count for puzzle input", () => {
    const cryptogram = "HELLO WORLD";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Verify character count is displayed (11 characters including space)
    cy.findByText(/11.*character/i).should("be.visible");
  });

  it("should show validation error if puzzle exceeds 1000 characters", () => {
    // Try to enter 1001 characters
    const tooLongCryptogram = "A".repeat(1001);

    cy.findByRole("textbox", { name: /puzzle/i }).type(tooLongCryptogram);

    // Verify error message is shown
    cy.findByText(/1000.*character/i).should("be.visible");

    // Verify mapping grid is disabled or shows error state
    cy.findByLabelText("Mapping for A").should("be.disabled");
  });

  it("should auto-uppercase letters entered in mapping grid", () => {
    const cryptogram = "HELLO";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Enter lowercase letter in mapping
    cy.findByLabelText("Mapping for H").type("t");

    // Verify it's auto-converted to uppercase
    cy.findByLabelText("Mapping for H").should("have.value", "T");
  });

  it("should only accept single letters in mapping inputs", () => {
    const cryptogram = "HELLO";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Try to enter multiple characters
    cy.findByLabelText("Mapping for H").type("ABC");

    // Verify only first character is accepted (due to maxLength=1)
    cy.findByLabelText("Mapping for H").should("have.value", "A");
  });

  it("should distinguish between solved and unsolved letters visually", () => {
    const cryptogram = "HELLO";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create mapping for H only
    cy.findByLabelText("Mapping for H").type("T");

    // Check that solved letter (T/H) has different styling than unsolved (E, L, O)
    // The solved letter should be bold, unsolved should not be
    cy.findByTestId("decrypted-text")
      .find(".solved-letter")
      .should("have.class", "font-bold");

    cy.findByTestId("decrypted-text")
      .find(".unsolved-letter")
      .should("not.have.class", "font-bold");
  });
});
