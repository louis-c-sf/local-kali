import {
  CommerceHubApi,
  SleekflowApisCommerceHubModelCartLineItem,
  SleekflowApisCommerceHubModelDiscount,
  SleekflowApisCommerceHubModelProductDto,
  SleekflowApisCommerceHubModelRenderedTemplate,
  SleekflowApisCommerceHubModelStoreDto,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { expand, map, Observable, take, toArray } from 'rxjs';

import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';

@injectable()
export class CustomCatalogService {
  constructor(
    @inject(CommerceHubApi)
    private commerceHubApi: CommerceHubApi,
  ) {}

  public getSupportedLanguages$() {
    return this.commerceHubApi
      .commerceHubLanguagesGetLanguagesPost()
      .pipe(map((resp) => resp.data?.languages || []));
  }

  public getSupportedCurrencies$(storeId: string) {
    return this.commerceHubApi
      .commerceHubCurrenciesGetSupportedCurrenciesPost({
        travisBackendControllersSleekflowControllersCommerceHubControllerGetSupportedCurrenciesRequest:
          {
            store_id: storeId,
          },
      })
      .pipe(map((resp) => resp.data?.currencies || []));
  }

  public getStores$(
    isViewEnabled?: boolean,
    isPaymentEnabled?: boolean,
  ): Observable<SleekflowApisCommerceHubModelStoreDto[]> {
    // Define the internal function that will be called recursively
    const fetchStores = (
      continuationToken: string | null,
    ): Observable<{
      stores: SleekflowApisCommerceHubModelStoreDto[];
      nextContinuationToken: string | null | undefined;
    }> => {
      return this.commerceHubApi
        .commerceHubStoresGetStoresPost({
          travisBackendControllersSleekflowControllersCommerceHubControllerGetStoresRequest:
            {
              is_view_enabled: isViewEnabled,
              is_payment_enabled: isPaymentEnabled,
              continuation_token: continuationToken,
              limit: 10,
            },
        })
        .pipe(
          map((resp) => {
            // Emit the stores along with continuation token if exists
            return {
              stores: resp.data?.stores || [],
              nextContinuationToken: resp.data?.next_continuation_token,
            };
          }),
        );
    };

    // Start the recursive fetch with the initial token
    return fetchStores(null).pipe(
      // Recursively fetch more stores using expand
      expand(({ nextContinuationToken }) => {
        // If there's a continuation token, fetch the next set of stores
        return nextContinuationToken ? fetchStores(nextContinuationToken) : [];
      }),

      // Extract the stores from each emitted object
      map(({ stores }) => stores),

      // Concatenate all the store arrays into a single array
      toArray(),

      // Flatten the arrays of stores into a single array
      map((arrays) => arrays.reduce((acc, val) => acc.concat(val), [])),

      take(1),
    );
  }

  public getCart$(
    storeId: string,
    userProfileId: string,
    currencyIsoCode: string,
    languageIsoCode: string,
  ) {
    return this.commerceHubApi
      .commerceHubCartsGetCalculatedCartPost({
        travisBackendControllersSleekflowControllersCommerceHubControllerGetCalculatedCartRequest:
          {
            store_id: storeId,
            user_profile_id: userProfileId,
            currency_iso_code: currencyIsoCode,
            language_iso_code: languageIsoCode,
          },
      })
      .pipe(
        map((resp) => {
          return resp.data!.calculated_cart!;
        }),
      );
  }

  public clearCart$(storeId: string, userProfileId: string) {
    return this.commerceHubApi
      .commerceHubCartsClearCartPost({
        travisBackendControllersSleekflowControllersCommerceHubControllerClearCartRequest:
          {
            store_id: storeId,
            user_profile_id: userProfileId,
          },
      })
      .pipe(
        map((resp) => {
          return resp.data!.cart;
        }),
      );
  }

  public updateCartItem$(
    storeId: string,
    userProfileId: string,
    productVariantId: string,
    productId: string,
    quantity: number,
  ) {
    return this.commerceHubApi
      .commerceHubCartsUpdateCartItemPost({
        travisBackendControllersSleekflowControllersCommerceHubControllerUpdateCartItemRequest:
          {
            user_profile_id: userProfileId,
            store_id: storeId,
            product_variant_id: productVariantId,
            product_id: productId,
            quantity: quantity,
          },
      })
      .pipe(
        map((resp) => {
          return resp.data!.cart!;
        }),
      );
  }

  public updateCart$(
    storeId: string,
    userProfileId: string,
    lineItems: SleekflowApisCommerceHubModelCartLineItem[],
    cartDiscount: SleekflowApisCommerceHubModelDiscount | undefined,
  ) {
    return this.commerceHubApi
      .commerceHubCartsUpdateCartPost({
        travisBackendControllersSleekflowControllersCommerceHubControllerUpdateCartRequest:
          {
            user_profile_id: userProfileId,
            store_id: storeId,
            line_items: lineItems,
            cart_discount: cartDiscount,
          },
      })
      .pipe(
        RxjsUtils.getRetryAPIRequest(),
        map((resp) => {
          return resp.data!.cart!;
        }),
      );
  }

  public getProductMessagePreview$(
    storeId: string,
    productVariantId: string,
    productId: string,
    currencyIsoCode: string,
    languageIsoCode: string,
  ): Observable<SleekflowApisCommerceHubModelRenderedTemplate> {
    return this.commerceHubApi
      .commerceHubProductsGetProductMessagePreviewPost({
        travisBackendControllersSleekflowControllersCommerceHubControllerGetProductMessagePreviewRequest:
          {
            store_id: storeId,
            product_variant_id: productVariantId,
            product_id: productId,
            currency_iso_code: currencyIsoCode,
            language_iso_code: languageIsoCode,
          },
      })
      .pipe(
        map((resp) => {
          return resp.data!.message_preview!;
        }),
      );
  }

  public searchProducts$(
    storeId: string,
    searchText: string,
    limit: number,
    continuationToken: string | null,
    isViewEnabled?: boolean,
  ): Observable<{
    nextContinuationToken?: string | null;
    totalCount: number;
    products: SleekflowApisCommerceHubModelProductDto[];
  }> {
    return this.commerceHubApi
      .commerceHubProductsSearchProductsPost({
        travisBackendControllersSleekflowControllersCommerceHubControllerSearchProductsRequest:
          {
            continuation_token: continuationToken,
            store_id: storeId,
            limit: limit,
            filter_groups: isViewEnabled
              ? [
                  {
                    filters: [
                      {
                        field_name: 'is_view_enabled',
                        operator: '=',
                        value: isViewEnabled,
                      },
                    ],
                  },
                ]
              : [],
            search_text: searchText === '' ? undefined : searchText,
          },
      })
      .pipe(
        map((resp) => {
          // Emit the products along with continuation token if exists
          return {
            products: resp.data?.products || [],
            totalCount: resp.data?.total_count || 0,
            nextContinuationToken: resp.data?.next_continuation_token,
          };
        }),
      );
  }

  public getProductVariant$(
    storeId: string,
    productId: string,
    productVariantId: string,
  ) {
    return this.commerceHubApi
      .commerceHubProductsGetProductPost({
        travisBackendControllersSleekflowControllersCommerceHubControllerGetProductRequest:
          {
            store_id: storeId,
            product_id: productId,
          },
      })
      .pipe(
        map((resp) => {
          return {
            productVariant: resp.data?.product?.product_variants?.find(
              (pv) => pv.id === productVariantId,
            ),
            product: resp.data?.product,
          };
        }),
      );
  }

  public getMessagePreview$(
    storeId: string,
    productId: string,
    productVariantId: string,
    currencyIsoCode: string,
    languageIsoCode: string,
  ) {
    return this.commerceHubApi
      .commerceHubProductsGetProductMessagePreviewPost({
        travisBackendControllersSleekflowControllersCommerceHubControllerGetProductMessagePreviewRequest:
          {
            store_id: storeId,
            product_variant_id: productVariantId,
            product_id: productId,
            currency_iso_code: currencyIsoCode,
            language_iso_code: languageIsoCode,
          },
      })
      .pipe(
        map((resp) => {
          return resp.data?.message_preview;
        }),
      );
  }
}
