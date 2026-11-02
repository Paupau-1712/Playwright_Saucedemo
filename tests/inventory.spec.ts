import { test, expect } from '@playwright/test';
import { LoginPage, users } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Inventory', () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(users.standard, users.password);
    inventory = new InventoryPage(page);
    await inventory.expectLoaded();
  });

  test('lists six products', async () => {
    await expect(inventory.items).toHaveCount(6);
  });

  test('adding a product updates the cart badge', async () => {
    await inventory.addToCart('Sauce Labs Backpack');
    await expect(inventory.cartBadge).toHaveText('1');
  });

  test('sorts products by price low to high', async () => {
    await inventory.sortSelect.selectOption('lohi');
    const prices = await inventory.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
