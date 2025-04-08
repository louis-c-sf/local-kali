import {
  ShopifyApi,
  ShopifyDraftOrderApi,
  ShopifyProductApi,
  ShopifySharpProductImage,
  StripePaymentApi,
  UserProfileApi,
  UserprofileShopifyAbandonedUserProfileIdGetRequest,
  UserprofileShopifyOrderUserProfileIdGetRequest,
  TravisBackendIntegrationServicesModelsShopifyProduct,
  TravisBackendIntegrationServicesViewModelsDiscountOption,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import DOMPurify from 'dompurify';
import { inject, injectable } from 'inversify';
import {
  catchError,
  combineLatest,
  expand,
  map,
  Observable,
  of,
  switchMap,
  take,
  toArray,
} from 'rxjs';

import { formatCurrency } from '@/i18n/number/formatCurrency';
import type { UnifiedMessageShopifySharedProduct } from '@/services/conversation-inputs/my-conversation-input-view-model';
import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';

export function findShopifyProductCoverImage({
  images,
  imageId,
}: {
  images: ShopifySharpProductImage[] | null | undefined;
  imageId: number | null | undefined;
}) {
  if (!images || images.length === 0) {
    return undefined;
  }

  const targetCoverImage = images.find((x) => x.id === imageId);

  return targetCoverImage || images[0];
}

export interface ShopifyStoreDto {
  id: number;
  name: string;
  usersMyShopifyUrl: string;
  accessToken: string;
  createdAt: string;
  lastUpdatedAt: string;
  status: string;
  currency: string;
  isShopifySubscriptionPaid: boolean;
  isShowInInbox: boolean;
  isEnabledDiscounts: boolean;
  supportedCountries: string[];
  billRecord: {
    id: number;
    companyId: string;
    subscriptionPlanId: string;
    periodStart: string;
    periodEnd: string;
    status: number;
    paymentStatus: number;
    payAmount: number;
    amount_due: number;
    amount_paid: number;
    amount_remaining: number;
    currency: string;
    created: string;
    quantity: number;
    cmsSalesPaymentRecords: any[];
    updatedAt: string;
    subscriptionTier: number;
    isFreeTrial: boolean;
    paidByReseller: boolean;
    isCustomized: boolean;
  };
  paymentLinkSetting?: {
    isPaymentLinkEnabled: boolean;
    paymentLinkOption: number;
  };
}

export interface ShopifyAbandonedCart {
  id: string;
  cartToken: string;
  companyId: string;
  userProfileId: string;
  date: string;
  abandonedURL: string;
  lineItems: ShopifyAbandonedCartLineItem[];
  status: number;
  currency: string;
  totalDiscounts: number;
  totalLineItemsPrice: number;
  totalPrice: number;
  totalTax: number;
  subtotalPrice: number;
  customerId: string;
}

export interface ShopifyAbandonedCartLineItem {
  imageURL: string;
  tags: string;
  fulfillment_service: string;
  gift_card: boolean;
  grams: number;
  presentment_title: string;
  presentment_variant_title: string;
  product_id: number;
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  taxable: boolean;
  title: string;
  variant_id: number;
  variant_price: string;
  vendor: string;
  price: number;
}

@injectable()
export class ShopifyService {
  constructor(
    @inject(ShopifyApi)
    private shopifyApi: ShopifyApi,
    @inject(ShopifyProductApi)
    private shopifyProductApi: ShopifyProductApi,
    @inject(StripePaymentApi)
    private stripePaymentApi: StripePaymentApi,
    @inject(UserProfileApi)
    private userProfileApi: UserProfileApi,
    @inject(ShopifyDraftOrderApi)
    private shopifyDraftOrderApi: ShopifyDraftOrderApi,
  ) {}

  private getTextFromHtml(html: string) {
    const purifiedHtml = DOMPurify.sanitize(html);

    return purifiedHtml
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n\s*\n/g, '\n');
  }

  public getShopifyProductSharedTemplate$(
    shopifyId: number,
    product: TravisBackendIntegrationServicesModelsShopifyProduct,
    userProfileId: string,
    productVariantId: number,
  ): Observable<UnifiedMessageShopifySharedProduct> {
    // [{"title":"「香港人」全棉可重用口罩 “HKer” 3-Ply Design Cotton Facewear","url":"https://sleekflow-share-tracking-uat.azurewebsites.net/TR89HBJ9"}]
    const trackedLink$ = this.shopifyProductApi
      .shopifyProductShareGet({
        shopifyId: shopifyId,
        productId: '' + product.id,
        userProfileId: userProfileId,
      })
      .pipe(
        map((resp: any) => {
          return resp as {
            title: string;
            url: string;
          }[];
        }),
        map((resp) => {
          return resp.length > 0 ? resp[0].url : '';
        }),
      );

    const product$ = of(product);

    const shopifyStore$ = this.getShopifyStores$().pipe(
      map((s) => s.find((s) => s.id === shopifyId)),
    );

    return combineLatest([trackedLink$, product$, shopifyStore$]).pipe(
      switchMap((tuple) => {
        const trackedLink = tuple[0];
        const product = tuple[1];
        const shopifyStore = tuple[2];

        return this.stripePaymentApi
          .sleekPayMessageTemplateGet({
            messageType: 'GeneralProductMessage' as any,
          })
          .pipe(
            map((resp: any) => {
              const typedResp = resp as {
                messageType: string;
                messageBody: string;
                params: string[];
                createdAt: string;
                updatedAt: string;
                id: number;
              }[];

              const productVariant = product.variants?.find(
                (v) => v.id === productVariantId,
              );

              if (!productVariant) {
                throw new Error('Product variant not found');
              }

              const title = product?.title || '';
              const currency = shopifyStore?.currency || '$';
              const price = productVariant?.price || 0;
              const description = this.getTextFromHtml(product.body_html || '');
              const messageBody = typedResp[0].messageBody;
              const image = findShopifyProductCoverImage({
                images: product?.images,
                imageId: productVariant?.image_id,
              });
              const variantString = Object.entries(productVariant)
                .filter(([key]) => key.startsWith('option'))
                .map(([, value]) => value)
                .join(', ');

              const text = `${title}\n${formatCurrency(
                price,
                currency,
              )}\n\nDescription:\n${description}\n\nVariation: ${variantString}\n\n${trackedLink}\n${messageBody}`;

              return {
                coverImageUrl: image?.src || '',
                messagePreview: text,
                product: product,
              };
            }),
          );
      }),
    );
  }

  public searchShopifyProducts$(
    shopifyId: number,
    searchKeyword: string,
    offset: number,
    limit: number,
  ) {
    return this.shopifyProductApi.shopifyProductGet({
      shopifyId: shopifyId,
      title: searchKeyword,
      offset: offset,
      limit: limit,
    });
  }

  public getShopifyStores$(): Observable<ShopifyStoreDto[]> {
    // Define the internal function that will be called recursively
    const fetchStores = (
      offset: number,
    ): Observable<{ stores: ShopifyStoreDto[] }> => {
      return this.shopifyApi
        .companyShopifyStatusListGet({
          limit: 10,
          offset: offset,
        })
        .pipe(
          map((resp: unknown) => {
            // Emit the stores
            return {
              stores: (resp || []) as ShopifyStoreDto[],
            };
          }),
        );
    };

    // Start the recursive fetch with the initial token
    return fetchStores(0).pipe(
      // Recursively fetch more stores using expand
      expand(({ stores }) => {
        // If there's a continuation token, fetch the next set of stores
        return stores.length == 10 ? fetchStores(stores.length) : [];
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

  public getUserShopifyOrders$(
    params: UserprofileShopifyOrderUserProfileIdGetRequest,
  ) {
    return this.userProfileApi
      .userprofileShopifyOrderUserProfileIdGet(params)
      .pipe(
        RxjsUtils.getRetryAPIRequest(),
        catchError(() => of({ total: 0, results: [] })),
      );
  }

  public getUserShopifyAbandonedCart$(
    params: UserprofileShopifyAbandonedUserProfileIdGetRequest,
  ) {
    return (
      this.userProfileApi
        .userprofileShopifyAbandonedUserProfileIdGet as unknown as (
        params: UserprofileShopifyAbandonedUserProfileIdGetRequest,
      ) => Observable<ShopifyAbandonedCart>
    )(params).pipe(RxjsUtils.getRetryAPIRequest());
  }

  public createShopifyDraftOrder$(
    shopifyId: number,
    userProfileId: string,
    draftOrderLineItems: {
      variantId: number;
      quantity: number;
      discountOption: TravisBackendIntegrationServicesViewModelsDiscountOption;
    }[],
  ) {
    return this.shopifyDraftOrderApi
      .shopifyDraftOrderPost({
        shopifyId: shopifyId,
        travisBackendIntegrationServicesViewModelsDraftOrderRequest: {
          userProfileId: userProfileId,
          draftOrderLineItems: draftOrderLineItems,
        },
      })
      .pipe(
        map((resp: any) => {
          return resp as {
            name: string;
            note: string;
            email: string;
            currency: string;
            invoice_url: string;
            sleekflow_url: string;
            tags: string;
            tax_exempt: boolean;
            tax_lines: {
              price: number;
              rate: number;
              title: string;
            }[];
            taxes_included: boolean;
            total_tax: number;
            subtotal_price: number;
            total_price: number;
            created_at: string;
            updated_at: string;
            status: string;
            id: number;
            admin_graphql_api_id: string;
          };
        }),
        RxjsUtils.getRetryAPIRequest(),
      );
  }
}
