import { test, expect } from '@playwright/test';
import { LoginPage, users } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('completes a purchase end to end', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.loginUsername(users.standard);
  await login.loginPassword(users.password);
  await login.clickLogin();

  const inventory = new InventoryPage(page);
  await inventory.addToCart('Sauce Labs Backpack');
  await inventory.cartLink.click();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(
    page.locator('[data-test="cart-list"] [data-test="inventory-item-name"]'),
  ).toHaveText('Sauce Labs Backpack');
  await inventory.clickCheckout();

  
  const checkout = new CheckoutPage(page);
  await checkout.firstName.fill('Test');
  await checkout.lastName.fill('User');
  await checkout.postalCode.fill('12345');
  await checkout.continueButton.click();
  await checkout.finishButton.click();

  await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
});
