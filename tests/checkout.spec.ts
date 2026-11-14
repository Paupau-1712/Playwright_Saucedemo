import { test, expect } from '@playwright/test';
import { LoginPage, users } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { captureStep } from '../utilities/screenShots/captureStep';

test('completes a purchase end to end', async ({ page }) => {
  const login = new LoginPage(page);
  await captureStep(page, 'Open the login page', () => login.goto());
  await captureStep(page, 'Enter the username', () => login.loginUsername(users.standard));
  await captureStep(page, 'Enter the password', () => login.loginPassword(users.password));
  await captureStep(page, 'Log in and verify the inventory page', async () => {
    await login.clickLogin();
    await new InventoryPage(page).expectLoaded();
  });

  const inventory = new InventoryPage(page);
  await captureStep(page, 'Add the backpack to the cart', () =>
    inventory.addToCart('Sauce Labs Backpack'),
  );
  await captureStep(page, 'Open the cart and verify the item', async () => {
    await inventory.openCart();
    await expect(page).toHaveURL(/cart\.html/);
    await new CheckoutPage(page).expectCartItem('Sauce Labs Backpack');
  });
  await captureStep(page, 'Start checkout', () => inventory.clickCheckout());

  const checkout = new CheckoutPage(page);
  await captureStep(page, 'Enter checkout information', () =>
    checkout.enterInformation('Test', 'User', '12345'),
  );
  await captureStep(page, 'Continue to the order overview', () => checkout.continueToOverview());
  await captureStep(page, 'Finish the order and verify confirmation', async () => {
    await checkout.finishOrder();
    await checkout.expectOrderComplete();
  });
});
