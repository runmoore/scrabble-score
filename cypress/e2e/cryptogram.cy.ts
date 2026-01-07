describe("cryptogram solver", () => {
  beforeEach(() => {
    cy.visitAndCheck("/cryptogram");
  });

  it("should allow user to enter a cryptogram and solve it using mapping grid", () => {
    const cryptogram = "URYYB JBEYQ";

    // Enter the cryptogram puzzle
    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Verify the encrypted text is displayed
    cy.findByTestId("decrypted-text").should("contain.text", "URYYB JBEYQ");

    // Create mappings using the grid (ROT13: U→H, R→E, Y→L, B→O, J→W, E→R, Q→D)
    cy.findByLabelText("Mapping for U").type("H");
    cy.findByLabelText("Mapping for R").type("E");
    cy.findByLabelText("Mapping for Y").type("L");
    cy.findByLabelText("Mapping for B").type("O");
    cy.findByLabelText("Mapping for J").type("W");
    cy.findByLabelText("Mapping for E").type("R");
    cy.findByLabelText("Mapping for Q").type("D");

    // Verify mappings are stored in grid
    cy.findByLabelText("Mapping for U").should("have.value", "H");
    cy.findByLabelText("Mapping for R").should("have.value", "E");
    cy.findByLabelText("Mapping for Y").should("have.value", "L");
    cy.findByLabelText("Mapping for B").should("have.value", "O");
  });

  it("should preserve case in cipher text display", () => {
    const cryptogram = "Uryyb Jbeyq";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Verify cipher text displays with original case preserved
    cy.findByTestId("decrypted-text").should("contain.text", "Uryyb Jbeyq");

    // Create mappings
    cy.findByLabelText("Mapping for U").type("H");
    cy.findByLabelText("Mapping for R").type("E");
    cy.findByLabelText("Mapping for Y").type("L");

    // Verify mappings are stored
    cy.findByLabelText("Mapping for U").should("have.value", "H");
    cy.findByLabelText("Mapping for R").should("have.value", "E");
    cy.findByLabelText("Mapping for Y").should("have.value", "L");
  });

  it("should update all instances when modifying an existing mapping", () => {
    const cryptogram = "AAA BBB";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create initial mapping A → X
    cy.findByLabelText("Mapping for A").type("X");
    cy.findByLabelText("Mapping for A").should("have.value", "X");

    // Verify all inline inputs for A show X
    cy.get('[aria-label="Inline mapping for A"]').each(($input) => {
      cy.wrap($input).should("have.value", "X");
    });

    // Modify the mapping A → Y
    cy.findByLabelText("Mapping for A").clear().type("Y");

    // Verify all inline inputs for A are updated to Y
    cy.get('[aria-label="Inline mapping for A"]').each(($input) => {
      cy.wrap($input).should("have.value", "Y");
    });
  });

  it("should clear mapping when input is cleared", () => {
    const cryptogram = "HELLO";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create mapping H → T
    cy.findByLabelText("Mapping for H").type("T");
    cy.findByLabelText("Mapping for H").should("have.value", "T");
    cy.findByLabelText("Inline mapping for H").should("have.value", "T");

    // Clear the mapping
    cy.findByLabelText("Mapping for H").clear();

    // Verify mapping is cleared in both grid and inline
    cy.findByLabelText("Mapping for H").should("have.value", "");
    cy.findByLabelText("Inline mapping for H").should("have.value", "");
  });

  it("should clear all mappings when Clear All button is clicked", () => {
    const cryptogram = "URYYB JBEYQ";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create multiple mappings
    cy.findByLabelText("Mapping for U").type("H");
    cy.findByLabelText("Mapping for R").type("E");
    cy.findByLabelText("Mapping for Y").type("L");
    cy.findByLabelText("Mapping for B").type("O");

    // Verify mappings are set
    cy.findByLabelText("Mapping for U").should("have.value", "H");
    cy.findByLabelText("Mapping for R").should("have.value", "E");

    // Click Clear All button
    cy.findByRole("button", { name: /clear all/i }).click();

    // Verify all mappings are cleared in grid
    cy.findByLabelText("Mapping for U").should("have.value", "");
    cy.findByLabelText("Mapping for R").should("have.value", "");
    cy.findByLabelText("Mapping for Y").should("have.value", "");
    cy.findByLabelText("Mapping for B").should("have.value", "");

    // Verify inline inputs are also cleared
    cy.findByLabelText("Inline mapping for U").should("have.value", "");
    cy.findByLabelText("Inline mapping for R").should("have.value", "");
  });

  it("should preserve special characters and numbers in puzzle text", () => {
    const cryptogram = "HELLO, WORLD! 123";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Verify special characters and numbers are displayed in cipher text
    cy.findByTestId("decrypted-text").should(
      "contain.text",
      "HELLO, WORLD! 123"
    );

    // Create mapping H → T
    cy.findByLabelText("Mapping for H").type("T");

    // Verify mapping is stored
    cy.findByLabelText("Mapping for H").should("have.value", "T");
    cy.findByLabelText("Inline mapping for H").should("have.value", "T");
  });

  it("should show conflict warning when multiple cipher letters map to same plain letter", () => {
    const cryptogram = "ABC";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create conflicting mappings: A → E, C → E
    cy.findByLabelText("Mapping for A").type("E");
    cy.findByLabelText("Mapping for C").type("E");

    // Verify conflicting letters are highlighted with red ring
    cy.findByLabelText("Mapping for A").should(
      "have.class",
      "ring-red-primary"
    );
    cy.findByLabelText("Mapping for C").should(
      "have.class",
      "ring-red-primary"
    );
  });

  it("should handle 1000 character cryptogram without errors", () => {
    // Generate a 1000 character cryptogram
    const longCryptogram = "URYYB JBEYQ ".repeat(84).substring(0, 1000);

    cy.findByRole("textbox", { name: /puzzle/i }).type(longCryptogram, {
      delay: 0,
    });

    // Create a mapping
    cy.findByLabelText("Mapping for U").type("H");

    // Verify the mapping is stored in grid
    cy.findByLabelText("Mapping for U").should("have.value", "H");

    // Verify at least one inline input has the mapping (there are many U's in the text)
    cy.get('[aria-label="Inline mapping for U"]')
      .first()
      .should("have.value", "H");
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

  it("should show filled inline inputs for mapped letters", () => {
    const cryptogram = "HELLO";

    cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

    // Create mapping for H only
    cy.findByLabelText("Mapping for H").type("T");

    // Verify filled vs empty inline inputs (using .first() since H appears once)
    cy.get('[aria-label="Inline mapping for H"]').should("have.value", "T");
    cy.get('[aria-label="Inline mapping for E"]').should("have.value", "");
    // L appears twice, so check first instance
    cy.get('[aria-label="Inline mapping for L"]')
      .first()
      .should("have.value", "");
    cy.get('[aria-label="Inline mapping for O"]').should("have.value", "");
  });

  // Phase 4: Inline Mapping Input Tests (User Story 2)
  describe("Inline Mapping Input", () => {
    it("should display inline input boxes above each cipher letter", () => {
      const cryptogram = "HELLO";

      cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

      // Should have inline inputs for all 5 letters (H, E, L, L, O)
      // "HELLO" has 2 L's, so we should see 2 inputs for L
      cy.get('[aria-label="Inline mapping for H"]').should("have.length", 1);
      cy.get('[aria-label="Inline mapping for E"]').should("have.length", 1);
      cy.get('[aria-label="Inline mapping for L"]').should("have.length", 2); // Two L's
      cy.get('[aria-label="Inline mapping for O"]').should("have.length", 1);

      // Total of 5 inline inputs for 5 letters
      cy.get('[aria-label^="Inline mapping for"]').should("have.length", 5);
    });

    it("should update all instances and grid when typing in inline input", () => {
      const cryptogram = "HELLO";

      cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

      // Type in inline input for H
      cy.findByLabelText("Inline mapping for H").type("T");

      // Verify grid updates
      cy.findByLabelText("Mapping for H").should("have.value", "T");

      // Verify inline input shows the value
      cy.findByLabelText("Inline mapping for H").should("have.value", "T");
    });

    it("should update inline inputs when typing in grid", () => {
      const cryptogram = "HELLO";

      cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

      // Type in grid for E
      cy.findByLabelText("Mapping for E").type("A");

      // Verify inline input updates
      cy.findByLabelText("Inline mapping for E").should("have.value", "A");

      // Verify grid shows the value
      cy.findByLabelText("Mapping for E").should("have.value", "A");
    });

    it("should clear mapping when clearing inline input", () => {
      const cryptogram = "HELLO";

      cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

      // Create mapping via inline input
      cy.findByLabelText("Inline mapping for H").type("T");
      cy.findByLabelText("Inline mapping for H").should("have.value", "T");

      // Clear the inline input
      cy.findByLabelText("Inline mapping for H").clear();

      // Verify inline input is cleared
      cy.findByLabelText("Inline mapping for H").should("have.value", "");

      // Verify grid also clears
      cy.findByLabelText("Mapping for H").should("have.value", "");
    });

    it("should maintain synchronization between inline and grid", () => {
      const cryptogram = "ABCABC";

      cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

      // Set mapping via inline input (get first instance of A)
      cy.get('[aria-label="Inline mapping for A"]').first().type("X");

      // Set another via grid
      cy.findByLabelText("Mapping for B").type("Y");

      // Verify both are synchronized in grid
      cy.findByLabelText("Mapping for A").should("have.value", "X");
      cy.get('[aria-label="Inline mapping for B"]')
        .first()
        .should("have.value", "Y");

      // Verify all inline inputs for A show X
      cy.get('[aria-label="Inline mapping for A"]').each(($input) => {
        cy.wrap($input).should("have.value", "X");
      });

      // Change inline input (use first instance)
      cy.get('[aria-label="Inline mapping for A"]').first().clear().type("Z");

      // Verify grid updates
      cy.findByLabelText("Mapping for A").should("have.value", "Z");

      // Verify all inline inputs for A updated to Z
      cy.get('[aria-label="Inline mapping for A"]').each(($input) => {
        cy.wrap($input).should("have.value", "Z");
      });
    });

    it("should have compact grid layout occupying less vertical space", () => {
      cy.findByRole("textbox", { name: /puzzle/i }).type("HELLO");

      // Get grid height (this test will need actual measurement)
      cy.get('[data-testid="mapping-grid"]')
        .invoke("height")
        .should("be.lessThan", 300); // Adjust based on original grid height
    });

    it("should work on mobile viewport with touch-friendly inputs", () => {
      // Set mobile viewport
      cy.viewport(375, 667);

      const cryptogram = "HELLO";
      cy.findByRole("textbox", { name: /puzzle/i }).type(cryptogram);

      // Verify inline inputs are visible and accessible
      cy.get('[aria-label="Inline mapping for H"]').should("be.visible");

      // Verify touch target size (mobile: h-8 w-8 = 32px)
      cy.get('[aria-label="Inline mapping for H"]')
        .invoke("outerWidth")
        .should("be.gte", 32);

      cy.get('[aria-label="Inline mapping for H"]')
        .invoke("outerHeight")
        .should("be.gte", 32);

      // Type in inline input
      cy.get('[aria-label="Inline mapping for H"]').type("T");

      // Verify it works
      cy.get('[aria-label="Inline mapping for H"]').should("have.value", "T");
      cy.findByLabelText("Mapping for H").should("have.value", "T");
    });
  });
});
