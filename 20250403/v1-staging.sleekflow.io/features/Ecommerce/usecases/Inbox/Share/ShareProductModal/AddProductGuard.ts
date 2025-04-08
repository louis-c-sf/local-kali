import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";

export class AddProductGuard {
  constructor(
    private isSupportInventory: boolean,
    private product: ProductGenericType,
    private quantity: number,
    private cartQuantity: number,
    private stockQuantity: number
  ) {}

  get disableAddButton(): boolean {
    const stockQuantity = this.getStockQuantity();
    const isAvailable = this.isSupportInventory ? stockQuantity > 0 : true;

    const quantityExceedsMax = this.isSupportInventory
      ? this.quantity + this.cartQuantity > stockQuantity
      : false;

    return quantityExceedsMax || this.quantity < 1 || !isAvailable;
  }

  get maxProduct(): number {
    return this.isSupportInventory
      ? this.getStockQuantity() - this.cartQuantity
      : Infinity;
  }

  private getStockQuantity(): number {
    const stockQuantity = this.isSupportInventory
      ? this.stockQuantity
      : Infinity;
    return stockQuantity;
  }
}
