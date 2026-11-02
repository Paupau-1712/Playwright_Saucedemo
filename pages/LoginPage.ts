import { type Page, type Locator, expect } from '@playwright/test';

// Public demo credentials published on the Sauce Demo login page.
export const users = {
  standard: 'standard_user',
  locked: 'locked_out_user',
  password: 'secret_sauce',
};

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.error = page.locator('[data-test="error"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async expectError(message: string | RegExp) {
    await expect(this.error).toContainText(message);
  }
}
