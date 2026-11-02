import { test, expect } from '@playwright/test';
import { LoginPage, users } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test('completes a purchase end to end', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(users.standard, users.password);

  const inventory = new InventoryPage(page);
  await inventory.addToCart('Sauce Labs Backpack');
  await inventory.cartLink.click();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(
    page.locator('[data-test="cart-list"] [data-test="inventory-item-name"]'),
  ).toHaveText('Sauce Labs Backpack');

  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="firstName"]').fill('Test');
  await page.locator('[data-test="lastName"]').fill('User');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();
  await page.locator('[data-test="finish"]').click();

  await expect(page.locator('[data-test="complete-header"]')).toHaveText(
    'Thank you for your order!',
  );
});
