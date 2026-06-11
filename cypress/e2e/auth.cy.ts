// cypress/e2e/auth.cy.ts

describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('unauthenticated visitor is redirected to /properties', () => {
    cy.url().should('include', '/properties');
  });

  it('unauthenticated visitor can browse properties without logging in', () => {
    cy.visit('/properties');
    cy.contains('Browse Properties').should('be.visible');
    cy.contains('Sign In').should('be.visible');
    cy.contains('Register').should('be.visible');
  });

  it('login page renders correctly', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign In');
  });

  it('register page renders correctly', () => {
    cy.visit('/register');
    cy.contains('Create Account').should('be.visible');
    cy.contains('Confirm Password').should('be.visible');
    cy.contains('Emergency contact').should('be.visible');
  });

  it('login with invalid credentials shows error', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('notauser@test.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email or password', { timeout: 8000 }).should('be.visible');
  });

  it('already-authenticated user is redirected away from /login', () => {
    cy.loginAsWorshipper();
    cy.visit('/login');
    cy.url().should('not.include', '/login');
  });

  it('worshipper is redirected to /worshipper/bookings after login', () => {
    cy.loginAsWorshipper();
    cy.visit('/');
    cy.url().should('include', '/worshipper/bookings');
  });

  it('admin is redirected to /admin/dashboard after login', () => {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.url().should('include', '/admin/dashboard');
  });

  it('officer is redirected to /officer/incidents after login', () => {
    cy.loginAsOfficer();
    cy.visit('/');
    cy.url().should('include', '/officer');
  });
});
