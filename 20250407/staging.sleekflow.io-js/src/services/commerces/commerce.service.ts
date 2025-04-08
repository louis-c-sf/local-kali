import {
  SleekflowApisCommerceHubModelStoreDto,
  SleekPayUserProfileUserProfileIdPaymentsGetRequest,
  StripePaymentApi,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { combineLatest, map, Observable, ReplaySubject } from 'rxjs';

import {
  CACHE_REFRESHING_BEHAVIOUR,
  RxjsUtils,
} from '@/services/rxjs-utils/rxjs-utils';

import { CustomCatalogService } from './custom-catalogs/custom-catalog.service';
import { ShopifyService, ShopifyStoreDto } from './shopify/shopify.service';
import type { CustomerStripePayments } from './stripe-payments/customer-stripe-payments-data-source';
import { StripePaymentStatus } from './stripe-payments/constants';

@injectable()
export class CommerceService {
  constructor(
    @inject(CustomCatalogService)
    private customCatalogService: CustomCatalogService,
    @inject(ShopifyService)
    private shopifyService: ShopifyService,
    @inject(StripePaymentApi)
    private stripePaymentApi: StripePaymentApi,
  ) {}

  private storesReplaySubject$$?: ReplaySubject<{
    shopifyStores: ShopifyStoreDto[];
    commerceHubStores: SleekflowApisCommerceHubModelStoreDto[];
  }> = undefined;

  public getStores$(
    cacheRefreshingBehaviour: CACHE_REFRESHING_BEHAVIOUR = CACHE_REFRESHING_BEHAVIOUR.NEVER_REFRESH,
  ): Observable<{
    shopifyStores: ShopifyStoreDto[];
    commerceHubStores: SleekflowApisCommerceHubModelStoreDto[];
  }> {
    const { replaySubject$$: storesReplaySubject$$, observable$: stores$ } =
      RxjsUtils.cacheAndRetryObservable(
        () => this.storesReplaySubject$$,
        combineLatest([
          this.shopifyService.getShopifyStores$(),
          this.customCatalogService.getStores$(),
        ]).pipe(
          map(([shopifyStores, commerceHubStores]) => {
            return {
              shopifyStores,
              commerceHubStores,
            };
          }),
        ),
        cacheRefreshingBehaviour ===
          CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
      );

    this.storesReplaySubject$$ = storesReplaySubject$$;

    if (
      cacheRefreshingBehaviour ===
      CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT
    ) {
      return this.storesReplaySubject$$.asObservable();
    }

    return stores$;
  }

  public getCustomerStripePayments$(
    params: Omit<
      SleekPayUserProfileUserProfileIdPaymentsGetRequest,
      'status'
    > & { status: StripePaymentStatus },
  ) {
    return this.stripePaymentApi.sleekPayUserProfileUserProfileIdPaymentsGet(
      params as unknown as SleekPayUserProfileUserProfileIdPaymentsGetRequest,
    ) as unknown as Observable<CustomerStripePayments>;
  }
}
