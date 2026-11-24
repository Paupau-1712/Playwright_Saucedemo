import { type Page, expect } from '@playwright/test';
import { HeaderComponent } from './components/header.component';
import { ProductListComponent } from './components/product-list.component';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  private readonly header: HeaderComponent;
  private readonly productList: ProductListComponent;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.productList = new ProductListComponent(page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.productList.title).toHaveText('Products');
  }

  async addToCart(productName: string): Promise<void> {
    await this.productList.addToCart(productName);
  }

  async expectItemCount(count: number): Promise<void> {
    await this.productList.expectItemCount(count);
  }

  async expectCartBadge(count: number): Promise<void> {
    await this.header.expectCartBadge(count);
  }

  async sortByPriceLowToHigh(): Promise<void> {
    await this.productList.sortByPriceLowToHigh();
  }

  async expectPricesAscending(): Promise<void> {
    await this.productList.expectPricesAscending();
  }

  async openCart(): Promise<void> {
    await this.header.openCart();
  }
}
