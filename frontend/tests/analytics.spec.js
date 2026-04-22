import { expect, test } from '@playwright/test';

const AUTH_STORAGE_KEY = 'uplay_auth';

const adminAuth = {
  token: 'playwright-admin-token',
  user: {
    id: 'admin-1',
    role: 'admin',
    fullName: 'Admin Tester',
    email: 'admin@example.com',
  },
};

const captainAuth = {
  token: 'playwright-captain-token',
  user: {
    id: 'captain-1',
    role: 'captain',
    fullName: 'Captain Tester',
    email: 'captain@example.com',
  },
};

const studentAuth = {
  token: 'playwright-student-token',
  user: {
    id: 'student-1',
    role: 'student',
    fullName: 'Student Tester',
    email: 'student@example.com',
  },
};

const mockDashboard = {
  stats: {
    totalUsers: 32,
    activeTournaments: 5,
    matchesPlayed: 24,
    pendingApprovals: 3,
  },
  users: [],
  teams: [],
  tournaments: [],
  approvals: [],
  activity: [],
};

const captainTeam = {
  _id: 'team-1',
  teamName: 'Thunder Strikers',
  sport: 'Basketball',
  logo: '',
  players: [
    { _id: 'p1', name: 'Alex', position: 'Guard' },
    { _id: 'p2', name: 'Maya', position: 'Forward' },
  ],
  registrations: [
    { tournament: 'Spring Cup', status: 'Approved' },
    { tournament: 'Night League', status: 'Pending' },
  ],
};

async function seedAuth(page, auth) {
  await page.addInitScript(({ key, value }) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, { key: AUTH_STORAGE_KEY, value: auth });
}

async function mockAuthMe(page, user) {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user }),
    });
  });
}

async function mockAdminApis(page, dashboard = mockDashboard, teams = { teams: [] }) {
  await page.route('**/api/admin/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(dashboard),
    });
  });

  await page.route('**/api/admin/teams', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(teams),
    });
  });
}

async function mockCaptainTeam(page, team = captainTeam) {
  await page.route('**/api/teams/captain/**', async (route) => {
    if (team) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(team),
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Not found' }),
    });
  });
}

test('home page shows the hero title', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Your game.')).toBeVisible();
  await expect(page.getByText('Your glory.')).toBeVisible();
});

test('home page highlights smart analytics', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Smart analytics')).toBeVisible();
});

test('home page shows the gallery section', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Sports in action' })).toBeVisible();
});

test('home contact form validates required fields', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByText('Name is required')).toBeVisible();
  await expect(page.getByText('Email is required')).toBeVisible();
  await expect(page.getByText('Subject is required')).toBeVisible();
  await expect(page.getByText('Message is required')).toBeVisible();
});

test('login page renders the sign in form', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'U-PLAY' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('register page renders the account form', async ({ page }) => {
  await page.goto('/register');

  await expect(page.getByText('Create your account')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Student' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Captain' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Admin' })).toBeVisible();
});

test('student stats page loads with seeded auth', async ({ page }) => {
  await seedAuth(page, studentAuth);
  await mockAuthMe(page, studentAuth.user);

  await page.goto('/student/stats');

  await expect(page.getByRole('heading', { name: 'Your Stats' })).toBeVisible();
  await expect(page.getByText('Matches Played')).toBeVisible();
});

test('captain dashboard loads with seeded auth and team data', async ({ page }) => {
  await seedAuth(page, captainAuth);
  await mockAuthMe(page, captainAuth.user);
  await mockCaptainTeam(page, captainTeam);

  await page.goto('/captain');

  await expect(page.getByRole('heading', { name: 'Captain Dashboard' })).toBeVisible();
  await expect(page.getByText('Thunder Strikers')).toBeVisible();
  await expect(page.getByText('Registrations')).toBeVisible();
});

test('admin insights page loads with seeded auth', async ({ page }) => {
  await seedAuth(page, adminAuth);
  await mockAuthMe(page, adminAuth.user);
  await mockAdminApis(page);

  await page.goto('/admin/insights');

  await expect(page.getByRole('heading', { name: 'Admin Insights' })).toBeVisible();
  await expect(page.getByText('Active platform users')).toBeVisible();
});

test('user insights page loads with seeded auth', async ({ page }) => {
  await seedAuth(page, adminAuth);
  await mockAuthMe(page, adminAuth.user);
  await mockAdminApis(page);

  await page.goto('/admin/insights-users');

  await expect(page.locator('main h1')).toHaveText('User Insights');
  await expect(page.getByText('Total Users')).toBeVisible();
});

test('team insights page loads with seeded auth', async ({ page }) => {
  await seedAuth(page, adminAuth);
  await mockAuthMe(page, adminAuth.user);
  await mockAdminApis(page);

  await page.goto('/admin/insights-teams');

  await expect(page.locator('main h1')).toHaveText('Team Insights');
  await expect(page.getByText('No teams found for the selected sport')).toBeVisible();
});

test('tournaments insights page loads with seeded auth', async ({ page }) => {
  await seedAuth(page, adminAuth);
  await mockAuthMe(page, adminAuth.user);
  await mockAdminApis(page);

  await page.goto('/admin/tournaments-insights');

  await expect(page.locator('main h1')).toHaveText('Tournaments Insights');
  await expect(page.getByText('Published Tournaments')).toBeVisible();
});