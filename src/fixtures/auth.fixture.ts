import { test as base, type Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { users } from './data.fixture';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginUsername(users.standard);
    await login.loginPassword(users.password);
    await login.clickLogin();
    await new InventoryPage(page).expectLoaded();
    await use(page);
  },
});
