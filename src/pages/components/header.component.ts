import { type Locator, type Page, expect } from '@playwright/test';
import * as locators from '../locators/inventory.json';

export class HeaderComponent {
  constructor(private readonly page: Page) {}

  private loc(name: 'cartBadge' | 'cartLink'): Locator {
    return this.page.locator(locators[name]);
  }

  async expectCartBadge(count: number): Promise<void> {
    await expect(this.loc('cartBadge')).toHaveText(String(count));
  }

  async openCart(): Promise<void> {
    await this.loc('cartLink').click();
  }
}
