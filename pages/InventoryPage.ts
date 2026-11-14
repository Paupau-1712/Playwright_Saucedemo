import { type Page, type Locator, expect } from '@playwright/test';
import * as locators from './pagelocators/InventoryPage.json';

export class InventoryPage {
  constructor(private readonly page: Page) {}

  private loc(
    name: keyof typeof locators,
    replacements: Record<string, string> = {},
  ): Locator {
    const selector = Object.entries(replacements).reduce(
      (current, [key, value]) => current.replace(`{${key}}`, value),
      locators[name],
    );
    return this.page.locator(selector);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.loc('title')).toHaveText('Products');
  }

  async addToCart(productName: string): Promise<void> {
    await this.loc('addToCartButton', { productName }).click();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.loc('items')).toHaveCount(count);
  }

  async expectCartBadge(count: number): Promise<void> {
    await expect(this.loc('cartBadge')).toHaveText(String(count));
  }

  async sortByPriceLowToHigh(): Promise<void> {
    await this.loc('sortSelect').selectOption('lohi');
  }

  async prices(): Promise<number[]> {
    const texts = await this.loc('itemPrices').allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async expectPricesAscending(): Promise<void> {
    const prices = await this.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  }

  async openCart(): Promise<void> {
    await this.loc('cartLink').click();
  }

  async clickCheckout(): Promise<void> {
    await this.loc('checkoutButton').click();
  }
}
