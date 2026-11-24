import { test } from '../../../src/fixtures';
import { InventoryPage } from '../../../src/pages/inventory.page';
import { captureStep } from '../../../src/utils/capture-step';

test.describe('Inventory', () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    inventory = new InventoryPage(authenticatedPage);
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
