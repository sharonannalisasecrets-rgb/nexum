describe('Sign out redirect', () => {
  it('logs in and redirects to /login after sign out', () => {
    // Use seeded admin account
    const email = 'admin@nexum.ng';
    const password = 'Nexum@Admin2026!';

    cy.visit('/login');

    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(password, { log: false });
    cy.get('button[type="submit"]').click();

    // After login, ensure we're redirected away from /login
    cy.location('pathname', { timeout: 10000 }).should(path => {
      expect(path).to.not.contain('/login');
    });

    // Wait briefly for nav/sidebar to render
    cy.wait(500);

    // Click any visible 'Sign out' button/link
    cy.contains(/Sign out/i).click();

    // Assert we end up on /login
    cy.location('pathname', { timeout: 10000 }).should('match', /\/login$/);
  });
});
