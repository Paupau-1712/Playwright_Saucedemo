import { expect, type Locator } from '@playwright/test';
import * as locators from './locators/checkout.json';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  private loc(name: keyof typeof locators): Locator {
    return this.page.locator(locators[name]);
  }

  async startCheckout(): Promise<void> {
    await this.loc('checkoutButton').click();
  }

  async expectCartItem(productName: string): Promise<void> {
    await expect(this.loc('cartItemName')).toHaveText(productName);
  }

  async enterInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.loc('firstName').fill(firstName);
    await this.loc('lastName').fill(lastName);
    await this.loc('postalCode').fill(postalCode);
  }

  async continueToOverview(): Promise<void> {
    await this.loc('continueButton').click();
  }

  async finishOrder(): Promise<void> {
    await this.loc('finishButton').click();
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.loc('completeHeader')).toHaveText('Thank you for your order!');
  }
}
