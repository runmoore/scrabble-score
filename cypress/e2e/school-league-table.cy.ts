describe("school league table smoke test", () => {
  it("sorts, filters, favourites, and restores state from the URL", () => {
    cy.visitAndCheck("/school-league-table");

    cy.findByText(/Showing 93 of 93 rows/i).should("exist");

    // Sort by a year column (defaults to descending for numeric columns)
    cy.findByRole("button", { name: "2024/25" }).click();
    cy.url().should("include", "sort=2024%2F25");
    cy.url().should("include", "dir=desc");

    // Apply the Roman Catholic filter
    cy.findByRole("checkbox", { name: /Roman Catholic schools only/i })
      .check()
      .should("be.checked");
    cy.url().should("include", "rc=1");
    cy.findByText(/Showing 15 of 93 rows/i).should("exist");

    // Favourite a row — the chart should appear with a matching legend entry
    cy.findByTestId("chart-empty-state").should("exist");
    cy.findByRole("button", { name: /Favourite Holy Cross RC Primary/i }).click();
    cy.url().should("include", "favs=44");
    cy.findByTestId("chart-empty-state").should("not.exist");
    cy.findByTestId("chart-legend").should("contain.text", "Holy Cross RC Primary");

    // Reload the exact resulting URL and confirm every piece of state is restored
    cy.reload();
    cy.findByRole("checkbox", { name: /Roman Catholic schools only/i }).should(
      "be.checked"
    );
    cy.findByText(/Showing 15 of 93 rows/i).should("exist");
    cy.findByRole("button", { name: "2024/25 ▼" }).should("exist");
    cy.findByRole("button", {
      name: /Unfavourite Holy Cross RC Primary/i,
    }).should("exist");
    cy.findByTestId("chart-legend").should("contain.text", "Holy Cross RC Primary");
  });
});
