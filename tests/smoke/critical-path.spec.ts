import { test, expect, checkoutInformation } from '../../src/fixtures';
import { InventoryPage } from '../../src/pages/inventory.page';
import { CheckoutPage } from '../../src/pages/checkout.page';
import { captureStep } from '../../src/utils/capture-step';

test('completes a purchase end to end', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  const inventory = new InventoryPage(page);
  await inventory.expectLoaded();
  await captureStep(page, 'Add the backpack to the cart', () =>
    inventory.addToCart('Sauce Labs Backpack'),
  );
  await captureStep(page, 'Open the cart and verify the item', async () => {
    await inventory.openCart();
    await expect(page).toHaveURL(/cart\.html/);
    await new CheckoutPage(page).expectCartItem('Sauce Labs Backpack');
  });

  const checkout = new CheckoutPage(page);
  await captureStep(page, 'Start checkout', () => checkout.startCheckout());
  await captureStep(page, 'Enter checkout information', () =>
    checkout.enterInformation(
      checkoutInformation.firstName,
      checkoutInformation.lastName,
      checkoutInformation.postalCode,
    ),
  );
  await captureStep(page, 'Continue to the order overview', () => checkout.continueToOverview());
  await captureStep(page, 'Finish the order and verify confirmation', async () => {
    await checkout.finishOrder();
    await checkout.expectOrderComplete();
  });
});
