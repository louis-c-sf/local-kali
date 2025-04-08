import {
  ProductProviderInterface,
  VariantResponseType,
  ProductsRequestType,
  GroupPaginatedInterface,
} from "core/models/Ecommerce/Cart/ProductProviderInterface";
import {
  ProductGenericType,
  ProductsPagingType,
} from "core/models/Ecommerce/Cart/ProductGenericType";
import { fetchSearchStoreProducts } from "api/CommerceHub/fetchSearchStoreProducts";
import { ProductListInterface } from "features/Ecommerce/usecases/Settings/CustomStore/EditStore/ProductsTab/useProductListApi";
import { toGenericProduct } from "features/Ecommerce/vendor/CommerceHub/toGenericProduct";
import { fetchStoreCurrencies } from "api/CommerceHub/fetchStoreCurrencies";

export class CommerceHubProductProvider
  implements ProductProviderInterface, GroupPaginatedInterface
{
  constructor(
    private pageSize: number,
    private pagesPerGroup: number,
    private listApi: ProductListInterface
  ) {}

  getGroupResultCount(): number {
    return this.listApi.groupItemsCount;
  }

  getPrevToken(): string | null {
    return this.listApi.prevToken;
  }

  async fetchCurrencies(storeId: string | number): Promise<string[]> {
    const currencies = await fetchStoreCurrencies(storeId as string);
    return currencies.data.currencies.map((cur) => cur.currency_iso_code);
  }

  getDefaultCurrency(currencies: string[]): string {
    const [defaultCurrency] = currencies;
    return defaultCurrency;
  }

  getNextToken(): string | null {
    return this.listApi.nextToken;
  }

  getPageSize(): number {
    return this.pageSize;
  }

  getPagesPerGroup(): number {
    return this.pagesPerGroup;
  }

  getPage(): number {
    return this.listApi.page;
  }

  getIsSupportInventory(): boolean {
    return false;
  }

  getIsLoading(): boolean {
    return this.listApi.loading;
  }

  getProductsLoaded(): ProductsPagingType | null {
    return {
      items: this.listApi.items.map(toGenericProduct),
      count: this.listApi.groupItemsCount,
    };
  }

  updateProductVariants(product: ProductGenericType): void {
    //todo when the variants would be supported
    throw new Error("Method not implemented.");
  }

  handlePageChange(page: number): void {
    return this.listApi.setPage(page);
  }

  handleNextGroup(): void {
    this.listApi.loadNextPageGroup();
  }

  handlePrevGroup(): void {
    this.listApi.loadPrevPageGroup();
  }

  fetchProductVariant(
    storeId: any,
    productId: any
  ): Promise<VariantResponseType> {
    //todo when the variants would be supported
    return Promise.resolve({ variants: [] });
  }

  fetchFirstPage(request: {
    currency: string;
    storeId: number | string;
  }): void {
    this.listApi.boot();
  }

  async suggestProducts(
    storeId: string | number,
    text: string,
    currency: string
  ): Promise<ProductGenericType[]> {
    const response = await fetchSearchStoreProducts(
      storeId as string,
      text,
      null,
      this.getPageSize(),
      true,
      true
    );
    return response.data.products.map(toGenericProduct);
  }

  async searchProducts(
    storeId: string | number,
    text: string,
    currency: string
  ): Promise<void> {
    this.listApi.searchBy(text);
  }

  async fetchProductsPage(
    request: ProductsRequestType
  ): Promise<ProductGenericType[]> {
    return this.getProductsLoaded()?.items ?? [];
  }
}
