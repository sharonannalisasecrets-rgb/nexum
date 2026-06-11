// cypress/e2e/admin.cy.ts

describe('Admin Portal', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('admin dashboard loads with stat cards', () => {
    cy.visit('/admin/dashboard');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Active Incidents').should('be.visible');
    cy.contains('Open Missing Alerts').should('be.visible');
  });

  it('admin sidebar shows all nav groups', () => {
    cy.visit('/admin/dashboard');
    cy.contains('Missing Persons').should('be.visible');
    cy.contains('Incidents').should('be.visible');
    cy.contains('Geofence').should('be.visible');
    cy.contains('Transit').should('be.visible');
    cy.contains('Properties').should('be.visible');
    cy.contains('Bookings').should('be.visible');
    cy.contains('Users').should('be.visible');
  });

  it('admin can navigate to incidents page', () => {
    cy.visit('/admin/incidents');
    cy.contains('Incidents').should('be.visible');
  });

  it('admin can navigate to missing persons page', () => {
    cy.visit('/admin/missing-persons');
    cy.contains('Missing Persons').should('be.visible');
  });

  it('admin can navigate to geofence page', () => {
    cy.visit('/admin/geofence');
    cy.contains('Geofence').should('be.visible');
    cy.contains('Saved Boundaries').should('be.visible');
  });

  it('admin can navigate to users page', () => {
    cy.visit('/admin/users');
    cy.contains('Users').should('be.visible');
    cy.contains('Add Officer').should('be.visible');
  });

  it('admin users page shows create officer form on button click', () => {
    cy.visit('/admin/users');
    cy.get('button').contains('Add Officer').click();
    cy.contains('Create Officer or Driver Account').should('be.visible');
    cy.get('select').should('be.visible'); // role select
  });
});

describe('Role-Based Access Control', () => {
  it('unauthenticated user cannot access admin pages', () => {
    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
  });

  it('unauthenticated user cannot access officer pages', () => {
    cy.visit('/officer/incidents');
    cy.url().should('include', '/login');
  });

  it('unauthenticated user cannot access worshipper pages', () => {
    cy.visit('/worshipper/bookings');
    cy.url().should('include', '/login');
  });

  it('worshipper is redirected away from admin pages', () => {
    cy.loginAsWorshipper();
    cy.visit('/admin/dashboard');
    cy.url().should('not.include', '/admin');
  });

  it('officer is redirected away from admin pages', () => {
    cy.loginAsOfficer();
    cy.visit('/admin/dashboard');
    cy.url().should('not.include', '/admin/dashboard');
  });

  it('officer can access their own incident queue', () => {
    cy.loginAsOfficer();
    cy.visit('/officer/incidents');
    cy.url().should('include', '/officer/incidents');
    cy.contains('Incident Queue').should('be.visible');
  });

  it('nav shows correct items for worshipper', () => {
    cy.loginAsWorshipper();
    cy.visit('/worshipper/bookings');
    cy.contains('My Bookings').should('be.visible');
    cy.contains('Browse Properties').should('be.visible');
    // Should NOT see admin links
    cy.contains('Dashboard').should('not.exist');
    cy.contains('Geofence').should('not.exist');
  });
});
