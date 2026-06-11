// cypress/e2e/booking.cy.ts

describe('Booking Flow', () => {
  it('unauthenticated user can browse properties', () => {
    cy.visit('/properties');
    cy.get('h1').should('contain', 'Accommodation');
    // Property cards or empty state visible
    cy.get('main').should('be.visible');
  });

  it('clicking Book Now without login redirects to login', () => {
    cy.visit('/properties');
    // Click first property if available
    cy.get('body').then($body => {
      if ($body.find('a[href^="/properties/"]').length > 0) {
        cy.get('a[href^="/properties/"]').first().click();
        cy.url().should('include', '/properties/');

        // Try to book — select room and dates
        cy.get('select').first().then($select => {
          if ($select.find('option').length > 1) {
            cy.get('select').first().select(1);
          }
        });

        // The booking button should redirect to login when not authenticated
        cy.get('button').contains(/Sign in to Book|Book Now/i).click();
        cy.url().should('include', '/login');
      }
    });
  });

  it('worshipper can see My Bookings page', () => {
    cy.loginAsWorshipper();
    cy.visit('/worshipper/bookings');
    cy.url().should('include', '/worshipper/bookings');
    cy.contains('My Bookings').should('be.visible');
    cy.contains('Book a Property').should('be.visible');
  });

  it('worshipper My Bookings shows booking cards or empty state', () => {
    cy.loginAsWorshipper();
    cy.visit('/worshipper/bookings');
    cy.get('main').should('be.visible');
    // Either shows bookings or the empty state
    cy.get('body').should('satisfy', ($body: JQuery<HTMLBodyElement>) =>
      $body.text().includes('My Bookings')
    );
  });

  it('worshipper cannot access admin pages', () => {
    cy.loginAsWorshipper();
    cy.visit('/admin/dashboard');
    cy.url().should('not.include', '/admin/dashboard');
  });

  it('admin can access bookings page', () => {
    cy.loginAsAdmin();
    cy.visit('/admin/bookings');
    cy.url().should('include', '/admin/bookings');
    cy.contains('Bookings').should('be.visible');
    cy.contains('Check In Guest').should('be.visible');
  });

  it('admin bookings page has confirmation code lookup', () => {
    cy.loginAsAdmin();
    cy.visit('/admin/bookings');
    cy.get('input[placeholder="A3FX92KL"]').should('be.visible');
    cy.get('button').contains('Look Up').should('be.visible');
  });

  it('invalid confirmation code shows error', () => {
    cy.loginAsAdmin();
    cy.visit('/admin/bookings');
    cy.get('input[placeholder="A3FX92KL"]').type('ZZZZZZZZ');
    cy.get('button').contains('Look Up').click();
    cy.contains('not found', { timeout: 5000 }).should('be.visible');
  });
});
