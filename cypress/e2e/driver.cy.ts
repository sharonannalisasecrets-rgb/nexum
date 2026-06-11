// cypress/e2e/driver.cy.ts

describe('Driver Portal', () => {
  beforeEach(() => {
    cy.loginAsWorshipper(); // Use worshipper as proxy — driver tests need a real driver account
  });

  it('driver layout redirects non-drivers away from /driver pages', () => {
    cy.visit('/driver/rides');
    // Worshipper should be redirected away from driver pages
    cy.url().should('not.include', '/driver/rides');
  });
});

describe('Driver Specific', () => {
  it('unauthenticated user cannot access driver pages', () => {
    cy.visit('/driver/rides');
    cy.url().should('include', '/login');
  });
});
