// cypress/support/commands.ts

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
  });
});

Cypress.Commands.add('loginAsWorshipper', () => {
  cy.login(Cypress.env('WORSHIPPER_EMAIL'), Cypress.env('WORSHIPPER_PASSWORD'));
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
});

Cypress.Commands.add('loginAsOfficer', () => {
  cy.login(Cypress.env('OFFICER_EMAIL'), Cypress.env('OFFICER_PASSWORD'));
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginAsWorshipper(): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      loginAsOfficer(): Chainable<void>;
    }
  }
}
