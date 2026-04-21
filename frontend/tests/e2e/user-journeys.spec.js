import { test, expect } from '@playwright/test';

const AUTH_STORAGE_KEY = 'uplay_auth';

function buildAuth(user, token = 'e2e-token') {
  return { token, user };
}

async function mockCurrentUser(page, user) {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user })
    });
  });
}

async function seedAuth(page, user) {
  await page.addInitScript(
    ({ key, auth }) => {
      window.localStorage.setItem(key, JSON.stringify(auth));
    },
    { key: AUTH_STORAGE_KEY, auth: buildAuth(user) }
  );
}

test('home page can navigate to login and register', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('navigation').getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Join now' }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test('unauthenticated users are redirected from protected routes to login', async ({ page }) => {
  await page.goto('/admin');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'U-PLAY' })).toBeVisible();
});

test('student registration journey redirects to student dashboard', async ({ page }) => {
  const studentUser = { fullName: 'E2E Student', role: 'student', email: 'student.e2e@test.com' };

  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildAuth(studentUser, 'student-token'))
    });
  });

  await mockCurrentUser(page, studentUser);

  await page.goto('/register');
  await page.getByLabel('Full name').fill('E2E Student');
  await page.getByLabel('Email address').fill('student.e2e@test.com');
  await page.locator('#password').fill('StrongPass1!');
  await page.locator('#confirm-password').fill('StrongPass1!');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('login with OTP journey redirects to captain dashboard', async ({ page }) => {
  const captainUser = { fullName: 'E2E Captain', role: 'captain', email: 'captain.e2e@test.com' };

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        email: 'captain.e2e@test.com',
        message: 'OTP sent to your email address.'
      })
    });
  });

  await page.route('**/api/auth/verify-login-otp', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildAuth(captainUser, 'captain-token'))
    });
  });

  await mockCurrentUser(page, captainUser);

  await page.goto('/login');
  await page.getByLabel('Email address').fill('captain.e2e@test.com');
  await page.locator('#password').fill('StrongPass1!');
  await page.getByRole('button', { name: 'Send OTP' }).click();

  await expect(page.getByLabel('One-Time Password')).toBeVisible();
  await page.getByLabel('One-Time Password').fill('123456');
  await page.getByRole('button', { name: 'Verify OTP' }).click();

  await expect(page).toHaveURL(/\/captain$/);
  await expect(page.getByRole('heading', { name: 'Captain Dashboard' })).toBeVisible();
});

test('authenticated student visiting login is redirected to student dashboard', async ({ page }) => {
  const studentUser = { fullName: 'Redirect Student', role: 'student', email: 'redirect.student@test.com' };

  await seedAuth(page, studentUser);
  await mockCurrentUser(page, studentUser);

  await page.goto('/login');

  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('admin login journey redirects to admin dashboard', async ({ page }) => {
  const adminUser = { fullName: 'E2E Admin', role: 'admin', email: 'admin.e2e@test.com' };

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        email: 'admin.e2e@test.com',
        message: 'OTP sent to your email address.'
      })
    });
  });

  await page.route('**/api/auth/verify-login-otp', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildAuth(adminUser, 'admin-token'))
    });
  });

  await mockCurrentUser(page, adminUser);

  await page.goto('/login');
  await page.getByLabel('Email address').fill('admin.e2e@test.com');
  await page.locator('#password').fill('AdminPass1!');
  await page.getByRole('button', { name: 'Send OTP' }).click();

  await expect(page.getByLabel('One-Time Password')).toBeVisible();
  await page.getByLabel('One-Time Password').fill('654321');
  await page.getByRole('button', { name: 'Verify OTP' }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
});

test('role-based access control: student cannot access admin routes', async ({ page }) => {
  const studentUser = { fullName: 'E2E Student Role', role: 'student', email: 'student.role@test.com' };

  await seedAuth(page, studentUser);
  await mockCurrentUser(page, studentUser);

  await page.goto('/admin');

  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('authenticated user can access profile page', async ({ page }) => {
  const captainUser = { fullName: 'Captain Profile', role: 'captain', email: 'captain.profile@test.com' };

  await seedAuth(page, captainUser);
  await mockCurrentUser(page, captainUser);

  await page.goto('/profile');

  await expect(page).toHaveURL(/\/profile$/);
  const mainHeading = page.locator('main').getByText('Captain Profile').first();
  await expect(mainHeading).toBeVisible();
});

test('registration form validation works', async ({ page }) => {
  await page.goto('/register');
  
  const fullNameField = page.getByLabel('Full name');
  const emailField = page.getByLabel('Email address');
  const passwordField = page.locator('#password');
  const confirmPasswordField = page.locator('#confirm-password');
  const submitButton = page.getByRole('button', { name: 'Create account' });

  await fullNameField.fill('Test User');
  await emailField.fill('test@example.com');
  await passwordField.fill('StrongPass1!');
  await confirmPasswordField.fill('DifferentPass1!');

  await expect(submitButton).toBeVisible();
  await expect(fullNameField).toHaveValue('Test User');
  await expect(emailField).toHaveValue('test@example.com');
});

test('remember me functionality persists session', async ({ page }) => {
  const studentUser = { fullName: 'Remember Me Student', role: 'student', email: 'remember.student@test.com' };

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        email: 'remember.student@test.com',
        message: 'OTP sent to your email address.'
      })
    });
  });

  await page.route('**/api/auth/verify-login-otp', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildAuth(studentUser, 'student-token'))
    });
  });

  await mockCurrentUser(page, studentUser);

  await page.goto('/login');
  
  const rememberMeCheckbox = page.locator('input[type="checkbox"]').first();
  await rememberMeCheckbox.check();
  await expect(rememberMeCheckbox).toBeChecked();

  await page.getByLabel('Email address').fill('remember.student@test.com');
  await page.locator('#password').fill('RememberPass1!');
  await page.getByRole('button', { name: 'Send OTP' }).click();

  await page.getByLabel('One-Time Password').fill('111111');
  await page.getByRole('button', { name: 'Verify OTP' }).click();

  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
