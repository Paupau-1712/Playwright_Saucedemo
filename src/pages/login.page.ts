import { type Locator, expect } from '@playwright/test';
import * as locators from './locators/login.json';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private loc(name: keyof typeof locators): Locator {
    return this.page.locator(locators[name]);
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
