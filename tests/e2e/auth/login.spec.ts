import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../src/pages/login.page';
import { InventoryPage } from '../../../src/pages/inventory.page';
import { users } from '../../../src/fixtures/data.fixture';
import { captureStep } from '../../../src/utils/capture-step';

test.describe('Login', () => {
  test('standard user can log in', async ({ page }) => {
    const login = new LoginPage(page);
    await captureStep(page, 'Open the login page', () => login.goto());
    await captureStep(page, 'Enter the username', () => login.loginUsername(users.standard));
    await captureStep(page, 'Enter the password', () => login.loginPassword(users.password));
    await captureStep(page, 'Log in and verify the inventory page', async () => {
      await login.clickLogin();
      await new InventoryPage(page).expectLoaded();
    });
  });

  test('locked out user is rejected', async ({ page }) => {
    const login = new LoginPage(page);
    await captureStep(page, 'Open the login page', () => login.goto());
    await captureStep(page, 'Enter the locked-out username', () => login.loginUsername(users.locked));
    await captureStep(page, 'Enter the password', () => login.loginPassword(users.password));
    await captureStep(page, 'Submit and verify the locked-out error', async () => {
      await login.clickLogin();
      await login.expectError('this user has been locked out');
    });
  });

  test('wrong password shows an error', async ({ page }) => {
    const login = new LoginPage(page);
    await captureStep(page, 'Open the login page', () => login.goto());
    await captureStep(page, 'Enter the username', () => login.loginUsername(users.standard));
    await captureStep(page, 'Enter an incorrect password', () =>
      login.loginPassword(users.invalidPassword),
    );
    await captureStep(page, 'Submit and verify the login error', async () => {
      await login.clickLogin();
      await login.expectError('Username and password do not match');
    });
  });

  test('empty username is required', async ({ page }) => {
    const login = new LoginPage(page);
    await captureStep(page, 'Open the login page', () => login.goto());
    await captureStep(page, 'Submit without a username', async () => {
      await login.clickLogin();
      await login.expectError('Username is required');
    });
  });

  test('empty password is required', async ({ page }) => {
    const login = new LoginPage(page);
    await captureStep(page, 'Open the login page', () => login.goto());
    await captureStep(page, 'Enter the username', () => login.loginUsername(users.standard));
    await captureStep(page, 'Submit without a password', async () => {
      await login.clickLogin();
      await login.expectError('Password is required');
    });
  });
});
