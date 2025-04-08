import {
  VariantResponseType,
  ProductsRequestType,
  ProductsCountRequestType,
  BasicPaginatedInterface,
  ProductProviderInterface,
} from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { fetchProductVariant } from "api/Chat/Shopify/fetchProductVariant";
import {
  ProductGenericType,
  ProductsPagingType,
} from "core/models/Ecommerce/Cart/ProductGenericType";
import { fetchProducts } from "api/Chat/Shopify/fetchProducts";
import { denormalizeShopifyProducts } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/useFetchProducts";
import { fetchProductsCount } from "api/Chat/Shopify/fetchProductCount";
import produce from "immer";
import { fetchCurrenciesSupported } from "api/SleekPay/fetchCurrenciesSupported";
import { postSyncProduct } from "api/Chat/Shopify/postSyncProduct";

type ProductsStorage = {
  setLoading: (value: ((prevState: boolean) => boolean) | boolean) => void;
  loading: boolean;
  setActivePage: (value: ((prevState: number) => number) | number) => void;
  activePage: number;
  setProducts: (
    value:
      | ((
          prevState: ProductsPagingType | undefined
        ) => ProductsPagingType | undefined)
      | ProductsPagingType
      | undefined
  ) => void;
  products: ProductsPagingType | undefined;
};

export class ShopifyProductProvider
  implements BasicPaginatedInterface, ProductProviderInterface
{
  constructor(
    private pageSize: number,
    private defaultCurrency: string,
    private products: ProductsStorage
  ) {}

  getPage(): number {
    return this.products.activePage;
  }

  getPageSize(): number {
    return this.pageSize;
  }

  getIsSupportInventory(): boolean {
    return true;
  }

  getProductsLoaded(): ProductsPagingType | null {
    return this.products.products ?? null;
  }

  getIsLoading(): boolean {
    return false;
  }

  async fetchCurrencies(storeId: string | number): Promise<string[]> {
    const result = await fetchCurrenciesSupported();
    return result.stripeSupportedCurrenciesMappings.map((m) => m.currency);
  }

  getDefaultCurrency(currencies: string[]): string {
    return this.defaultCurrency;
  }

  fetchFirstPage(request: {
    currency: string;
    storeId: number | string;
  }): void {
    Promise.all([
      this.fetchProductsCount({ storeId: request.storeId }),
      this.fetchProductsPage({
        storeId: request.storeId,
        page: 1,
        currency: request.currency,
      }),
    ]).then(([productCount, productList]) => {
      this.products.setProducts({ items: productList, count: productCount });
    });
  }

  async fetchProductsCount(request: ProductsCountRequestType): Promise<number> {
    const requestNormalized: any = {
      shopifyId: request.storeId,
    };
    if (request.title) {
      requestNormalized.title = request.title;
    }
    const result = await fetchProductsCount(requestNormalized);
    return result.count;
  }

  updateProductVariants(product: ProductGenericType): void {
    this.products.setProducts(
      produce(this.products.products, (draft) => {
        if (draft?.items) {
          const foundIndex = draft.items.findIndex(
            (p) => p.productId === product.productId
          );
          if (foundIndex > -1) {
            draft.items[foundIndex] = product;
          }
        }
      })
    );
  }

  async fetchProductVariant(
    storeId: any,
    productId: any,
    currency: string
  ): Promise<VariantResponseType> {
    const result = await fetchProductVariant({ productId, shopifyId: storeId });
    return {
      variants: result.map((value) => {
        const prices = !value.multipleCurrencies
          ? [
              {
                amount: value.price,
                code: currency,
              },
            ]
          : value.multipleCurrencies.map((c) => ({
              code: c.currencyCode,
              amount: c.amount,
            }));
        return {
          ...value,
          multipleCurrencies: value.multipleCurrencies,
          prices: prices,
          id: value.id,
          inventory_quantity: value.inventory_quantity,
        };
      }),
    };
  }

  async fetchProductsPage(
    request: ProductsRequestType
  ): Promise<ProductGenericType[]> {
    const requestNormalized = {
      shopifyId: request.storeId,
      offset: (request.page - 1) * this.pageSize,
      limit: this.pageSize,
    };
    this.products.setActivePage(request.page);

    const productList = await fetchProducts(requestNormalized);
    const items = denormalizeShopifyProducts(
      productList.items,
      request.currency
    );

    this.products.setProducts((prevState) => {
      return {
        count: prevState?.count ?? items.length,
        items,
      };
    });
    return items;
  }

  async suggestProducts(
    storeId: string | number,
    text: string,
    currency: string
  ): Promise<ProductGenericType[]> {
    const requestNormalized = {
      shopifyId: storeId as number,
      offset: 0,
      limit: this.pageSize,
      title: text,
    };
    const productList = await fetchProducts(requestNormalized);
    return denormalizeShopifyProducts(productList.items, currency);
  }

  async searchProducts(
    storeId: string | number,
    text: string,
    currency: string
  ): Promise<void> {
    const requestNormalized = {
      shopifyId: storeId as number,
      offset: 0,
      limit: this.pageSize,
      title: text,
    };
    const productList = await fetchProducts(requestNormalized);
    this.products.setProducts((prevState) => {
      return {
        count: prevState?.count ?? productList.items.length,
        items: denormalizeShopifyProducts(productList.items, currency),
      };
    });
  }

  async syncShopifyProduct(storeId: string | number) {
    await postSyncProduct(storeId);
  }
}
