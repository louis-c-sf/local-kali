import {
  ProductGenericType,
  ProductsPagingType,
} from "core/models/Ecommerce/Cart/ProductGenericType";
import { ShoppingVendorType } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { isFunction } from "lodash-es";

export interface ProductProviderInterface extends BasicPaginatedInterface {
  fetchProductVariant: (
    storeId: any,
    productId: any,
    currency: string
  ) => Promise<VariantResponseType>;

  suggestProducts: (
    storeId: string | number,
    text: string,
    currency: string
  ) => Promise<ProductGenericType[]>;

  searchProducts: (
    storeId: string | number,
    text: string,
    currency: string //todo remove if all the prices could be denormalized at once
  ) => Promise<void>;

  fetchProductsPage: (
    request: ProductsRequestType
  ) => Promise<ProductGenericType[]>;

  getIsSupportInventory(): boolean;

  fetchFirstPage(request: { currency: string; storeId: number | string }): void;

  getProductsLoaded(): ProductsPagingType | null;

  getIsLoading(): boolean;

  updateProductVariants(product: ProductGenericType): void;

  fetchCurrencies(storeId: string | number): Promise<string[]>;

  getDefaultCurrency(currencies: string[]): string;
}

export interface ProductsCountRequestType {
  storeId: number | string;
  title?: string;
}

export interface ProductsRequestType {
  page: number;
  currency: string;
  storeId: any;
}

export interface ProductVariantGenericType {
  id: number | string;
  inventory_quantity: number;
  prices: Array<{ code: string; amount: number }>;
  multipleCurrencies?: Array<{
    name: string;
    currencyCode: string;
    amount: number;
  }>;
}

export interface VariantResponseType {
  variants: ProductVariantGenericType[];
}

export interface ProductVariantOptionGenericType {
  id: number | string;
  stock: number;
  price: number;

  [key: string]: string | number;
}

export interface ProductOptionGenericType {
  name: string;
  values: string[];
  id: number;
}

export interface StoreOptionType {
  id: number | string;
  name: string;
  isShowInInbox: boolean;
  vendor: ShoppingVendorType;
  language: string;
  languages: Array<{ code: string; name: string }>;
}

export interface BasicPaginatedInterface {
  getPageSize(): number;

  getPage(): number;
}

export interface GroupPaginatedInterface {
  getPage(): number;

  getPageSize(): number;

  getPagesPerGroup(): number;

  getGroupResultCount(): number;

  getPrevToken(): string | null;

  getNextToken(): string | null;

  handlePageChange(page: number): void;

  handlePrevGroup(): void;

  handleNextGroup(): void;
}

export function isSimplePaginated(x: object): x is BasicPaginatedInterface {
  return (
    isFunction((x as any).getPageSize) &&
    !isFunction((x as any).getPagesPerGroup)
  );
}

export function isGroupPaginated(x: object): x is GroupPaginatedInterface {
  return (
    isFunction((x as any).getPageSize) &&
    isFunction((x as any).getPagesPerGroup)
  );
}
