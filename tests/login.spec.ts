import { test, expect } from '@playwright/test';
import { LoginPage, users } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Login', () => {
  test('standard user can log in', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(users.standard, users.password);
    await new InventoryPage(page).expectLoaded();
  });

  test('locked out user is rejected', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(users.locked, users.password);
    await login.expectError('this user has been locked out');
  });

  test('wrong password shows an error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(users.standard, 'wrong_password');
    await login.expectError('Username and password do not match');
  });

  test('empty username is required', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginButton.click();
    await login.expectError('Username is required');
  });

  test('empty password is required', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.username.fill(users.standard);
    await login.loginButton.click();
    await login.expectError('Password is required');
  });
});
