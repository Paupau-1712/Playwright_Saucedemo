import { type Locator, type Page, expect } from '@playwright/test';
import * as locators from '../locators/inventory.json';

export class ProductListComponent {
  constructor(private readonly page: Page) {}

  get title(): Locator {
    return this.page.locator(locators.title);
  }

  private loc(
    name: 'items' | 'itemPrices' | 'addToCartButton' | 'sortSelect',
    replacements: Record<string, string> = {},
  ): Locator {
    const selector = Object.entries(replacements).reduce(
      (current, [key, value]) => current.replace(`{${key}}`, value),
      locators[name],
    );
    return this.page.locator(selector);
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.loc('items')).toHaveCount(count);
  }

  async addToCart(productName: string): Promise<void> {
    await this.loc('addToCartButton', { productName }).click();
  }

  async sortByPriceLowToHigh(): Promise<void> {
    await this.loc('sortSelect').selectOption('lohi');
  }

  async expectPricesAscending(): Promise<void> {
    const texts = await this.loc('itemPrices').allTextContents();
    const prices = texts.map((text) => Number(text.replace('$', '')));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  }
}
