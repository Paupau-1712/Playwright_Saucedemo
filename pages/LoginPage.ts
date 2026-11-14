import { type Page, type Locator, expect } from '@playwright/test';
import * as locators from './pagelocators/LoginPage.json';

// Public demo credentials published on the Sauce Demo login page.
export const users = {
  standard: 'standard_user',
  locked: 'locked_out_user',
  password: 'secret_sauce',
};

export class LoginPage {
  constructor(private readonly page: Page) {}

  private loc(name: keyof typeof locators): Locator {
    return this.page.locator(locators[name]);
  }

  async goto() {
    await this.page.goto('/');
  }

  async loginUsername(username: string) {
    await this.loc('username').fill(username);
  }

  async loginPassword(password: string) {
    await this.loc('password').fill(password);
  }

  async clickLogin() {
    await this.loc('loginButton').click();
  }

  async expectError(message: string | RegExp) {
    await expect(this.loc('error')).toContainText(message);
  }
}
