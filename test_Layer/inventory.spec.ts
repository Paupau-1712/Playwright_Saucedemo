import { test } from '@playwright/test';
import { LoginPage, users } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { captureStep } from '../utilities/screenShots/captureStep';

test.describe('Inventory', () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await captureStep(page, 'Open the login page', () => login.goto());
    await captureStep(page, 'Enter the username', () => login.loginUsername(users.standard));
    await captureStep(page, 'Enter the password', () => login.loginPassword(users.password));
    await captureStep(page, 'Log in and verify the inventory page', async () => {
      await login.clickLogin();
      inventory = new InventoryPage(page);
      await inventory.expectLoaded();
    });
  });

  test('lists six products', async ({ page }) => {
    await captureStep(page, 'Verify six products are listed', () => inventory.expectItemCount(6));
  });

  test('adding a product updates the cart badge', async ({ page }) => {
    await captureStep(page, 'Add the backpack to the cart', () =>
      inventory.addToCart('Sauce Labs Backpack'),
    );
    await captureStep(page, 'Verify the cart badge', () => inventory.expectCartBadge(1));
  });

  test('sorts products by price low to high', async ({ page }) => {
    await captureStep(page, 'Sort products by price from low to high', () =>
      inventory.sortByPriceLowToHigh(),
    );
    await captureStep(page, 'Verify prices are in ascending order', () =>
      inventory.expectPricesAscending(),
    );
  });
});
